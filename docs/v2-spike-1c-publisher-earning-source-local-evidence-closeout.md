# V2 Spike 1C Publisher Earning Source Accounting Local Evidence Close-out

## Status

PASS

## Scope

This close-out records a local-only throwaway publisher earning source accounting simulation result.

This was not:

- production implementation
- migration
- route creation
- schema freeze
- API implementation
- Codex implementation
- persistent feature code
- DB integration test
- payout implementation
- gift implementation

## Purpose

The goal was to validate the V2 publisher earning source accounting boundary before any migration or implementation work.

Validated assumptions:

- User minute ledger and publisher earning source stay separate.
- Finalized 1v1 session can create one publisher earning source.
- Duplicate 1v1 earning source is blocked.
- Non-active call session creates zero publisher earning.
- Active but non-finalized call session creates zero publisher earning.
- Closed public broadcast can create broadcast earning source candidate.
- Public broadcast with missing endedAt is rejected or pending review.
- Duplicate broadcast earning source is blocked.
- Same publisher mixed sources are separated by source_type totals.
- Period closure locks source snapshot total.
- Closed period total does not change after later source mutation.
- Manual payment tracking does not mutate earning source.
- Future gift placeholder is blocked in V2 accounting.

## Local simulation

Script path:

/private/tmp/poncik-v2-spike-1c-publisher-earning-source.js

Command:

node /private/tmp/poncik-v2-spike-1c-publisher-earning-source.js

Result:

PASS: 12
FAIL: 0
TOTAL: 12

## Confirmed scenarios

- finalized 1v1 session creates one publisher earning source
- duplicate 1v1 source is blocked
- non-active call session creates zero publisher earning
- active but non-finalized call session creates zero publisher earning
- closed public broadcast creates broadcast earning source candidate
- public broadcast with missing endedAt is rejected or pending review
- duplicate broadcast source is blocked
- same publisher mixed sources are separated by source_type totals
- period closure locks source snapshot total
- closed period total does not change after later source mutation
- manual payment tracking does not mutate earning source
- future gift placeholder is blocked in V2 accounting

## Key confirmations

### Publisher earning source is separate from user minute ledger

The simulation keeps publisher earning source records separate from user minute ledger behavior.

### Earning source records source accounting truth

The earning source represents where publisher earning came from, such as finalized 1v1 duration or closed public broadcast duration.

It does not represent payout status or manual payment operation truth.

### Public broadcast earning requires closed duration

Public broadcast duration can only become an earning source candidate when startedAt and endedAt exist.

A missing endedAt does not create publisher earning in the simulation.

### Period closure is snapshot-based

The closed earning period keeps its snapshot total even if source data is later mutated in the simulation.

### Manual payment tracking is separate

Manual payment tracking does not mutate earning sources.

### Gift remains out of V2

Future gift placeholder does not create V2 publisher earning.

Gift remains V3+ and is only considered as future compatibility.

## Repo impact

The simulation itself was run outside the repo under /private/tmp.

Repo impact of the simulation:

- no app code changed
- no migration created
- no route created
- no schema changed
- no production file created
- no DB connection used
- no payout implementation added
- no gift implementation added

This close-out is doc-only evidence.

## Remaining blockers before migration / implementation

This PASS does not freeze exact DB schema, constraints, transaction isolation, API implementation, payout model, or gift model.

Still pending:

- exact publisher earning source schema
- exact source_type enum
- exact source_ref uniqueness constraint
- exact earning rate and rounding rules
- exact earning period closure schema
- exact manual payment tracking schema
- exact public broadcast orphan policy
- exact transaction isolation
- exact API transition design
- exact admin operation scope
- DB integration evidence
- API transition evidence
- LiveKit private call token / handoff evidence
- mobile camera/mic optional evidence

## Next

Suggested next evidence area:

Pack 2 — Access / Handoff / Token Evidence

No migration, route creation, schema freeze, payout implementation, gift implementation, or production implementation should start from this close-out alone.
