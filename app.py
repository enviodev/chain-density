import time
import shutil
import pyarrow.parquet as pq
import os
import base64
import io
import matplotlib.ticker as ticker
import matplotlib.pyplot as plt
from quart import Quart, request, render_template
import hypersync
from hypersync import LogSelection, LogField, DataType, FieldSelection, ColumnMapping, TransactionField, ClientConfig, JoinMode, TransactionSelection
import asyncio
import pandas as pd
import polars as pl
import matplotlib
import aiohttp
import logging
import pyarrow as pa
import numpy as np
import psutil
import signal

matplotlib.use('Agg')

CHAIN_DATA = {}

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def fetch_chain_data():
    async with aiohttp.ClientSession() as session:
        async with session.get('https://chains.hyperquery.xyz/active_chains') as response:
            data = await response.json()

    chain_data = {}
    for chain in data:
        chain_data[chain['name']] = {
            'chain_id': chain['chain_id'],
            'url': f"https://{chain['name']}.hypersync.xyz"
        }
    return chain_data

app = Quart(__name__)


@app.route('/', methods=['GET', 'POST'])
async def index():
    global CHAIN_DATA
    if not CHAIN_DATA:
        CHAIN_DATA = await fetch_chain_data()

    if request.method == 'POST':
        form_data = await request.form
        address = form_data['address'].lower()
        request_type = form_data['type']
        selected_network = form_data['network']
        network_url = CHAIN_DATA.get(selected_network, {}).get(
            'url', "https://eth.hypersync.xyz")
        try:
            directory, total_blocks, total_items, elapsed_time, start_block, is_cached = await fetch_data(address, selected_network, network_url, request_type)
            if total_items == 0:
                return await render_template('error.html', message=f"No {request_type}s found for {address} on the {selected_network} network.")
            img, stats = create_plot(
                directory, request_type, total_blocks, total_items, elapsed_time, start_block, is_cached)
            return await render_template('plot.html', plot_url=img, stats=stats)
        except Exception as e:
            error_message = str(e)
            print(f"Error: {error_message}")
            return await render_template('error.html', message=f"An unexpected error occurred. Error: {error_message}")

    sorted_networks = sorted(CHAIN_DATA.keys())
    return await render_template('index.html', networks=sorted_networks)


def create_query(address, start_block, request_type):
    if request_type == "event":
        query = hypersync.Query(
            from_block=start_block,
            logs=[LogSelection(
                address=[address],
            )],
            field_selection=FieldSelection(
                log=[
                    LogField.BLOCK_NUMBER,
                ],
            ),
        )
    else:
        query = hypersync.Query(
            from_block=start_block,
            transactions=[
                TransactionSelection(from_=[address]),
                TransactionSelection(to=[address]),
            ],
            field_selection=FieldSelection(
                transaction=[
                    TransactionField.BLOCK_NUMBER,
                ],
            ),
        )
    return query


