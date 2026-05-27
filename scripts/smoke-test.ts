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
  console.log("tool count", parsed.result?.tools?.length ?? 0);
  console.log(
    "sample tools",
    parsed.result?.tools?.slice(0, 3).map((t) => t.name),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
