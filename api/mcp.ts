import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { createServer } from "@andrewkimjoseph/celina-mcp/server";

async function handleMcp(request: Request): Promise<Response> {
  const server = createServer({
    carbonExecuteEnabled: false,
    carbonPrepareEnabled: true,
    serverKeyToolsEnabled: false,
    selfSessionToolsEnabled: false,
    estimateToolsEnabled: false,
  });
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });

  await server.connect(transport);
  const response = await transport.handleRequest(request);

  transport.close().catch(() => {});
  server.close().catch(() => {});

  return response;
}

export const POST = handleMcp;
export const GET = handleMcp;
export const DELETE = handleMcp;
