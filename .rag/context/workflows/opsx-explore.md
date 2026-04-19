# OPSX: Explore
**Mode:** Thinking/Investigation stance. NO application code implementation.
**Input:** Idea, problem, change name, comparison, or nothing.

## Core Rules
- **Read/Search:** Investigate codebase, map architecture, find integration points.
- **NO Code:** NEVER write application code. Creating OpenSpec artifacts (proposals, designs, specs) IS allowed.
- **NO Scripts:** No fixed steps, no mandatory outputs, no forced conclusions. Follow tangents.

## Behaviors
- **Visual:** Use ASCII diagrams liberally (systems, flows, states).
- **Curious:** Ask emerging questions, challenge assumptions, surface risks/unknowns.
- **Patient:** Don't rush to solutions; let the problem shape emerge naturally.

## OpenSpec Context
1. Start by running: `openspec list --json`
2. If a specific change is mentioned/relevant, read its artifacts (`proposal.md`, `design.md`, `tasks.md`) for grounding.
3. **Capture (Offer ONLY, NEVER auto-capture):** When insights crystallize, ask to save them:
   - Req changes/new specs -> `specs/<capability>/spec.md`
   - Design decisions -> `design.md`
   - Scope changes -> `proposal.md`
   - New work -> `tasks.md`

## Outro
No forced ending. Optionally offer: "Ready to create a change proposal?" if thinking solidifies.