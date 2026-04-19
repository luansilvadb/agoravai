# OPSX: Propose
Create a change and generate all implementation artifacts sequentially. 
Input: `<description>`.

## Steps
1. **Context:** MANDATORY: Run only `npm run rag "<description>"`, not use any other commands.
   a. Read `.rag/research/skills.md`  
2. **Scaffold:** Run `openspec new change "<name>"`. (If exists, ask: continue or create new?)
3. **Status:** Run `openspec status --change "<name>" --json`. Extract `applyRequires` and `artifacts`.
4. **Artifact Loop:** Use `TodoWrite`. Loop until all IDs in `applyRequires` are `status: "done"`:
   a. Pick a `ready` artifact (no pending dependencies).
   b. Run `openspec instructions <artifact-id> --change "<name>" --json`.
   c. Parse JSON. Read files in `dependencies`. Apply `.rag/research/skills.md` rules.
   d. **Write:** Use `template` for structure. Fill using `instruction`. 
   e. **Silent Constraints:** `context` and `rules` are constraints for YOU. NEVER copy `<context>`, `<rules>`, or `<project_context>` into the output file.
   f. Write to `outputPath`. Verify file exists.
   g. Re-run `openspec status --change "<name>" --json` to update loop condition.
   h. If critically unclear, use `AskUserQuestion`.
5. **Final:** Run `openspec status --change "<name>"`.

## Output
Summarize: Change name/location, artifacts created. End with: "Run `/opsx:apply` to start implementing."