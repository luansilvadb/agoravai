# SPECSKILL: Apply
Implement tasks from an SpecSkill change. Input: `<change-name>` (optional).

## Steps
1. **Resolve Change**: Use provided name > infer from context > auto-select (if only 1 active) > `AskUserQuestion` (run `npm run specskill:list -- --json` if ambiguous). Announce: "Using change: `<name>` (override: `/specskill:apply <other>`)"
2. **Load Context & State**:
   - Run `npm run specskill:status "<name>" --json` to get `schemaName`.
   - Run `npm run specskill:instructions "<name>" apply --json`.
   - **Handle State**: If `"blocked"`, suggest `/specskill:continue`. If `"all_done"`, suggest `/specskill:archive`.
   - Read all files listed in `contextFiles`.
3. **Execution Loop**: For each pending task:
   - Log: "Working on task N/M: `<desc>`"
   - Write minimal, scoped code.
   - **CRITICAL**: Immediately update `tasks.md` (`- [ ]` → `- [x]`). Log "✓ Task complete".
   - **Pause & Ask** if: task is ambiguous, error/blocker occurs, or a design flaw is found (suggest updating artifacts instead of guessing).
4. **Report Status**:
   - **On Pause**: Show progress (N/M), describe issue, list options.
   - **On Done**: Show progress (N/M), list session's completed tasks, suggest `/specskill:archive`.

## Comandos npm (Independência de Framework)

| Comando npm | Descrição |
|-------------|-----------|
| `npm run specskill:list -- --json` | Lista changes ativas |
| `npm run specskill:status "<name>" --json` | Status da change em JSON |
| `npm run specskill:instructions "<name>" apply --json` | Instruções de apply |
| `npm run specskill:continue "<name>"` | Continua change bloqueada |
| `npm run specskill:archive "<name>"` | Arquiva change completa |

## Guardrails
- **Fluidity**: Can run anytime (even with partial artifacts). If implementation breaks the design, pause and suggest artifact updates.
- **Strict Scoping**: One task at a time. No speculative code.
