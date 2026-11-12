import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const apiUrl = new URL(process.env.SAVEPOINT_API_URL ?? "http://localhost:3333");
const localHosts = new Set(["localhost", "127.0.0.1", "::1"]);
if (apiUrl.protocol !== "http:" || !localHosts.has(apiUrl.hostname)) {
  throw new Error("SAVEPOINT_API_URL deve apontar para HTTP local: localhost, 127.0.0.1 ou ::1.");
}
const baseUrl = apiUrl.toString().replace(/\/$/, "");
const statuses = ["BACKLOG", "PLAYING", "COMPLETED"] as const;
type GameStatus = (typeof statuses)[number];

async function callApi(path: string, init?: RequestInit): Promise<unknown> {
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: { Accept: "application/json", ...(init?.body ? { "Content-Type": "application/json" } : {}), ...init?.headers },
    signal: AbortSignal.timeout(10000)
  });
  const raw = await response.text();
  let body: unknown = null;
  if (raw) {
    try { body = JSON.parse(raw); }
    catch { throw new Error("A API do SavePoint retornou uma resposta que não é JSON válido."); }
  }
  if (!response.ok) {
    const obj = body as { error?: { message?: string } } | null;
    throw new Error(obj?.error?.message ?? `A API respondeu com HTTP ${response.status}.`);
  }
  return body;
}

const server = new McpServer({ name: "savepoint-mcp-server", version: "1.0.0" });

server.tool(
  "listar_jogos",
  "Consulta a biblioteca SavePoint. Pode filtrar por status (BACKLOG, PLAYING ou COMPLETED) e plataforma.",
  {
    status: z.enum(statuses).optional().describe("Status de progresso opcional."),
    platform: z.string().trim().min(1).max(80).optional().describe("Nome da plataforma, até 80 caracteres.")
  },
  async ({ status, platform }) => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (platform) params.set("platform", platform);
    const query = params.size ? `?${params.toString()}` : "";
    try {
      const result = await callApi(`/games${query}`);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    } catch (error) {
      return { isError: true, content: [{ type: "text", text: error instanceof Error ? error.message : "Erro desconhecido ao consultar o SavePoint." }] };
    }
  }
);

server.tool(
  "atualizar_status_jogo",
  "Atualiza o progresso de um jogo cadastrado no SavePoint. Use o ID obtido em listar_jogos.",
  {
    id: z.number().int().positive().describe("ID positivo do jogo."),
    status: z.enum(statuses).describe("Novo status: BACKLOG, PLAYING ou COMPLETED.")
  },
  async ({ id, status }: { id: number; status: GameStatus }) => {
    try {
      const result = await callApi(`/games/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    } catch (error) {
      return { isError: true, content: [{ type: "text", text: error instanceof Error ? error.message : "Erro desconhecido ao atualizar o jogo." }] };
    }
  }
);

await server.connect(new StdioServerTransport());
