from flask import Flask, request, render_template, Response
import hypersync
import asyncio
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.ticker as ticker
import io
import base64
import os

NETWORK_URLS = {
    "arbitrum": "https://arbitrum.hypersync.xyz",
    "base": "https://base.hypersync.xyz",
    "bsc": "https://bsc.hypersync.xyz",
    "eth": "https://eth.hypersync.xyz",
    "gnosis": "https://gnosis.hypersync.xyz",
    "goerli": "https://goerli.hypersync.xyz",
    "linea": "https://linea.hypersync.xyz",
    "optimism": "https://optimism.hypersync.xyz",
    "polygon": "https://polygon.hypersync.xyz",
    "scroll": "https://scroll.hypersync.xyz",
    "sepolia": "https://sepolia.hypersync.xyz",
    "taiko_jolnr": "https://taiko-jolnr.hypersync.xyz",
    "manta": "https://manta.hypersync.xyz",
    "polygon_zkevm": "https://polygon-zkevm.hypersync.xyz",
    "metis": "https://metis.hypersync.xyz",
    "kroma": "https://kroma.hypersync.xyz",
    "celo": "https://celo.hypersync.xyz",
    "zksync": "https://zksync.hypersync.xyz",
    "okbc_testnet": "https://okbc-testnet.hypersync.xyz"
}



app = Flask(__name__)

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        address = request.form['address']
        selected_network = request.form['network']
        network_url = NETWORK_URLS.get(selected_network, "https://eth.hypersync.xyz")
        directory = asyncio.run(fetch_data(address, selected_network, network_url))
        img = create_plot(directory)
        return render_template('plot.html', plot_url=img)
    return render_template('index.html')

async def fetch_data(address, selected_network, network_url):
        # Create hypersync client using the mainnet hypersync endpoint
    client = hypersync.hypersync_client(network_url)

    # height = await client.get_height()
    # print("Height:", height)

    # The query to run
    query = {
        "from_block": 0,
        "logs": [{"address": [address]}],
        "field_selection": {
            "log": ["block_number", "log_index", "transaction_index"],
        },
    }

    print(query)

    # Create a directory named after the address
    directory = f"data_{selected_network}_{address}"
    if not os.path.exists(directory):
        os.makedirs(directory)
        await client.create_parquet_folder(query, directory)
        print("Finished writing parquet folder")
    else:
        if is_parquet_empty(f'{directory}/log.parquet'):
            await client.create_parquet_folder(query, directory)
            print("Parquet wasn't successfully populated")
        else:
            print("cached parquet, we all good")

    return directory

def format_with_commas(x):
    return format(int(x), ',')

def is_parquet_empty(file_path):
    try:
        df = pd.read_parquet(file_path)
        return df.empty
    except Exception as e:
        print(f"Error reading the Parquet file: {e}")
        return True  # Assuming file is empty if it cannot be read


def create_plot(directory):
    plt.figure(figsize=(15, 9))  # Width, Height in inches
    # Read the log.parquet file
    df = pd.read_parquet(f'{directory}/log.parquet')

        # Define the interval size
    interval_size = 100000

    min_block = df['block_number'].min()
    min_block_rounded = min_block - (min_block % interval_size)
    max_block = df['block_number'].max()

    intervals = range(int(min_block_rounded), int(max_block) + interval_size, interval_size)

    df['interval'] = pd.cut(df['block_number'], bins=intervals)

    x_labels = [f"{format_with_commas(left)}-{format_with_commas(right)}" for left, right in zip(intervals[:-1], intervals[1:])]

    # Plot a histogram for the intervals
    interval_counts = df['interval'].value_counts().sort_index()
    ax = interval_counts.plot(kind='bar', color='lightblue', edgecolor='black')
    plt.xlabel('Block Number Interval')
    plt.ylabel('Number of Logs')
    plt.title(f'Number of Logs per Block Interval (Size {interval_size})')
    plt.xticks(ticks=range(len(x_labels)), labels=x_labels, rotation=45, ha='right')

    # Format the y-axis to show numbers with commas
    ax.get_yaxis().set_major_formatter(ticker.FuncFormatter(lambda x, p: format_with_commas(x)))

    # Create a secondary axis 
    ax2 = ax.twinx()
    ax2.plot(range(len(interval_counts)), interval_counts.cumsum(), color='red', marker='o', linestyle='-')
    ax2.set_ylabel('Cumulative Total Number of Logs', color='red')
    ax2.tick_params(axis='y', colors='red')
    ax2.get_yaxis().set_major_formatter(ticker.FuncFormatter(lambda x, p: format_with_commas(x)))

    plt.tight_layout()

    # plt.show()

    buf = io.BytesIO()
    plt.savefig(buf, format='png', bbox_inches='tight')
    buf.seek(0)
    plot_url = base64.b64encode(buf.read()).decode('utf-8')
    buf.close()
    return f'data:image/png;base64,{plot_url}'

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
