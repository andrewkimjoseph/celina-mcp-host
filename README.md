# Celina MCP Host

Backend-only Vercel deployment that exposes read-only [celina-mcp](../celina-mcp) tools over **Streamable HTTP**. No Next.js, no UI.

Carbon DeFi: **12 read-only** tools — `get_carbon_strategies`, `get_carbon_strategy`, `get_carbon_trade_quote`, `explore_carbon_pair`, `resolve_carbon_token`, `get_carbon_activity`, `find_carbon_opportunities`, `get_carbon_protocol_stats`, `get_carbon_price_history`, `simulate_carbon_strategy`, `carbon_help`, `carbon_learn`. All **13** `prepare_carbon_*` tools are disabled (`carbonWritesEnabled: false` in [`api/mcp.ts`](api/mcp.ts)). See [celina-mcp Carbon section](../celina-mcp/README.md#carbon-defi-on-celo).

## Endpoints

| Path | Method | Description |
|------|--------|-------------|
| `/api/mcp` | GET, POST, DELETE | MCP Streamable HTTP |
| `/mcp` | GET, POST, DELETE | Rewrite to `/api/mcp` |
| `/api/health` | GET | Health check |

## Setup

```bash
cp .env.example .env.local   # optional for local dev
npm install
```

To develop against a local celina-mcp checkout in the monorepo:

```bash
npm install ../celina-mcp
```

Then import from `@andrewkimjoseph/celina-mcp/server` if the linked package includes the `./server` export (celina-mcp >= 0.7.2), or keep the `build/server/create-server.js` import path.

## Local dev

```bash
npm run dev
```

Then connect MCP Inspector (Streamable HTTP) to `http://localhost:3000/api/mcp`.

## Deploy to Vercel

1. Link the project (root directory: `celina-mcp-host` if deploying from the monorepo):

   ```bash
   vercel link
   ```

2. Set environment variables in the Vercel dashboard:

   | Variable | Required | Notes |
   |----------|----------|-------|
   | `CELO_RPC_URL_MAINNET` | Recommended | Dedicated RPC in production |
   | `ETH_RPC_URL_MAINNET` | Optional | ENS resolution |

   Do **not** set `CELO_PRIVATE_KEY` or `SELF_AGENT_PRIVATE_KEY`.

3. Deploy:

   ```bash
   vercel --prod
   ```

Production: `https://celina-mcp-host.vercel.app/api/mcp`

## MCP client config

```json
{
  "mcpServers": {
    "celina-mcp": {
      "url": "https://celina-mcp-host.vercel.app/api/mcp"
    }
  }
}
```

For stdio-only clients, use [mcp-remote](https://www.npmjs.com/package/mcp-remote):

```json
{
  "mcpServers": {
    "celina-mcp": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://your-project.vercel.app/api/mcp"]
    }
  }
}
```

## How it links to celina-mcp

This host imports `createServer` from `@andrewkimjoseph/celina-mcp/server` and wraps it with MCP Streamable HTTP transport. All tools, chain logic, and SDK calls live in celina-mcp; this repo only provides the HTTP entrypoint on Vercel.

## Read-only behavior

Without private keys, write tools fail with clear errors. Self registration sessions (`register_self_agent` → `check_self_registration`) are unreliable on stateless serverless because session state is in-memory per invocation.

See [celina-mcp README](../celina-mcp/README.md#hosted-vercel-read-only) for tool coverage details.
