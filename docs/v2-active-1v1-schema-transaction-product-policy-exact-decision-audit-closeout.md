# V2 Active 1v1 Schema / Transaction / Product Policy Exact Decision Audit Close-out

## Status

PASS WITH NOTES

## Scope

This close-out records the V2 Active 1v1 Schema / Transaction / Product Policy Exact Decision Audit result.

This was not:

- production implementation
- migration
- route creation
- exact schema freeze
- exact API route freeze
- enum name freeze
- state name freeze
- constraint name freeze
- index name freeze
- LiveKit grant freeze
- chat transport freeze
- final ADR
- final product readiness
- Codex implementation prompt

## Purpose

The goal was to close the remaining product policy and transaction policy blockers at doc-only level before schema freeze readiness.

The result is:

Product policy and transaction policy direction can contine toward schema freeze readiness.

Production implementation cannot start yet.

## Policy direction result

The following directions are accepted for the next schema freeze readiness audit.

They are not schema/API/enum/constraint/migration/implementation freeze.

## Billing / rounding policy direction

Recommended V2 initial policy direction:

- active > 0 seconds becomes minimum 1 billable minute
- billable minutes use started-minute / ceil-style rounding
- floor-to-completed-minute is not recommended
- grace period is not recommended for V2 initial
- exact-seconds billing is not recommended for V2 initial

Reason:

- the product uses minute packages
- accounting stays simple
- publisher earning stays understandable
- abuse/dispute risk is lower than floor/grace models

Remaining unknown:

- exact UI copy

## Max duration policy direction

Recommended V2 initial policy direction:

- active-start available paid minutes are snapshotted
- max active duration is derived from active-start available paid minutes
- conceptual formula direction is available paid minutes x 60 seconds
- max duration cap is backend truth
- UI countdown is display only
- client timer is not financial truth

Remaining unknown:

- exact backend timer / cleanup implementation
- exact field names
- exact implementation shape

## Finalized billable duration direction

Recommended V2 initial policy direction:

- raw duration is conceptually ended_at - active_at
- raw duration is clamped by max duration cap
- billable minutes are derived during finalize
- the same finalized billable minutes source feeds user debit and publisher earning
- active timestamp missing means 0 debit and 0 earning

Remaining unknown:

- exact timestamp precision
- exact fields
- exact transaction implementation

## Finalize-time insufficient balance direction

Recommended V2 initial policy direction:

- negative balance is not recommended
- debit must succeed before publisher earning source is written
- if debit cannot safely complete, publisher earning source should not be finalized
- edge case should move to safe failed/pending correction handling
- correction/refund model remains later ops policy

Remaining unknown:

- exact failed/pending correction state
- exact manual correction process

## Wallet / ledger direction

Recommended V2 initial direction:

- ledger is append-only audit truth
- wallet summary is transactionally maintained current balance
- client balance is display only
- ledger and wallet summary must be updated in the same protected financial boundary when debit happens

This is a hybrid model.

Reason:

- balance gates stay fast
- audit trail remains clear
- transaction discipline prevents drift

Remaining unknown:

- exact schema
- reconciliation approach
- whether later derived checks are added

## Source uniqueness direction

Recommended V2 initial direction:

- finalized call session is the main source for user debit and publisher earning
- ledger debit requires conceptual source uniqueness
- publisher earning source requires conceptual source uniqueness
- original debit/earning source should not be mutated
- correction/refund should be new append-only source referencing original source

Important:

- source_type + source_id alone may be too weak if owner/direction/category are not represented
- exact key shape is not frozen
- exact constraint/index names are not frozen

Remaining unknown:

- exact source key shape
- exact table/field names

## Transaction / lock direction

Recommended V2 initial direction:

- request create should protect balance read and pending request guard
- publisher accept should protect request state, balance re-check, one-active guard, and session candidate
- active start should protect session state, wallet/balance read, active timestamp, available minutes snapshot, and max duration snapshot
- finalize is the strongest financial transaction boundary

Finalize should protect:

- finalized marker
- raw duration snapshot
- billable minutes snapshot
- ledger debit
- wallet update
- publisher earning source
- rate snapshot
- computed earning amount snapshot

Conceptual guards:

- wallet row lock / protected current balance update
- conditional state transition
- unique source guard
- rollback / retry safe behavior
- consistent lock order guideline to reduce deadlock risk

