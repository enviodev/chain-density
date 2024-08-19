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
matplotlib.use('Agg')

CHAIN_DATA = {}


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


async def fetch_data(address, selected_network, network_url, request_type):
    client = hypersync.HypersyncClient(hypersync.ClientConfig(url=network_url))

    is_event_request = request_type == "event"
    directory = f"data/data_{selected_network}_{request_type}_{address}"
    file_suffix = 'logs' if is_event_request else 'transactions'
    file_path = f'{directory}/{file_suffix}.parquet'

    start_time = time.time()
    total_blocks = 0
    total_items = 0

    is_cached = os.path.exists(file_path)
    if is_cached:
        existing_df = pl.read_parquet(file_path)
        last_block = existing_df['block_number'].max()
        start_block = int(last_block) + 1
        print(f"Existing data found. Starting from block {start_block}")
    else:
        if not os.path.exists(directory):
            os.makedirs(directory)
        start_block = 0
        existing_df = None
        print("No existing data found. Starting from block 0")

    query = create_query(address, start_block, request_type)

    config = hypersync.StreamConfig(
        hex_output=hypersync.HexOutput.PREFIXED,
        column_mapping=ColumnMapping(
            log={
                LogField.BLOCK_NUMBER: DataType.INT64,
            },
            transaction={
                TransactionField.BLOCK_NUMBER: DataType.INT64,
            },
        ),
    )

    new_directory = f"{directory}_temp"
    try:
        print(f"Attempting to collect new data from block {start_block}")
        await client.collect_parquet(new_directory, query, config)
        print("Finished writing new parquet folder")

        new_file_path = f'{new_directory}/{file_suffix}.parquet'
        if not os.path.exists(new_file_path):
            print("No new data found.")
            if existing_df is not None:
                print("Using existing data as no new data was found")
                combined_df = existing_df
            else:
                raise ValueError("No existing data and no new data found.")
        else:
            new_df = pl.read_parquet(new_file_path)
            print(f"New data fetched: {len(new_df)} rows")

            if existing_df is not None:
                # Check if the schemas match
                if set(existing_df.columns) != set(new_df.columns):
                    print(
                        "Warning: Schema mismatch. Using only existing data. Likely change in HyperSync request not compatible with cached data")
                    combined_df = existing_df
                else:
                    combined_df = pl.concat([existing_df, new_df])
                    print(f"Combined data: {len(combined_df)} rows")
            else:
                combined_df = new_df

        combined_df = combined_df.sort("block_number")
        combined_df.write_parquet(file_path)
        print(f"Updated parquet file written to {file_path}")

        total_blocks = combined_df['block_number'].max(
        ) - combined_df['block_number'].min() + 1
        total_items = len(combined_df)
        print(f"Total blocks: {total_blocks}, Total events: {total_items}")

    except Exception as e:
        print(f"Error during data collection: {str(e)}")
        if existing_df is not None:
            print("Using existing data due to error in fetching new data")
            total_blocks = existing_df['block_number'].max(
            ) - existing_df['block_number'].min() + 1
            total_items = len(existing_df)
        else:
            print("No data available")
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
    plt.figure(figsize=(15, 7))  # Width, Height in inches

    # Determine if this is an event request and read the appropriate parquet file
    is_event_request = request_type == "event"
    file_suffix = 'logs' if is_event_request else 'transactions'
    df = analyze_data(directory, request_type)

    # Define the interval size
    min_block = df['block_number'].min()
    max_block = df['block_number'].max()
    interval_size = max(5000, round_based_on_magnitude(
        (max_block - min_block) / 50))
    min_block_rounded = min_block - (min_block % interval_size)
    intervals = range(int(min_block_rounded), int(
        max_block) + interval_size, interval_size)
    df['interval'] = pd.cut(df['block_number'], bins=intervals)

    # Generate x labels for the intervals
    x_labels = [f"{format_with_commas(left)}-{format_with_commas(right)}"
                for left, right in zip(intervals[:-1], intervals[1:])]

    interval_counts = df['interval'].value_counts().sort_index()
    ax = interval_counts.plot(kind='bar', color='lightblue', edgecolor='black')

    ylabel = 'Number of Events' if is_event_request else 'Number of Transactions'
    title = (f'Number of Events per Block Interval (Size {interval_size})'
             if is_event_request
             else f'Number of Transactions per Block Interval (Size {interval_size})')

    plt.xlabel('Block Number Interval')
    plt.ylabel(ylabel)
    plt.title(title)
    plt.xticks(ticks=range(len(x_labels)),
               labels=x_labels, rotation=45, ha='right')

    # Format the y-axis to show numbers with commas and create a secondary axis
    ax.get_yaxis().set_major_formatter(
        ticker.FuncFormatter(lambda x, p: format_with_commas(x)))
    ax2 = ax.twinx()
    ax2.plot(range(len(interval_counts)), interval_counts.cumsum(),
             color='red', marker='o', linestyle='-')
    ax2.set_ylabel('Cumulative Total', color='red')
    ax2.tick_params(axis='y', colors='red')
    ax2.get_yaxis().set_major_formatter(
        ticker.FuncFormatter(lambda x, p: format_with_commas(x)))

    plt.tight_layout()

    # Save the plot to a BytesIO buffer
    buf = io.BytesIO()
    plt.savefig(buf, format='png', bbox_inches='tight')
    buf.seek(0)
    plot_url = base64.b64encode(buf.read()).decode('utf-8')
    buf.close()

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

    return f'data:image/png;base64,{plot_url}', stats


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
