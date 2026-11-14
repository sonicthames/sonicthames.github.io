import { spawnSync } from "node:child_process"
import { existsSync } from "node:fs"
import process from "node:process"

if ((process.env["CI"] ?? "") !== "" || !existsSync(".git")) {
  process.exit(0)
}

const result = spawnSync("lefthook", ["install"], { stdio: "inherit" })

if (result.error) {
  console.error(
    `${result.error.message}: run \`mise install\` for the pinned Lefthook.`,
  )
  process.exit(1)
}

process.exit(result.status ?? 1)
