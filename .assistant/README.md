# .assistant — shared AI tooling home

This template is **AI-agent agnostic**: contributors can use whichever AI coding
agent they prefer. `AGENTS.md` is the single shared instructions file that every
agent reads; `.assistant/` is the one place that holds the shared tooling for
**all** AI agents — agents, skills, and rules — regardless of which agent you use.

Anything agent-specific (`.opencode/`, `.claude/`, `.cursor/`, etc.) is
gitignored. See `.gitignore` → `# AI agents`.

## Layout

| Path        | Purpose                                                           |
| ----------- | ----------------------------------------------------------------- |
| `agents/`   | Agent definitions and shared skills/notes consumable by any agent |
| `commands/` | Shared commands (slash commands / prompts) agents can run         |
| `skills/`   | Reusable skills (procedures, workflows) agents can load           |
| `rules/`    | Shared rules every agent should follow                            |

MCP server configs, if ever needed, live in a single `mcp.json` at the root of
`.assistant/` — none are required today.

## Adding shared tooling

Place new shared capabilities under the matching subfolder here, never inside an
agent-specific directory. This keeps the template portable across opencode,
Claude Code, Cursor, Copilot, and any other agent.
