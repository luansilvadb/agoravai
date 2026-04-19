# SPECSKILLS: Apply
Implement tasks from a SpecSkills change. Input: `<change-name>` (optional).

## Steps
1. **Resolve Change**: Use provided name > infer from context > auto-select (if only 1 active) > `AskUserQuestion` (run `specskills list --json` if ambiguous). Announce: "Using change: `<name>` (override: `specskills apply <other>`)"
2. **Load Context & State**:
   - Run `specskills status "<name>" --json` to get `schemaName`.
   - Run `specskills instructions "<name>" apply --json`.
   - **Handle State**: If `"blocked"`, suggest `specskills continue <name>`. If `"all_done"`, suggest `specskills archive <name>`.
   - Read all files listed in `contextFiles`.
3. **Execution Loop**: For each pending task:
   - Log: "Working on task N/M: `<desc>`"
   - Write minimal, scoped code.
   - **CRITICAL**: Immediately update `tasks.md` (`- [ ]` → `- [x]`). Log "✓ Task complete".
   - **Pause & Ask** if: task is ambiguous, error/blocker occurs, or a design flaw is found (suggest updating artifacts instead of guessing).
4. **Report Status**:
   - **On Pause**: Show progress (N/M), describe issue, list options.
   - **On Done**: Show progress (N/M), list session's completed tasks, suggest `specskills archive <name>`.

## Comandos npm (Independência de Framework)

| Comando npm | Descrição |
|-------------|-----------|
| `specskills list --json` | Lista changes ativas |
| `specskills status "<name>" --json` | Status da change em JSON |
| `specskills instructions "<name>" apply --json` | Instruções de apply |
| `specskills continue "<name>"` | Continua change bloqueada |
| `specskills archive "<name>"` | Arquiva change completa |

## Guardrails
- **Fluidity**: Can run anytime (even with partial artifacts). If implementation breaks the design, pause and suggest artifact updates.
- **Strict Scoping**: One task at a time. No speculative code.