def process_and_write_in_chunks(input_path, output_path, chunk_size=5_000_000):
    logger.info(f"Processing {input_path} in chunks of {chunk_size}")
    parquet_file = pl.scan_parquet(input_path)
    total_rows = parquet_file.select(pl.len()).collect().item()

    schema = None
    for i in range(0, total_rows, chunk_size):
        chunk = parquet_file.slice(i, chunk_size).collect()
        logger.info(f"Processing rows {i} to {i + len(chunk)}")
        chunk_sorted = chunk.sort("block_number")

        if schema is None:
            schema = pa.Schema.from_pandas(chunk_sorted.to_pandas())
            writer = pq.ParquetWriter(output_path, schema)

        table = pa.Table.from_pandas(chunk_sorted.to_pandas(), schema=schema)
        writer.write_table(table)

        logger.info(f"Written sorted chunk {
                    i // chunk_size + 1} to {output_path}")

    if schema is not None:
        writer.close()


async def fetch_data(address, selected_network, network_url, request_type):
    client = hypersync.HypersyncClient(hypersync.ClientConfig(url=network_url))

    is_event_request = request_type == "event"
    directory = f"data/data_{selected_network}_{request_type}_{address}"
    file_suffix = 'logs' if is_event_request else 'transactions'
    file_path = f'{directory}/{file_suffix}.parquet'

    start_time = time.time()
    total_blocks = 0
    total_items = 0

    if not os.path.exists(directory):
        os.makedirs(directory)
    is_cached = os.path.exists(file_path)

    if is_cached:
        existing_df = pl.scan_parquet(file_path)
        last_block = existing_df.select(
            pl.col("block_number").max()).collect().item()
        start_block = int(last_block) + 1
        logger.info(f"Existing data found. Starting from block {start_block}")
    else:
        start_block = 0
        existing_df = None
        logger.info("No existing data found. Starting from block 0")

    query = create_query(address, start_block, request_type)
    config = hypersync.StreamConfig(
        hex_output=hypersync.HexOutput.PREFIXED,
        column_mapping=ColumnMapping(
            log={LogField.BLOCK_NUMBER: DataType.INT64},
            transaction={TransactionField.BLOCK_NUMBER: DataType.INT64},
        ),
    )

    new_directory = f"{directory}_temp"
    try:
        logger.info(f"Attempting to collect new data from block {start_block}")
        await client.collect_parquet(new_directory, query, config)
        logger.info("Finished writing new parquet folder")

        new_file_path = f'{new_directory}/{file_suffix}.parquet'
        if not os.path.exists(new_file_path):
            logger.warning("No new data found.")
            if existing_df is not None:
                logger.info("Using existing data as no new data was found")
                combined_df = existing_df.collect()
            else:
                raise ValueError("No existing data and no new data found.")
        else:
            sorted_file_path = f"{directory}/sorted_{file_suffix}.parquet"
            process_and_write_in_chunks(new_file_path, sorted_file_path)

            if existing_df is not None:
                # Merge existing and new data
                combined_df = pl.concat(
                    [existing_df.collect(), pl.read_parquet(sorted_file_path)])
                combined_df.sort("block_number").write_parquet(file_path)
            else:
                # Just rename the sorted file to the final file name
                os.rename(sorted_file_path, file_path)

        # Calculate statistics
        final_df = pl.scan_parquet(file_path)
        stats = final_df.select([
            pl.col("block_number").min().alias("min_block"),
            pl.col("block_number").max().alias("max_block"),
            pl.count().alias("total_items")
        ]).collect()

        total_blocks = stats["max_block"][0] - stats["min_block"][0] + 1
        total_items = stats["total_items"][0]
        logger.info(f"Total blocks: {
                    total_blocks}, Total items: {total_items}")

    except Exception as e:
        logger.error(f"Error during data collection: {str(e)}", exc_info=True)
        if existing_df is not None:
            logger.info(
                "Using existing data due to error in fetching new data")
            stats = existing_df.select([
                pl.col("block_number").min().alias("min_block"),
                pl.col("block_number").max().alias("max_block"),
                pl.count().alias("total_items")
            ]).collect()
            total_blocks = stats["max_block"][0] - stats["min_block"][0] + 1
            total_items = stats["total_items"][0]
        else:
            logger.warning("No data available")
            total_blocks = 0
            total_items = 0

    finally:
        if os.path.exists(new_directory):
            shutil.rmtree(new_directory)

    elapsed_time = time.time() - start_time
    return directory, total_blocks, total_items, elapsed_time, start_block, is_cached


def analyze_data(directory, request_type):
    logger.info(f"Starting analyze_data function for {request_type}")
    file_path = f"{directory}/{'logs' if request_type ==
                               'event' else 'transactions'}.parquet"
    logger.info(f"Attempting to read Parquet file: {file_path}")

    try:
        df = pl.read_parquet(file_path)
        logger.info(f"Successfully read Parquet file. Shape: {df.shape}")
        return df
    except Exception as e:
        logger.error(f"Error reading or processing Parquet file: {
                     str(e)}", exc_info=True)
        raise


