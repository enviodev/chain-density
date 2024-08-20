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
    if request_type == "event":
        df = pl.read_parquet(f"{directory}/logs.parquet")
    else:
        df = pl.read_parquet(f"{directory}/transactions.parquet")

    return df.to_pandas()


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


def create_plot(directory, request_type, total_blocks, total_items, elapsed_time, start_block, is_cached):
    logger.info("Entering create_plot function")
    try:
        logger.info("Creating figure")
        plt.figure(figsize=(15, 7))  # Width, Height in inches

        logger.info(f"Request type: {request_type}")
        is_event_request = request_type == "event"
        file_suffix = 'logs' if is_event_request else 'transactions'
        file_path = f"{directory}/{file_suffix}.parquet"
        logger.info(f"Reading Parquet file: {file_path}")
        df = pl.read_parquet(file_path)
        logger.info(f"Parquet file read successfully. Shape: {df.shape}")

        logger.info("Calculating interval size")
        min_block = df['block_number'].min()
        max_block = df['block_number'].max()
        logger.info(f"Min block: {min_block}, Max block: {max_block}")
        interval_size = max(5000, round_based_on_magnitude(
            (max_block - min_block) / 50))
        min_block_rounded = min_block - (min_block % interval_size)
        intervals = range(int(min_block_rounded), int(
            max_block) + interval_size, interval_size)
        logger.info(f"Interval size: {interval_size}")

        logger.info("Creating intervals")
        df = df.with_columns(
            pl.col('block_number').cut(intervals).alias('interval')
        )
        logger.info("Counting occurrences")

        interval_counts = df.group_by('interval').count().sort('interval')
        logger.info(f"Interval counts calculated. Shape: {
                    interval_counts.shape}")

        logger.info("Generating x labels")
        x_labels = [f"{format_with_commas(left)}-{format_with_commas(right)}"
                    for left, right in zip(intervals[:-1], intervals[1:])]

        logger.info("Plotting data")
        ax = plt.gca()
        ax.bar(range(len(interval_counts)),
               interval_counts['count'], color='lightblue', edgecolor='black')

        ylabel = 'Number of Events' if is_event_request else 'Number of Transactions'
        title = (f'Number of Events per Block Interval (Size {interval_size})'
                 if is_event_request
                 else f'Number of Transactions per Block Interval (Size {interval_size})')

        plt.xlabel('Block Number Interval')
        plt.ylabel(ylabel)
        plt.title(title)
        plt.xticks(ticks=range(len(x_labels)),
                   labels=x_labels, rotation=45, ha='right')

        logger.info("Formatting y-axis and creating secondary axis")
        ax.get_yaxis().set_major_formatter(
            ticker.FuncFormatter(lambda x, p: format_with_commas(x)))
        ax2 = ax.twinx()

        logger.info("Calculating cumulative sum")
        cumulative_sum = interval_counts.select(
            pl.col('count').cumsum().alias('cumulative')
        )['cumulative']
        logger.info(f"Cumulative sum calculated. Length: {
                    len(cumulative_sum)}")

        ax2.plot(range(len(cumulative_sum)), cumulative_sum,
                 color='red', marker='o', linestyle='-')
        ax2.set_ylabel('Cumulative Total', color='red')
        ax2.tick_params(axis='y', colors='red')
        ax2.get_yaxis().set_major_formatter(
            ticker.FuncFormatter(lambda x, p: format_with_commas(x)))

        logger.info("Adjusting plot layout")
        plt.tight_layout()

        logger.info("Saving plot to buffer")
        buf = io.BytesIO()
        plt.savefig(buf, format='png', bbox_inches='tight')
        buf.seek(0)
        plot_url = base64.b64encode(buf.read()).decode('utf-8')
        buf.close()

        logger.info("Preparing stats")
        is_event = request_type == "event"
        item_type = "Events" if is_event else "Transactions"

        if start_block == 0:
            total_blocks = max(total_blocks, df['block_number'].max())

        stats = {
            'total_blocks': format_with_commas(total_blocks),
            'total_items': format_with_commas(total_items),
            'elapsed_time': f"{elapsed_time:.2f}",
            'blocks_per_second': format_with_commas(round(total_blocks / elapsed_time)),
            'items_per_second': format_with_commas(round(total_items / elapsed_time)),
            'is_event': is_event,
            'is_cached': is_cached
        }

        logger.info("Exiting create_plot function successfully")
        return f'data:image/png;base64,{plot_url}', stats

    except Exception as e:
        logger.error(f"Error in create_plot function: {str(e)}", exc_info=True)
        raise


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
