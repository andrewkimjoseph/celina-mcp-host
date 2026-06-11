<p align="center">
  <img src="./assets/celina-banner.png" alt="Celina — Give your LLM a wallet on Celo">
</p>

# Celina MCP Host

Backend-only Vercel deployment that exposes [celina-mcp](../celina-mcp) over **Streamable HTTP**. No Next.js, no UI.

This is the **hosted read/prepare profile** of the shared [`@andrewkimjoseph/celina-sdk/tools`](https://www.npmjs.com/package/@andrewkimjoseph/celina-sdk) catalog — the same definitions local stdio MCP and browser wallet apps use, filtered with `carbonExecuteEnabled: false` and no server keys.

**Tool surface:** **54 tools** — chain reads, oracle/AMM quotes (`get_mento_fx_quote`, `get_uniswap_quote`, `get_gooddollar_reserve_quote`), GoodDollar entitlement, Self verify/lookup, and Carbon **12 read + 13 `prepare_carbon_*`**. No `CELO_PRIVATE_KEY` or `SELF_AGENT_PRIVATE_KEY` on the server; **`execute_carbon_*`**, **`estimate_*`**, server-key writes (`send_token`, `execute_mento_fx`, etc.), `get_wallet_address`, Self lifecycle, and Self registration session tools are **omitted** from `tools/list`.

Carbon prepare tools return full unsigned flows (ERC-20 approve + Carbon controller steps via SDK `finalizeCarbonPrepare`). See [celina-mcp Carbon section](../celina-mcp/README.md#carbon-defi-on-celo).

GoodDollar: **`get_gooddollar_whitelisting_info`**, **`get_gooddollar_ubi_entitlement`**, and **`get_gooddollar_reserve_quote`** on hosted. **`estimate_gooddollar_reserve_swap`**, **`execute_gooddollar_reserve_swap`**, and **`claim_daily_gooddollar_ubi`** require local stdio MCP with `CELO_PRIVATE_KEY`. See [GoodDollar section](../celina-mcp/README.md#gooddollar).

**Dependencies:** `@andrewkimjoseph/celina-mcp` **`0.8.20`**, `@andrewkimjoseph/celina-sdk` **`0.7.7`**.

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
npm run test:smoke   # expects 54 tools, prepare_carbon_* present, estimate_* and server-key tools absent
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
createServer({
  carbonExecuteEnabled: false,
  carbonPrepareEnabled: true,
  serverKeyToolsEnabled: false,
  selfSessionToolsEnabled: false,
  estimateToolsEnabled: false,
})
```

`createServer` calls `registerSdkTools`, which filters `ALL_TOOL_DEFINITIONS` from celina-sdk. Chain logic and handlers live in celina-sdk; celina-mcp wires them to MCP; this repo only provides the Streamable HTTP entrypoint on Vercel.

## Hosted constraints

Server-key writes and all `estimate_*` gas simulation tools are omitted from `tools/list` on hosted. Use local stdio MCP with `CELO_PRIVATE_KEY` for `send_token`, `estimate_send`, `estimate_mento_fx`, etc.

Self registration sessions (`register_self_agent` → `check_self_registration`) are unreliable on stateless serverless because session state is in-memory per invocation — use local stdio for Self Agent ID lifecycle flows.

See [celina-mcp README — Hosted](../celina-mcp/README.md#hosted-reads--prepare) for full tool coverage.
