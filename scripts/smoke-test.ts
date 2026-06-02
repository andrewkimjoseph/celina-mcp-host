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
  if (tools.length !== 71) {
    throw new Error(`expected 71 tools on hosted MCP, got ${tools.length}`);
  }
  console.log("hosted carbon prepare check ok");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
