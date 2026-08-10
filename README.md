# ChainDensity

ChainDensity visualizes event and transaction activity for any EVM address
across HyperSync-supported networks.

The current application is a single Next.js project. Its route handlers query
HyperSync with the official Node client, aggregate streaming results into small
density buckets, and send compact JSON to an SVG chart in the browser. No
separate Python service or persistent Parquet cache is required.

## Local development

Prerequisites:

- Node.js 20.9 or newer
- pnpm 10
- An Envio API token

Install and configure the app:

```bash
cd front-end
pnpm install --frozen-lockfile
cp apps/web/.env.example apps/web/.env.local
```

Set your token in `apps/web/.env.local`:

```bash
ENVIO_API_TOKEN=your-token-here
```

Start the unified application:

```bash
pnpm --filter web dev
```

Open [http://localhost:3000](http://localhost:3000). Both the UI and API routes
are served by Next.js.

## API routes

- `GET /api/networks` returns currently active EVM HyperSync networks.
- `POST /api/data` accepts `address`, `type` (`event` or `transaction`), and
  `network`, then returns density buckets and summary statistics.

Analysis runs on a fixed chain-height snapshot. HyperSync results are streamed,
with only the block number selected for each matching event or transaction.
Each streamed batch is folded directly into roughly 64 counters and then
discarded, so memory usage stays bounded even for large histories. Only those
small aggregate buckets are returned to the browser. Completed results receive
a best-effort ten-minute warm-instance cache.

## Vercel

Import this repository as one Vercel project and select
`front-end/apps/web` as the Root Directory. Vercel understands the surrounding
pnpm/Turborepo workspace and detects Next.js automatically.

Add this server-only environment variable for Production, Preview, and
Development:

```bash
ENVIO_API_TOKEN=your-token-here
```

The analysis route uses the Node.js runtime and requests the Hobby-plan maximum
duration of five minutes. It returns aggregate JSON rather than raw events or
generated image data, keeping responses well below Vercel's function payload
limit.

## Legacy implementation

The root Python/Quart application and checked-in Parquet data are retained only
as migration reference. They are not used by the Next.js application or the
Vercel deployment.

## License

[MIT](LICENSE)
