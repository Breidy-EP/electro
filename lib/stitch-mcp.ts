const STITCH_URL = "https://stitch.googleapis.com/mcp"
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || ""

let requestId = 1

interface MCPResponse {
  jsonrpc: string
  id: number
  result?: {
    content: { type: string; text: string }[]
    isError?: boolean
  }
  error?: { code: number; message: string }
}

function parseResult(result: MCPResponse): unknown {
  if (result.error) throw new Error(result.error.message)
  if (!result.result) throw new Error("Empty response")
  if (result.result.isError) throw new Error(result.result.content[0]?.text || "Unknown error")
  const text = result.result.content[0]?.text
  if (!text) return null
  try { return JSON.parse(text) } catch { return text }
}

async function callTool(name: string, args: Record<string, unknown> = {}): Promise<unknown> {
  const res = await fetch(STITCH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": GOOGLE_API_KEY,
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "tools/call",
      params: { name, arguments: args },
      id: requestId++,
    }),
  })
  const data: MCPResponse = await res.json()
  return parseResult(data)
}

export async function listProjects(filter?: string) {
  return callTool("stitch_list_projects", filter ? { filter } : {}) as Promise<
    { name: string; displayName?: string; title?: string }[]
  >
}

export async function getProject(name: string) {
  return callTool("stitch_get_project", { name })
}

export async function listScreens(projectId: string) {
  return callTool("stitch_list_screens", { projectId })
}

export async function getScreen(name: string, projectId: string, screenId: string) {
  return callTool("stitch_get_screen", { name, projectId, screenId })
}

export async function createProject(title?: string) {
  return callTool("stitch_create_project", { title })
}

export async function generateScreenFromText(
  projectId: string,
  prompt: string,
  deviceType?: string,
  designSystem?: string
) {
  return callTool("stitch_generate_screen_from_text", {
    projectId,
    prompt,
    ...(deviceType && { deviceType }),
    ...(designSystem && { designSystem }),
  })
}

export async function editScreens(
  projectId: string,
  selectedScreenIds: string[],
  prompt: string,
  deviceType?: string
) {
  return callTool("stitch_edit_screens", {
    projectId,
    selectedScreenIds,
    prompt,
    ...(deviceType && { deviceType }),
  })
}

export async function generateVariants(
  projectId: string,
  selectedScreenIds: string[],
  prompt: string,
  variantOptions: { variantCount?: number; creativeRange?: string; aspects?: string[] }
) {
  return callTool("stitch_generate_variants", {
    projectId,
    selectedScreenIds,
    prompt,
    variantOptions,
  })
}

export async function listDesignSystems(projectId?: string) {
  return callTool("stitch_list_design_systems", projectId ? { projectId } : {}) as Promise<
    { name: string; displayName?: string }[]
  >
}

export async function createDesignSystem(projectId: string, designSystem: unknown) {
  return callTool("stitch_create_design_system", { projectId, designSystem })
}

export async function updateDesignSystem(
  name: string,
  projectId: string,
  designSystem: unknown
) {
  return callTool("stitch_update_design_system", { name, projectId, designSystem })
}

export async function applyDesignSystem(
  projectId: string,
  assetId: string,
  selectedScreenInstances: { id: string; sourceScreen: string }[]
) {
  return callTool("stitch_apply_design_system", {
    projectId,
    assetId,
    selectedScreenInstances,
  })
}

export async function uploadDesignMd(projectId: string, designMdBase64: string) {
  return callTool("stitch_upload_design_md", { projectId, designMdBase64 })
}

export async function createDesignSystemFromDesignMd(projectId: string, selectedScreenInstance: { id: string; sourceScreen: string }) {
  return callTool("stitch_create_design_system_from_design_md", {
    projectId,
    selectedScreenInstance,
  })
}
