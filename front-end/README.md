# ChainDensity Frontend

This is the Next.js frontend for the ChainDensity application, which visualizes event and transaction density for Ethereum and other EVM-compatible blockchains.

## Setup

### Prerequisites

- Node.js 18+ and npm/pnpm
- Python 3.10+ (for the backend)

### Backend Setup

1. Set up the Python backend first:

```bash
# From the root directory
pip install -r requirements.txt
python app.py
```

The backend will run on http://localhost:5001.

### Frontend Setup

1. Install dependencies:

```bash
# From the front-end directory
pnpm install
```

2. Run the development server:

```bash
# From the front-end directory
pnpm dev
```

3. Open your browser and navigate to http://localhost:3000

## Architecture

This project uses a decoupled architecture:

- **Backend**: Python Quart application that handles data retrieval and processing using Hypersync
- **Frontend**: Next.js application that provides a modern UI for interacting with the backend

## API Endpoints

The backend exposes the following API endpoints:

- `GET /api/networks` - Returns a list of available networks
- `POST /api/data` - Accepts address, network, and request type to generate density visualization

## Development

This is a [Next.js](https://nextjs.org/) project bootstrapped with Turborepo.

## Acknowledgements

Made by envio and powered by [Hypersync](https://envio.dev).
