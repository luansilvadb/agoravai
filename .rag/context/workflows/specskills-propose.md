# SPECSKILLS: Propose
Create a change and generate all implementation artifacts sequentially. 
Input: `<description>`.

## Steps
1. **Context:** MANDATORY: Run only `ragskills "<description>"` in complete isolation. DO NOT use pipes (`|`), `head`, `grep`, redirects (`>`), or ANY additional commands. Execute this command standalone and wait for full completion.
   a. Read `.rag/research/skills.md`  
2. **Scaffold:** Run `specskills new "<name>"`. (If exists, ask: continue or create new?)
3. **Status:** Run `specskills status "<name>" --json`. Extract `applyRequires` and `artifacts`.
4. **Artifact Loop:** Use `TodoWrite`. Loop until all IDs in `applyRequires` are `status: "done"`:
   a. Pick a `ready` artifact (no pending dependencies).
   b. Run `specskills instructions "<name>" <artifact-id> --json`.
   c. Parse JSON. Read files in `dependencies`. Apply `.rag/research/skills.md` rules.
   d. **Write:** Use `template` for structure. Fill using `instruction`. 
   e. **Silent Constraints:** `context` and `rules` are constraints for YOU. NEVER copy `<context>`, `<rules>`, or `<project_context>` into the output file.
   f. Write to `outputPath`. Verify file exists.
   g. Re-run `specskills status "<name>" --json` to update loop condition.
   h. If critically unclear, use `AskUserQuestion`.
5. **Final:** Run `specskills status "<name>"`.

## Comandos npm (Independência de Framework)

| Comando npm | Descrição |
|-------------|-----------|
| `specskills new "<name>"` | Cria nova change |
| `specskills status "<name>" --json` | Status da change em JSON |
| `specskills list --json` | Lista changes ativas |
| `specskills instructions "<name>" <id> --json` | Instruções de artefato |
| `specskills continue "<name>"` | Continua change bloqueada |
| `specskills archive "<name>"` | Arquiva change completa |

## Output
Summarize: Change name/location, artifacts created. End with: "Run `specskills apply <name>` to start implementing."