def format_with_commas(value):
    if isinstance(value, (int, float)):
        return f"{value:,}"
    return value


def check_parquet_file(file_path):
    try:
        parquet_file = pq.ParquetFile(file_path)
        print(f"{file_path} is a valid Parquet file with "
              f"{parquet_file.metadata.num_rows} rows.")
        return True
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        return False


def round_based_on_magnitude(number):
    if number < 100000:
        # Round to nearest 100000
        return round(number / 10000) * 10000
    else:
        # Round to nearest 1000000
        return round(number / 100000) * 100000


def log_memory_usage():
    process = psutil.Process(os.getpid())
    memory_info = process.memory_info()
    logger.info(f"Memory usage: {memory_info.rss / 1024 / 1024:.2f} MB")


def signal_handler(signum, frame):
    logger.error(f"Received signal {signum}. Exiting.")
    log_memory_usage()
    exit(1)


signal.signal(signal.SIGINT, signal_handler)
signal.signal(signal.SIGTERM, signal_handler)


def create_plot(directory, request_type, total_blocks, total_items, elapsed_time, start_block, is_cached):
    logger.info("Starting create_plot function")
    plt.figure(figsize=(15, 7))
    logger.info("Created figure with size (15, 7)")

    is_event_request = request_type == "event"
    file_suffix = 'logs' if is_event_request else 'transactions'
    logger.info(f"Request type: {request_type}, file_suffix: {file_suffix}")

    logger.info(f"Analyzing data from directory: {directory}")
    try:
        logger.info(f"Attempting to read file: {
                    directory}/{file_suffix}.parquet")
        df = pl.read_parquet(f"{directory}/{file_suffix}.parquet")
        logger.info(f"Data read successfully, DataFrame shape: {df.shape}")
    except Exception as e:
        logger.error(f"Error reading Parquet file: {str(e)}", exc_info=True)
        raise

    min_block = df['block_number'].min()
    max_block = df['block_number'].max()
    logger.info(f"Min block: {min_block}, Max block: {max_block}")

    interval_size = max(5000, round_based_on_magnitude(
        (max_block - min_block) / 50))
    logger.info(f"Calculated interval size: {interval_size}")

    min_block_rounded = min_block - (min_block % interval_size)
    intervals = np.arange(min_block_rounded, max_block +
                          interval_size, interval_size)
    logger.info(f"Created intervals, first: {
                intervals[0]}, last: {intervals[-1]}, total intervals: {len(intervals)}")

    logger.info("Calculating interval counts")
    log_memory_usage()

    try:
        chunk_size = 1_000_000  # Adjust this value based on your available memory
        interval_counts = None

        for chunk in df.iter_slices(chunk_size):
            logger.info(f"Processing chunk of size {len(chunk)}")
            chunk = chunk.with_columns([
                ((pl.col('block_number') - min_block_rounded) /
                 interval_size).floor().cast(pl.Int64).alias('interval_index')
            ])
            chunk_counts = chunk.group_by(
                'interval_index').agg(pl.len().alias('count'))

            logger.info(f"Chunk interval indices: min={
                        chunk_counts['interval_index'].min()}, max={chunk_counts['interval_index'].max()}")

            if interval_counts is None:
                interval_counts = chunk_counts
            else:
                interval_counts = pl.concat([interval_counts, chunk_counts])

            log_memory_usage()

        interval_counts = interval_counts.group_by(
            'interval_index').agg(pl.sum('count')).sort('interval_index')
        logger.info(f"Grouped by interval_index, shape: {
                    interval_counts.shape}")
        logger.info(f"Interval indices: min={interval_counts['interval_index'].min()}, max={
                    interval_counts['interval_index'].max()}")

        full_range = pl.DataFrame(
            {'interval_index': pl.arange(0, len(intervals)-1, eager=True)})
        interval_counts = full_range.join(
            interval_counts, on='interval_index', how='left').fill_null(0)

        interval_counts = interval_counts.with_columns([
            (pl.col('interval_index') * interval_size +
             min_block_rounded).alias('interval_start'),
            ((pl.col('interval_index') + 1) * interval_size +
             min_block_rounded).alias('interval_end')
        ])
        logger.info(f"Added interval boundaries, final shape: {
                    interval_counts.shape}")
        logger.info(f"First few rows of interval_counts:\n{
                    interval_counts.head()}")
        logger.info(f"Last few rows of interval_counts:\n{
                    interval_counts.tail()}")
        log_memory_usage()

    except Exception as e:
        logger.error(f"Error during interval count calculation: {
                     str(e)}", exc_info=True)
        log_memory_usage()
        raise

    # Convert to pandas for plotting
    try:
        interval_counts_pd = interval_counts.to_pandas()
        interval_counts_pd['interval'] = interval_counts_pd.apply(
            lambda row: f"{row['interval_start']}-{row['interval_end']}", axis=1)
        interval_counts_pd.set_index('interval', inplace=True)
        logger.info(f"Converted to pandas DataFrame, shape: {
                    interval_counts_pd.shape}")
        log_memory_usage()
    except Exception as e:
        logger.error(f"Error converting to pandas: {str(e)}", exc_info=True)
        log_memory_usage()
        raise

    logger.info("Plotting bar chart")
    ax = interval_counts_pd['count'].plot(
        kind='bar', color='lightblue', edgecolor='black')

    ylabel = 'Number of Events' if is_event_request else 'Number of Transactions'
    title = (f'Number of Events per Block Interval (Size {interval_size})'
             if is_event_request
             else f'Number of Transactions per Block Interval (Size {interval_size})')

    logger.info(f"Setting labels and title. Y-label: {ylabel}")
    plt.xlabel('Block Number Interval')
    plt.ylabel(ylabel)
    plt.title(title)

    logger.info("Setting x-axis ticks and labels")
    x_labels = [f"{format_with_commas(int(left))}-{format_with_commas(int(right))}"
                for left, right in zip(intervals[:-1], intervals[1:])]
    plt.xticks(ticks=range(len(x_labels)),
               labels=x_labels, rotation=45, ha='right')

    logger.info("Formatting y-axis with commas")
    ax.get_yaxis().set_major_formatter(
        ticker.FuncFormatter(lambda x, p: format_with_commas(x)))

    logger.info("Creating secondary y-axis")
    ax2 = ax.twinx()
    logger.info("Plotting cumulative sum on secondary y-axis")
    ax2.plot(range(len(interval_counts_pd)), interval_counts_pd['count'].cumsum(),
             color='red', marker='o', linestyle='-')
    ax2.set_ylabel('Cumulative Total', color='red')
    ax2.tick_params(axis='y', colors='red')
    ax2.get_yaxis().set_major_formatter(
        ticker.FuncFormatter(lambda x, p: format_with_commas(x)))

    logger.info("Adjusting layout")
    plt.tight_layout()

    logger.info("Saving plot to BytesIO buffer")
    buf = io.BytesIO()
    plt.savefig(buf, format='png', bbox_inches='tight')
    buf.seek(0)
    plot_url = base64.b64encode(buf.read()).decode('utf-8')
    buf.close()
    logger.info("Plot saved and encoded")

    is_event = request_type == "event"
    item_type = "Events" if is_event else "Transactions"
    logger.info(f"Item type: {item_type}")

    if start_block == 0:
        total_blocks = max(total_blocks, df['block_number'].max())
    logger.info(f"Total blocks: {total_blocks}")

    logger.info("Preparing stats dictionary")
    stats = {
        'total_blocks': format_with_commas(total_blocks),
        'total_items': format_with_commas(total_items),
        'elapsed_time': f"{elapsed_time:.2f}",
        'blocks_per_second': format_with_commas(round(total_blocks / elapsed_time)),
        'items_per_second': format_with_commas(round(total_items / elapsed_time)),
        'is_event': is_event,
        'is_cached': is_cached
    }
    logger.info("Stats dictionary created")

    logger.info("create_plot function completed")
    return f'data:image/png;base64,{plot_url}', stats


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
