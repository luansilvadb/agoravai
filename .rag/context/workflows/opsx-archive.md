# OPSX: Archive
Archive a completed change. Input: `<change-name>` (optional).

## Steps
1. **Resolve Name**: If omitted/ambiguous, run `openspec list --json`. Use `AskUserQuestion` showing active changes. NEVER auto-select.
2. **Validate & Sync** (Run `openspec status --change "<name>" --json` + read `tasks.md` + check `openspec/changes/<name>/specs/`):
   - **Artifacts:** Check for non-`done` statuses.
   - **Tasks:** Count `- [ ]` (incomplete) vs `- [x]`.
   - **Delta Specs:** If exist, diff against `openspec/specs/` to summarize adds/mods.
   - **Action:** If ANY artifacts/tasks incomplete, OR delta specs need sync: Show warnings and prompt user (Options: "Sync now (recommended)", "Archive without sync", "Cancel").
   - **Sync Execution:** If chosen, use `Task` tool (subagent: "general-purpose", prompt: "Use Skill tool to invoke openspec-sync-specs for '<name>'. Summary: <diff_summary>").
3. **Move**: Target `openspec/changes/archive/YYYY-MM-DD-<name>/`.
   - `mkdir -p openspec/changes/archive`
   - If target exists: Halt with error (options: rename, delete, wait).
   - Else: `mv openspec/changes/<name> openspec/changes/archive/YYYY-MM-DD-<name>`
4. **Summary**: Output the block below.

## Output Template
## Archive [Complete / Failed (with warnings)]
**Change:** <name>
**Schema:** <schemaName>
**Location:** <archive_path> (or Target on fail)
**Specs:** <Synced / Skipped / No deltas>
**Warnings:** <List incomplete artifacts/tasks/skips if any, else "None">

## Guardrails
- Never block archive on warnings—just inform and get confirmation.
- Preserve `.openspec.yaml` (moves with directory).
- Always assess delta diffs before prompting sync options.