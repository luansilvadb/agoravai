# SPECSKILL: Propose
Create a change and generate all implementation artifacts sequentially. 
Input: `<description>`.

## Steps
1. **Context:** MANDATORY: Run only `npm run rag "<description>"`, not use any other commands.
   a. Read `.rag/research/skills.md`  
2. **Scaffold:** Run `npm run specskill:new "<name>"`. (If exists, ask: continue or create new?)
3. **Status:** Run `npm run specskill:status "<name>" --json`. Extract `applyRequires` and `artifacts`.
4. **Artifact Loop:** Use `TodoWrite`. Loop until all IDs in `applyRequires` are `status: "done"`:
   a. Pick a `ready` artifact (no pending dependencies).
   b. Run `npm run specskill:instructions "<name>" <artifact-id> --json`.
   c. Parse JSON. Read files in `dependencies`. Apply `.rag/research/skills.md` rules.
   d. **Write:** Use `template` for structure. Fill using `instruction`. 
   e. **Silent Constraints:** `context` and `rules` are constraints for YOU. NEVER copy `<context>`, `<rules>`, or `<project_context>` into the output file.
   f. Write to `outputPath`. Verify file exists.
   g. Re-run `npm run specskill:status "<name>" --json` to update loop condition.
   h. If critically unclear, use `AskUserQuestion`.
5. **Final:** Run `npm run specskill:status "<name>"`.

## Comandos npm (Independência de Framework)

| Comando npm | Descrição |
|-------------|-----------|
| `npm run specskill:new "<name>"` | Cria nova change |
| `npm run specskill:status "<name>" --json` | Status da change em JSON |
| `npm run specskill:list -- --json` | Lista changes ativas |
| `npm run specskill:instructions "<name>" <id> --json` | Instruções de artefato |
| `npm run specskill:continue "<name>"` | Continua change bloqueada |
| `npm run specskill:archive "<name>"` | Arquiva change completa |

## Output
Summarize: Change name/location, artifacts created. End with: "Run `/specskill:apply` to start implementing."
