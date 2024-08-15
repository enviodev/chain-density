# ChainDensity

ChainDensity is a web application that visualizes event and transaction density for Ethereum and other EVM-compatible blockchains.

## Setup

1. Install Python 3.10 or higher.

2. Install uv:

   ```
   pip install uv
   ```

3. Clone the repository:

   ```
   git clone git@github.com:enviodev/event-density-hack.git
   cd chaindensity
   ```

4. Create a virtual environment and install dependencies:

   ```
   uv venv
   source .venv/bin/activate  # On Windows, use: .venv\Scripts\activate
   uv pip install -r requirements.txt
   ```

5. Run the application:

   ```
   python app.py
   ```

6. Open your web browser and navigate to `http://localhost:5001`.

## Usage

1. Enter an Ethereum address in the "Address" field.
2. Select "Event" or "Transaction" from the dropdown menu.
3. Choose a network from the "Network" dropdown.
4. Click "Submit" to generate the density plot.

## Example Searches

- Blast L2 Bridge - Event Density
- OP Token - Transaction Density
- Fren Pet - Event Density

## Contributing

If you have ideas or want to contribute, please join our [Discord](https://discord.gg/zNZYBNtbZV).

## License

[MIT License](LICENSE)

## Acknowledgements

Made by envio and powered by [Hypersync](https://envio.dev).
