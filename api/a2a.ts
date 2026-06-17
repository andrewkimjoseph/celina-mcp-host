import { handleA2ARequest } from "@andrewkimjoseph/celina-mcp/a2a";

const BASE_URL =
  process.env.CELINA_A2A_BASE_URL ?? "https://mcp.usecelina.xyz";

export async function GET(request: Request): Promise<Response> {
  return handleA2ARequest(request, { baseUrl: BASE_URL });
}

export async function POST(request: Request): Promise<Response> {
  return handleA2ARequest(request, { baseUrl: BASE_URL });
}

export async function HEAD(request: Request): Promise<Response> {
  return handleA2ARequest(request, { baseUrl: BASE_URL });
}
