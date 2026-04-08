---
description: 'Require bounded self code review for agent-authored changes, with iterative fixes and loop prevention.'
applyTo: '**'
---

# Self Code Review Loop

Use this workflow for any agent-authored change set (code, tests, stories,
docs, or configuration).

## Review cycle

1. Review the current diff and classify findings as P0, P1, P2, or P3.
2. Fix all P0/P1 findings before continuing.
3. Fix P2 findings unless there is a documented trade-off decision.
4. Treat P3 findings as optional improvements.
5. Repeat review/fix cycles until there are no unresolved P0/P1 findings.

## Loop prevention

- Hard cap: **3 review passes** per change set.
- If two consecutive passes report materially identical findings and the diff
  did not change meaningfully, stop iterating and report the blocker/decision.
- Do not re-apply no-op edits.

## Decision discipline

When two valid implementation options exist:

- Write a short pros/cons note.
- State the selected option and why.

## Exit criteria

- No unresolved P0/P1 findings.
- No new regressions introduced by the latest edits.
- Required repository validation commands pass in the documented order.
