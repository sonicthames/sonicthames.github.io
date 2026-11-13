#!/usr/bin/env node
/**
 * MCP Discovery Script
 *
 * Discovers and lists available MCP servers and their capabilities by
 * programmatically querying each server using the MCP SDK.
 *
 * This provides true programmatic discovery - the actual list of tools
 * from the running MCP server, not hardcoded lists.
 *
 * Usage: pnpm mcp:discover
 */

import { readFileSync } from "node:fs"
import { join } from "node:path"
import { Client } from "@modelcontextprotocol/sdk/client/index.js"
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js"
import { z } from "zod"

const McpServerSchema = z.object({
  type: z.string(),
  command: z.string(),
  args: z.array(z.string()),
  env: z.record(z.string(), z.string()),
})

type McpServer = z.infer<typeof McpServerSchema>

const McpConfigSchema = z.object({
  mcpServers: z.record(z.string(), McpServerSchema),
})

interface Tool {
  name: string
  description?: string | undefined
  inputSchema?: {
    type: string
    properties?: Record<string, unknown> | undefined
    required?: string[]
  }
}

const QUERY_TIMEOUT = 5000 // 5 second timeout for server queries

async function queryServerTools(
  _name: string,
  server: McpServer,
): Promise<Tool[]> {
  let transport: StdioClientTransport | null = null
  let client: Client | null = null

  try {
    // Create MCP client with stdio transport (this spawns the process)
    transport = new StdioClientTransport({
      command: server.command,
      args: server.args,
      env: server.env,
    })

    client = new Client(
      {
        name: "mcp-discovery",
        version: "1.0.0",
      },
      {
        capabilities: {},
      },
    )

    // Connect with timeout
    const connectPromise = client.connect(transport)
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Connection timeout")), QUERY_TIMEOUT),
    )
    await Promise.race([connectPromise, timeoutPromise])

    // Query tools
    const response = await client.listTools()

    return (response.tools || []) as Tool[]
  } catch (error) {
    console.error(
      `   ⚠️  Could not query server: ${error instanceof Error ? error.message : "Unknown error"}`,
    )
    return []
  } finally {
    // Ensure cleanup happens
    if (client) {
      try {
        await client.close()
      } catch {
        // Ignore close errors
      }
    }
  }
}

function formatToolSignature(tool: Tool): string {
  const params = tool.inputSchema?.properties || {}
  const required = tool.inputSchema?.required || []

  const paramList = Object.entries(params)
    .map(([key, _value]) => {
      const isRequired = required.includes(key)
      const suffix = isRequired ? "" : "?"
      return `${key}${suffix}`
    })
    .join(", ")

  return `${tool.name}(${paramList})`
}

function printPlaywrightConfig(name: string, server: McpServer): void {
  if (!name.includes("playwright")) return
  const isHeadless = server.args.includes("--headless")
  const viewport = server.args.find((arg) => arg.startsWith("--viewport-size="))
  const outputDir = server.args.find((arg) => arg.startsWith("--output-dir="))

  console.log(`   Configuration:`)
  console.log(
    `     - Mode: ${isHeadless ? "headless" : "headed (visible browser)"}`,
  )
  if (viewport) console.log(`     - ${viewport}`)
  if (outputDir) console.log(`     - ${outputDir}`)
}

function printToolsByCategory(tools: Tool[]): void {
  if (tools.length === 0) return
  console.log(`   Capabilities (${tools.length} tools):`)

  const categories: Record<string, Tool[]> = {}
  for (const tool of tools) {
    const category = tool.name.split("_")[0] || "other"
    if (!categories[category]) {
      categories[category] = []
    }
    categories[category].push(tool)
  }

  for (const [category, categoryTools] of Object.entries(categories)) {
    console.log(`     ${category}:`)
    for (const tool of categoryTools) {
      const signature = formatToolSignature(tool)
      const desc = tool.description ? ` - ${tool.description}` : ""
      console.log(`       • ${signature}${desc}`)
    }
  }
}

function printNoToolsHint(server: McpServer): void {
  console.log(`   Capabilities:`)
  console.log(
    `     See: ${server.command} ${server.args.slice(0, 2).join(" ")} --help`,
  )
}

async function discoverMcpServers() {
  const mcpConfigPath = join(process.cwd(), ".mcp.json")

  try {
    const config = McpConfigSchema.parse(
      JSON.parse(readFileSync(mcpConfigPath, "utf-8")),
    )

    console.log("🔍 Discovered MCP Servers:\n")

    for (const [name, server] of Object.entries(config.mcpServers)) {
      console.log(`📦 ${name}`)
      console.log(`   Command: ${server.command} ${server.args.join(" ")}`)

      printPlaywrightConfig(name, server)

      console.log(`   Querying server for tools...`)
      const tools = await queryServerTools(name, server)

      if (tools.length > 0) {
        printToolsByCategory(tools)
      } else {
        printNoToolsHint(server)
      }

      console.log("")
    }

    console.log("💡 Usage in code:")
    console.log(
      "   For Claude Code: Tools are available as mcp__<server>__<tool_name>",
    )
    console.log("   Example: mcp__playwright__browser_navigate")
    console.log("   Example: mcp__playwright-headed__browser_snapshot\n")

    console.log("📖 For full MCP server documentation:")
    for (const [_name, server] of Object.entries(config.mcpServers)) {
      console.log(
        `   ${server.command} ${server.args[0]} ${server.args[1]} --help`,
      )
    }
    console.log("")
  } catch (error) {
    console.error("❌ Error during discovery:", error)
    process.exit(1)
  }
}

void discoverMcpServers()
