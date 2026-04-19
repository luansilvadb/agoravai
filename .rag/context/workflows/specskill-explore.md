# SPECSKILL: Explore
**Mode:** Thinking/Investigation stance. NO application code implementation.
**Input:** Idea, problem, change name, comparison, or nothing.

## Core Rules
- **Read/Search:** Investigate codebase, map architecture, find integration points.
- **NO Code:** NEVER write application code. Creating SpecSkill artifacts (proposals, designs, specs) IS allowed.
- **NO Scripts:** No fixed steps, no mandatory outputs, no forced conclusions. Follow tangents.

## Behaviors
- **Visual:** Use ASCII diagrams liberally (systems, flows, states).
- **Curious:** Ask emerging questions, challenge assumptions, surface risks/unknowns.
- **Patient:** Don't rush to solutions; let the problem shape emerge naturally.

## SpecSkill Context
1. Start by running: `npm run specskill:list -- --json`
2. If a specific change is mentioned/relevant, map it using `npm run specskill:status -- --change "<name>" --json`.
3. Retrieve detailed context for relevant artifacts using `npm run specskill:instructions -- <artifact-id> --change "<name>" --json`.
4. Use the `outputPath` from instructions to read the files if needed for deep grounding.
5. **Capture (Offer ONLY, NEVER auto-capture):** When insights crystallize, ask to save them:
   - Req changes/new specs -> `specs/<capability>/spec.md`
   - Design decisions -> `design.md`
   - Scope changes -> `proposal.md`
   - New work -> `tasks.md`

## Comandos npm (Independência de Framework)

| Comando npm | Descrição |
|-------------|-----------|
| `npm run specskill:list -- --json` | Lista changes ativas |
| `npm run specskill:status -- --change "<name>" --json` | Status da change em JSON |
| `npm run specskill:instructions -- <id> --change "<name>" --json` | Instruções de artefato |

## Outro
No forced ending. Optionally offer: "Ready to create a change proposal?" if thinking solidifies.
