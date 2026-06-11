import { POST } from "../api/mcp.js";

async function main(): Promise<void> {
  const initBody = {
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
      protocolVersion: "2025-03-26",
      capabilities: {},
      clientInfo: { name: "test", version: "1.0.0" },
    },
  };

  const req = new Request("http://localhost/api/mcp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
    },
    body: JSON.stringify(initBody),
  });

  const res = await POST(req);
  console.log("initialize status", res.status);
  const text = await res.text();
  console.log("initialize body", text.slice(0, 400));

  const toolsBody = {
    jsonrpc: "2.0",
    id: 2,
    method: "tools/list",
    params: {},
  };

  const toolsReq = new Request("http://localhost/api/mcp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
    },
    body: JSON.stringify(toolsBody),
  });

  const toolsRes = await POST(toolsReq);
  console.log("tools/list status", toolsRes.status);
  const toolsText = await toolsRes.text();
  const parsed = JSON.parse(toolsText) as {
    result?: { tools?: { name: string }[] };
  };
  const tools = parsed.result?.tools ?? [];
  const names = tools.map((t) => t.name);
  console.log("tool count", tools.length);
  console.log("sample tools", names.slice(0, 3));

  if (!names.includes("prepare_carbon_limit_order")) {
    throw new Error("expected prepare_carbon_limit_order on hosted MCP");
  }
  if (names.some((n) => n.startsWith("execute_carbon_"))) {
    throw new Error("execute_carbon_* must not be on hosted MCP");
  }
  for (const excluded of [
    "send_token",
    "get_wallet_address",
    "register_self_agent",
    "execute_mento_fx",
    "get_self_identity",
    "estimate_send",
  ]) {
    if (names.includes(excluded)) {
      throw new Error(`${excluded} must not be on hosted MCP`);
    }
  }
  if (names.some((n) => n.startsWith("estimate_"))) {
    throw new Error("estimate_* must not be on hosted MCP");
  }
  if (tools.length !== 54) {
    throw new Error(`expected 54 tools on hosted MCP, got ${tools.length}`);
  }
  console.log("hosted tool surface check ok");

  const verifyBody = {
    jsonrpc: "2.0",
    id: 3,
    method: "tools/call",
    params: {
      name: "verify_self_agent",
      arguments: {
        agent_address: "0xC1C860804EFdA544fe79194d1a37e60b846CEdeb",
      },
    },
  };

  const verifyRes = await POST(
    new Request("http://localhost/api/mcp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
      },
      body: JSON.stringify(verifyBody),
    }),
  );
  const verifyText = await verifyRes.text();
  const verifyParsed = JSON.parse(verifyText) as {
    result?: { isError?: boolean; structuredContent?: { verified?: boolean } };
  };
  if (verifyParsed.result?.isError) {
    throw new Error(`verify_self_agent failed: ${verifyText}`);
  }
  if (verifyParsed.result?.structuredContent?.verified !== true) {
    throw new Error(`verify_self_agent unexpected result: ${verifyText}`);
  }
  console.log("verify_self_agent ok");

  const blockRes = await POST(
    new Request("http://localhost/api/mcp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 4,
        method: "tools/call",
        params: {
          name: "get_block",
          arguments: { block_id: " latest" },
        },
      }),
    }),
  );
  const blockText = await blockRes.text();
  const blockParsed = JSON.parse(blockText) as {
    result?: { isError?: boolean; structuredContent?: { hash?: string } };
  };
  if (blockParsed.result?.isError) {
    throw new Error(`get_block failed: ${blockText}`);
  }
  if (!blockParsed.result?.structuredContent?.hash) {
    throw new Error(`get_block unexpected result: ${blockText}`);
  }
  console.log("get_block ok");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
