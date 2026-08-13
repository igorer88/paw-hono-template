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

## Wiring an agent to `.assistant/`

`.assistant/` holds content in a provider-neutral format. Each agent then
needs a thin, personal layer (in its own gitignored directory) to pick it up —
the format that registers a file as an agent or command is agent-specific:

- **Skills** are the exception: the `SKILL.md` convention is shared, so point
  the agent's skill loader at `.assistant/skills/` directly.
- **Rules** are plain markdown injected as instructions.
- **Agents and commands** need a wrapper per agent: a small file in the agent's
  own directory whose frontmatter matches that agent's schema and whose body
  tells it to read and apply the shared `.assistant/` file. Shared files stay
  neutral — never embed agent-specific frontmatter in them.

opencode example (all in the gitignored `opencode.json` / `.opencode/`):

```json
{
  "$schema": "https://opencode.ai/config.json",
  "instructions": ["AGENTS.md", ".assistant/README.md"],
  "skills": { "paths": [".assistant/skills"] }
}
```

`.opencode/agents/security-audit.md`:

```markdown
---
description: Runs comprehensive security audits of the codebase.
mode: subagent
---

Read `.assistant/agents/security-audit.md` and apply it in full.
```

Claude Code, Cursor, Copilot, etc. follow the same pattern: register the shared
`agents/`, `commands/`, and `rules/` files through their own config mechanism,
and let their skill loader scan `.assistant/skills/`. After changing any agent
config, restart the agent — config is loaded once at startup.
