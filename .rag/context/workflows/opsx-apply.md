# OPSX: Apply
Implement tasks from an OpenSpec change. Input: `<change-name>` (optional).

## Steps
1. **Resolve Change**: Use provided name > infer from context > auto-select (if only 1 active) > `AskUserQuestion` (run `openspec list --json` if ambiguous). Announce: "Using change: `<name>` (override: `/opsx:apply <other>`)"
2. **Load Context & State**:
   - Run `openspec status --change "<name>" --json` to get `schemaName`.
   - Run `openspec instructions apply --change "<name>" --json`.
   - **Handle State**: If `"blocked"`, suggest `/opsx:continue`. If `"all_done"`, suggest `/opsx:archive`.
   - Read all files listed in `contextFiles`.
3. **Execution Loop**: For each pending task:
   - Log: "Working on task N/M: `<desc>`"
   - Write minimal, scoped code.
   - **CRITICAL**: Immediately update `tasks.md` (`- [ ]` → `- [x]`). Log "✓ Task complete".
   - **Pause & Ask** if: task is ambiguous, error/blocker occurs, or a design flaw is found (suggest updating artifacts instead of guessing).
4. **Report Status**:
   - **On Pause**: Show progress (N/M), describe issue, list options.
   - **On Done**: Show progress (N/M), list session's completed tasks, suggest `/opsx:archive`.

## Guardrails
- **Fluidity**: Can run anytime (even with partial artifacts). If implementation breaks the design, pause and suggest artifact updates.
- **Strict Scoping**: One task at a time. No speculative code.