Remaining unknown:

- exact SQL
- exact Drizzle transaction implementation
- exact lock order
- exact isolation and constraint/index strategy

## Active transition direction

Recommended V2 initial policy direction:

- publisher accept does not start active
- token issue does not start active
- camera/mic opening does not start active
- LiveKit/provider event alone should not be business financial truth
- active timestamp should be server-owned
- active transition can use call handoff/provider readiness as input, but final active truth must be backend-owned
- camera/mic are optional, so chat-only active must remain possible
- failed before active has 0 debit and 0 earning
- failed after active goes through finalize

Remaining unknown:

- exact active transition condition
- exact provider signal mapping
- exact API implementation

## Cleanup / retry direction

Recommended V2 initial policy direction:

- requested stale state should expire safely
- accepted/activating stuck before active should become zero-financial terminal
- active exhausted should go through the same finalize boundary
- user end and publisher end go through the same finalize boundary
- connection failed after active goes through the same finalize boundary
- ending stuck can be retried by cleanup
- finalized re-finalize is noop
- retry after rollback can safely try again
- original financial sources should not be mutated by manual correction

Remaining unknown:

- exact cleanup mechanism
- exact retry cadence
- exact response shape
- exact provider event mapping

## First implementation PR readiness

First production PR should not start yet.

The safest next step is schema freeze readiness.

Candidate PRs reviewed:

### DB-only foundation PR

Can become first production PR later, but not yet.

Requires before start:

- schema field readiness
- enum/state readiness
- constraint/index readiness
- migration order readiness

Must not include:

- API
- UI
- LiveKit
- chat
- billing implementation breadth

### Transaction / finalize foundation PR

Not first yet.

Requires before start:

- DB foundation
- exact transaction policy
- test plan

Must not include:

- route/surface/chat breadth

### Call request/session API boundary PR

Not first yet.

Requires before start:

- DB foundation
- exact API boundary
- auth/ownership guard plan

Must not include:

- broad UI
- provider/media implementation

### Route/surface skeleton PR

Not first yet.

Requires before start:

- API/state clarity
- exact route/surface implementation plan

Must not include:

- finance mutation
- admin/payout panel
- gift/social/DM

### Docs-only PR slicing map

Safe if needed.

Must not include:

- production code
- migration
- Codex production prompt

## Freeze result

### Can product policy freeze now?

Policy direction can move toward owner acceptance / schema freeze readiness.

This is not implementation freeze.

### Can schema freeze now?

No.

### Can API route freeze now?

No.

### Can enum/state freeze now?

No.

### Can constraint/index freeze now?

No.

### Can migration start?

No.

### Can production implementation start?

No.

### Can first implementation PR planning continue?

Yes, plan-level.

### Can Codex receive production implementation prompt?

No.

## PASS criteria

This audit is PASS WITH NOTES because:

- rounding/minimum minute policy direction was selected
- active-start max duration formula direction was selected
- finalized billable duration formula direction was selected
- finalize-time insufficient balance safe behavior direction was selected
- wallet/ledger hybrid direction was selected
- source uniqueness conceptual direction was selected
- transaction / row lock / unique guard direction was selected
- active transition direction was selected
- cleanup / retry direction was selected
- first production PR was not started
- schema/API/enum/state/constraint/index/migration freeze was not produced
- Codex production prompt was not produced

## Remaining unknowns

Still pending:

- exact schema fields
- exact enum/state names
- exact constraint/index names
- exact migration order
- exact API route names
- exact request/response contracts
- exact auth/ownership guard contracts
- exact transaction implementation
- exact lock order
- exact source uniqueness key shape
- exact active transition condition
- exact backend timer/cleanup mechanism
- exact provider event mapping
- exact UI copy
- correction/refund model
- payout period close policy
- real-device UX evidence execution

## Next

Suggested next work:

V2 Active 1v1 Schema Freeze Readiness Audit — Doc-only Boundary Pass

Purpose:

- audit table family readiness
- audit eld needs readiness
- audit enum/state candidate readiness
- audit constraint/index needs readiness
- audit migration order readiness
- decide whether a later schema freeze doc can be prepared

This next work is still doc-only.

No migration, route creation, schema freeze, API freeze, LiveKit production implementation, chat transport implementation, Codex implementation prompt, or production implementation should start from this close-out alone.
