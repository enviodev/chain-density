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
        address = address.lower()
        request_type = request.form['type']
        selected_network = request.form['network']
        network_url = NETWORK_URLS.get(selected_network, "https://eth.hypersync.xyz")
        try:
            directory = asyncio.run(fetch_data(address, selected_network, network_url, request_type))
            img = create_plot(directory, request_type)
            # img = 'data:image/png;base64,./assets/sad-pepe.png'
            return render_template('plot.html', plot_url=img)
        except Exception as e:
            print(f"Error: {e}")
            return render_template('error.html', message="An unexpected error occurred.")

    return render_template('index.html')


async def fetch_data(address, selected_network, network_url, request_type):
    # Create hypersync client using the chosen hypersync endpoint
    client = hypersync.hypersync_client(network_url)
    is_event_request = request_type == "event"

    # The query to run
    if is_event_request:
        query = {
            "from_block": 0,
            "logs": [{"address": [address]}],
            "field_selection": {
                "log": ["block_number", "log_index", "transaction_index"],
            },
        }
    else:
        query = {
            "from_block": 0,
            "transactions": [
                # We want all the transactions that come from this address
                {"from": [address]},
                # We want all the transactions that went to this address
                {"to": [address]},
            ],
            "field_selection": {
                "transaction": [
                    "block_number",
                    "transaction_index",
                    "hash",
                ],
            },
        }

    # Create a directory named after the address
    directory = f"data/data_{selected_network}_{request_type}_{address}"
    if not os.path.exists(directory):
        os.makedirs(directory)
        await client.create_parquet_folder(query, directory)
        print("Finished writing parquet folder")
    else:
        if is_event_request and is_parquet_empty(f'{directory}/log.parquet'):
            await client.create_parquet_folder(query, directory)
            print("Parquet previously wasn't successfully populated")
        elif not is_event_request and is_parquet_empty(f'{directory}/transaction.parquet'):
            await client.create_parquet_folder(query, directory)
            print("Parquet previously wasn't successfully populated")
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
    file_suffix = 'log' if is_event_request else 'transaction'
    df = pd.read_parquet(f'{directory}/{file_suffix}.parquet')

    # Define the interval size
    min_block = df['block_number'].min()
    max_block = df['block_number'].max()
    interval_size = max(5000, round_based_on_magnitude((max_block - min_block) / 50))
    min_block_rounded = min_block - (min_block % interval_size)
    intervals = range(int(min_block_rounded), int(max_block) + interval_size, interval_size)
    df['interval'] = pd.cut(df['block_number'], bins=intervals)

    # Generate x labels for the intervals
    x_labels = [f"{format_with_commas(left)}-{format_with_commas(right)}" for left, right in zip(intervals[:-1], intervals[1:])]

    interval_counts = df['interval'].value_counts().sort_index()
    ax = interval_counts.plot(kind='bar', color='lightblue', edgecolor='black')

    ylabel = 'Number of Events' if is_event_request else 'Number of Transactions'
    title = f'Number of Events per Block Interval (Size {interval_size})' if is_event_request else f'Number of Transactions per Block Interval (Size {interval_size})'
    
    plt.xlabel('Block Number Interval')
    plt.ylabel(ylabel)
    plt.title(title)
    plt.xticks(ticks=range(len(x_labels)), labels=x_labels, rotation=45, ha='right')

    # Format the y-axis to show numbers with commas and create a secondary axis
    ax.get_yaxis().set_major_formatter(ticker.FuncFormatter(lambda x, p: format_with_commas(x)))
    ax2 = ax.twinx()
    ax2.plot(range(len(interval_counts)), interval_counts.cumsum(), color='red', marker='o', linestyle='-')
    ax2.set_ylabel('Cumulative Total', color='red')
    ax2.tick_params(axis='y', colors='red')
    ax2.get_yaxis().set_major_formatter(ticker.FuncFormatter(lambda x, p: format_with_commas(x)))

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
