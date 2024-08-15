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
matplotlib.use('Agg')


NETWORK_URLS = {
    "a1_milkomeda": "https://a1-milkomeda.hypersync.xyz",
    "arbitrum": "https://arbitrum.hypersync.xyz",
    "arbitrum_nova": "https://arbitrum-nova.hypersync.xyz",
    "aurora": "https://aurora.hypersync.xyz",
    "avalanche": "https://avalanche.hypersync.xyz",
    "base": "https://base.hypersync.xyz",
    "base_sepolia": "https://base-sepolia.hypersync.xyz",
    "berachain": "https://berachain-artio.hypersync.xyz",
    "blast_sepolia": "https://blast-sepolia.hypersync.xyz",
    "blast": "https://blast.hypersync.xyz",
    "boba": "https://boba.hypersync.xyz",
    "bsc": "https://bsc.hypersync.xyz",
    "c1_milkomeda": "https://c1-milkomeda.hypersync.xyz",
    "celo": "https://celo.hypersync.xyz",
    "eth": "https://eth.hypersync.xyz",
    "fantom": "https://fantom.hypersync.xyz",
    "flare": "https://flare.hypersync.xyz",
    "gnosis": "https://gnosis.hypersync.xyz",
    "gnosis_chiado": "https://gnosis-chiado.hypersync.xyz",
    "goerli": "https://goerli.hypersync.xyz",
    "harmony": "https://harmony-shard-0.hypersync.xyz",
    "holesky": "https://holesky.hypersync.xyz",
    "kroma": "https://kroma.hypersync.xyz",
    "linea": "https://linea.hypersync.xyz",
    "lukso": "https://lukso.hypersync.xyz",
    "manta": "https://manta.hypersync.xyz",
    "mantle": "https://mantle.hypersync.xyz",
    "metis": "https://metis.hypersync.xyz",
    "moonbeam": "https://moonbeam.hypersync.xyz",
    "neonevm": "https://neon-evm.hypersync.xyz",
    "okbc_testnet": "https://okbc-testnet.hypersync.xyz",
    "optimism": "https://optimism.hypersync.xyz",
    "optimism_sepolia": "https://optimism-sepolia.hypersync.xyz",
    "polygon": "https://polygon.hypersync.xyz",
    "polygon_zkevm": "https://polygon-zkevm.hypersync.xyz",
    "public_goods": "https://publicgoods.hypersync.xyz",
    "rsk": "https://rsk.hypersync.xyz",
    "scroll": "https://scroll.hypersync.xyz",
    "sepolia": "https://sepolia.hypersync.xyz",
    "shimmerevm": "https://shimmer-evm.hypersync.xyz",
    "taiko_jolnr": "https://taiko-jolnr.hypersync.xyz",
    "zksync": "https://zksync.hypersync.xyz",
    "zora": "https://zora.hypersync.xyz",
    "zeta": "https://zeta.hypersync.xyz"
}


app = Quart(__name__)


@app.route('/', methods=['GET', 'POST'])
async def index():
    if request.method == 'POST':
        form_data = await request.form  # Await the form data
        address = form_data['address'].lower()
        request_type = form_data['type']
        selected_network = form_data['network']
        network_url = NETWORK_URLS.get(
            selected_network, "https://eth.hypersync.xyz")
        try:
            directory = await fetch_data(address, selected_network, network_url, request_type)
            img = create_plot(directory, request_type)
            # img = 'data:image/png;base64,./assets/sad-pepe.png'
            return await render_template('plot.html', plot_url=img)
        except Exception as e:
            error_message = str(e)
            print(f"Error: {error_message}")
            if "cannot convert float NaN to integer" in error_message:
                return await render_template('error.html', message=f"Error: It is likely there are no {request_type}s on {address} on the {selected_network} network. Please double check this address on an appropriate block explorer. If using the event selection, make sure the smart contract is actually emitting events.")
            else:
                return await render_template('error.html', message=f"An unexpected error occurred. Error: {error_message}")

    return await render_template('index.html')


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

    if not os.path.exists(directory):
        os.makedirs(directory)

    query = create_query(address, 0, request_type)

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

    await client.collect_parquet(directory, query, config)
    print("Finished writing parquet folder")

    return directory


def analyze_data(directory, request_type):
    if request_type == "event":
        df = pl.read_parquet(f"{directory}/logs.parquet")
    else:
        df = pl.read_parquet(f"{directory}/transactions.parquet")

    return df.to_pandas()


def format_with_commas(x):
    return format(int(x), ',')


def check_parquet_file(file_path):
    try:
        parquet_file = pq.ParquetFile(file_path)
        print(f"{file_path} is a valid Parquet file with {
              parquet_file.metadata.num_rows} rows.")
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


def create_plot(directory, request_type):
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
    x_labels = [f"{format_with_commas(
        left)}-{format_with_commas(right)}" for left, right in zip(intervals[:-1], intervals[1:])]

    interval_counts = df['interval'].value_counts().sort_index()
    ax = interval_counts.plot(kind='bar', color='lightblue', edgecolor='black')

    ylabel = 'Number of Events' if is_event_request else 'Number of Transactions'
    title = f'Number of Events per Block Interval (Size {
        interval_size})' if is_event_request else f'Number of Transactions per Block Interval (Size {interval_size})'

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
    return f'data:image/png;base64,{plot_url}'


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
