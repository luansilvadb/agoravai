# SPECSKILLS: Archive
Archive a completed change. Input: `<change-name>` (optional).

## Steps
1. **Resolve Name**: If omitted/ambiguous, run `specskills list --json`. Use `AskUserQuestion` showing active changes. NEVER auto-select.
2. **Validate & Sync** (Run `specskills status "<name>" --json` + read `tasks.md` + check `specskills/changes/<name>/specs/`):
   - **Artifacts:** Check for non-`done` statuses.
   - **Tasks:** Count `- [ ]` (incomplete) vs `- [x]`.
   - **Delta Specs:** If exist, diff against `specskills/specs/` to summarize adds/mods.
   - **Action:** If ANY artifacts/tasks incomplete, OR delta specs need sync: Show warnings and prompt user (Options: "Sync now (recommended)", "Archive without sync", "Cancel").
   - **Sync Execution:** If chosen, use `Task` tool (subagent: "general-purpose", prompt: "Use Skill tool to invoke specskills-sync-specs for '<name>'. Summary: <diff_summary>").
3. **Move**: Target `specskills/archive/YYYY-MM-DD-<name>/`.
   - `mkdir -p specskills/archive`
   - If target exists: Halt with error (options: rename, delete, wait).
   - Else: `mv specskills/changes/<name> specskills/archive/YYYY-MM-DD-<name>`
4. **Summary**: Output the block below.

## Comandos npm (Independência de Framework)

| Comando npm | Descrição |
|-------------|-----------|
| `specskills list --json` | Lista changes ativas |
| `specskills status "<name>" --json` | Status da change em JSON |
| `specskills archive "<name>"` | Arquiva change completa |

## Output Template
## Archive [Complete / Failed (with warnings)]
**Change:** <name>
**Schema:** <schemaName>
**Location:** <archive_path> (or Target on fail)
**Specs:** <Synced / Skipped / No deltas>
**Warnings:** <List incomplete artifacts/tasks/skips if any, else "None">

## Guardrails
- Never block archive on warnings—just inform and get confirmation.
- Preserve `.specskills.yaml` (moves with directory).
- Always assess delta diffs before prompting sync options.
