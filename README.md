# Celina MCP Host

Backend-only Vercel deployment that exposes [celina-mcp](../celina-mcp) over **Streamable HTTP**. No Next.js, no UI.

**Tool surface:** **72 tools** — all chain reads, estimates, GoodDollar entitlement reads, Self verify/lookup, and Carbon **12 read + 13 `prepare_carbon_*`**. No `CELO_PRIVATE_KEY` on the server; no `execute_carbon_*`, no `get_wallet_address`, or other server-key writes.

Carbon prepare tools return full unsigned flows (ERC-20 approve + Carbon controller steps via SDK `finalizeCarbonPrepare`). See [celina-mcp Carbon section](../celina-mcp/README.md#carbon-defi-on-celo).

GoodDollar UBI: **`get_gooddollar_whitelisting_info`** and **`get_gooddollar_ubi_entitlement`** (read). **`claim_daily_gooddollar_ubi`** requires `CELO_PRIVATE_KEY` — use local stdio MCP. See [GoodDollar UBI section](../celina-mcp/README.md#gooddollar-ubi).

**Dependencies:** `@andrewkimjoseph/celina-mcp` **`0.8.8`**, `@andrewkimjoseph/celina-sdk` **`0.4.10`**.

## Endpoints

| Path | Method | Description |
|------|--------|-------------|
| `/api/mcp` | GET, POST, DELETE | MCP Streamable HTTP |
| `/mcp` | GET, POST, DELETE | Rewrite to `/api/mcp` |
| `/api/health` | GET | Health check |

Production: [https://mcp.usecelina.xyz/api/mcp](https://mcp.usecelina.xyz/api/mcp)

## Setup

```bash
cp .env.example .env.local   # optional for local dev
npm install
```

Requires Node.js ≥ 20. Install published npm packages — do not use local `file:` links in production.

## Local dev

```bash
npm run dev
npm run test:smoke   # expects 72 tools, prepare_carbon_* present, execute_carbon_* absent
```

Connect MCP Inspector (Streamable HTTP) to `http://localhost:3000/api/mcp`.

## Deploy to Vercel

1. Link the project (root directory: `celina-mcp-host` if deploying from the monorepo):

   ```bash
   vercel link
   ```

2. Set environment variables in the Vercel dashboard:

   | Variable | Required | Notes |
   |----------|----------|-------|
   | `CELO_RPC_URL_MAINNET` | Recommended | Required for Carbon prepare allowance reads |
   | `ETH_RPC_URL_MAINNET` | Optional | ENS resolution |

   Do **not** set `CELO_PRIVATE_KEY` or `SELF_AGENT_PRIVATE_KEY`.

3. Deploy:

   ```bash
   vercel --prod
   ```

## MCP client config

```json
{
  "mcpServers": {
    "celina-mcp": {
      "url": "https://mcp.usecelina.xyz/api/mcp"
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
      "args": ["-y", "mcp-remote", "https://mcp.usecelina.xyz/api/mcp"]
    }
  }
}
```

## How it links to celina-mcp

[`api/mcp.ts`](api/mcp.ts) imports `createServer` from `@andrewkimjoseph/celina-mcp/server`:

```ts
createServer({ carbonExecuteEnabled: false, carbonPrepareEnabled: true })
```

All tools, chain logic, and SDK calls live in celina-mcp; this repo only provides the HTTP entrypoint on Vercel.

## Read-only execution

Without private keys, server-key write tools fail with clear errors. Self registration sessions (`register_self_agent` → `check_self_registration`) are unreliable on stateless serverless because session state is in-memory per invocation.

See [celina-mcp README — Hosted](../celina-mcp/README.md#hosted-read-only) for full tool coverage.
