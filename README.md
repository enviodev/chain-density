# ChainDensity

ChainDensity is a web application that visualizes event and transaction density for Ethereum and other EVM-compatible blockchains.

## Setup

### Option 1: Local Setup

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

5. Configure the front-end:

   Create a `.env.local` file in the `front-end/apps/web` directory with the following content:

   ```
   # API Base URL for local development
   NEXT_PUBLIC_API_URL=http://localhost:5001/api
   ```

   This allows the front-end to connect to the local API server.

6. Run the backend API server:

   ```
   python app.py
   ```

   This will start the API server at `http://localhost:5001`.

7. In a separate terminal, start the front-end development server:

   ```
   cd front-end
   pnpm dev
   ```

   This will start the front-end development server at `http://localhost:3000`.

8. Open your web browser and navigate to `http://localhost:3000` to access the front-end application.

### Option 2: Docker Setup

1. Ensure you have Docker installed on your system.

2. Build the Docker image:

   ```
   docker build -t chaindensity .
   ```

3. Run the Docker container:

   ```
   docker run -p 5001:5001 chaindensity
   ```

4. Open your web browser and navigate to `http://localhost:5001`.

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
