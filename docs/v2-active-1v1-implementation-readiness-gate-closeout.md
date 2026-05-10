# V2 Active 1v1 Implementation Readiness Gate Close-out

## Status

PASS WITH NOTES

## Scope

This close-out records the V2 Active 1v1 Implementation Readiness Gate result for state machine, financial transaction, and remaining unknown closure.

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

The goal was to decide whether V2 active 1v1 can move from doc-only audits toward first implementation PR planning.

The result is:

First implementation PR planning can continue at plan level.

Production implementationcannot start yet.

## Gate result

Implementation readiness gate:

PASS WITH NOTES

Meaning:

- state machine planning is strong enough for PR slicing
- financial transaction boundary is strong enough for PR slicing
- route / surface ownership is strong enough for PR slicing
- exact implementation remains blocked by first implementation PR blockers

## What is ready

The following are ready at planning level:

- V2 DB/API family boundary
- active 1v1 state-machine meaning map
- active-start backend timestamp as financial start truth
- active-start available minutes snapshot direction
- backend max duration cap direction
- single finalize boundary direction
- double finalize noop direction
- ledger debit source uniqueness need
- publisher earning source uniqueness need
- publisher earning separated from user package price
- manual payout not mutating finalized earning source
- `/live`, `/studio`, `/call` ownership separation
- token issue as access/provider seam only
- `broadcasts` remaining public lifecycle only

## What is not ready

Production implementation is not ready because these remain open:

- exact rounding / minimum billable minute policy
- exact active-start max duration formula
- exact finalized billable duration formula
- finalize-time insufficient balance behavior
- wallet summary vs ledger-derived balance decision
- source uniqueness conceptual key shape
- active transition condition
- cleanup / retry policy
- exact transaction boundary
- exact row lock / unique guard implementation
- exact schema fields
- exact migration order
- exact API route names
- exact backend timer / cleanup behavior

## Blocker classification

### First implementation PR blockers

These must close before the first relevant production PR:

- rounding / minimum billable minute policy
- active-start max duration formula
- finalized billable duration formula
- finalize-time insufficient balance behavior
- wallet truth decision
- source uniqueness key shape
- active transition condition
- cleanup / retry policy
- transaction / row lock / unique guard policy

### Migration blockers

These must close before migration:

- exact schema fields
- exact enum values
- exact constraint/index strategy
- exact migration order

### API implementation blockers

These must close before API production work:

- exact API route names
- exact request / response contracts
- exact auth / ownership guards
- exact transition behavior

### Later PR / final readiness blockers

These can remain tracked for now:

- exact UI copy
- correction / refund model
- payout period close policy
- real-device UX evidence execution
- final launch hardening

## State machine readiness

State machine is ready for planning, not implementation.

Confirmed:

- requested / accepted / activating before active create no debit and no earning
- cancelled / rejected / expired before active create no debit and no earning
- failed before active creates no debit and no earning
- backend active timestamp starts financial duration
- active-after close paths converge into finalize
- finalized is terminal for financial writes
- double finalize should be noop

Still pending:

- exact enum names
- exact state names
- exact transition names
- exact active transition condition
- exact cleanup / retry mechanism

## Financial transaction readiness

Financial transaction boundary is ready for planning, not implementation.

Confirmed conceptual boundary:

- finalize marker
- raw duration snapshot
- billable minutes snapshot
- user minute ledger debit
- wallet update if wallet summary exists
- publisher earning source
- rate snapshot
- computed earning amount snapshot

These belong to one protected financial boundary.

Still pending:

- exact transaction implementation
- exact lock strategy
- exact uniqueness key shape
- wallet summary vs derived balance decision
- exact rollback / retry behavior

## Product and ops readiness

Confirmed:

- publisher earning is not commission-based
- publisher earning is not derived from user package price
- publisher earning = paid minutes x global publisher minute unit rate
- global publisher minute unit rate is needed for V2 initial
- full admin rate panel is not automatically required first
- manual/config fallback may be acceptable initially
- manual payout must not mutate finalized earning source

Still pending:

- exact global publisher minute unit rate source
- correction / refund policy
- payout period close policy
- exact UI copy

## Route / API / surface readiness

Planning-level ownership is clear:

- `/live/[username]` owns public watch + phone action entry
- `/studio` owns incoming request + accept/reject narrow slot
- `/call/[sessionId]` owns active private call UX
- token issue owns access/provider seam only
- `api/studio/lifecycle` remains public broadcast lifecycle
- `broadcasts` remains public lifecycle only

Still pending:

- exact API route names
- exact request / response contracts
- exact route implementation
- exact file ownership

## Freeze result

### Can exact rounding rule freeze now?

No.

### Can exact max duration formula freeze now?

No.

### Can exact schema freeze now?

No.

### Can exact API route names freeze now?

No.

### Can enum/state names freeze now?

No.

### Can constraint/index names freeze now?

No.

### Can migration start?

No.

### Can production implementation start?

No.

### Can Codex receive production implementation prompt?

No.

### Can first implementation PR planning continue?

Yes, plan-level only.

## PASS criteria

This gate is PASS WITH NOTES because:

- remaining unknowns were classified by blocker level
- state machine is enough for planning
- financial transaction boundary is enough for planning
- production implementation blockers were clearly identified
- migration/schema/API freeze was not produced
- Codex production prompt was not produced
- V1/V2 boundaries remained intact
- `broadcasts` remained public lifecycle only
- billing remains backend active timestamp based
- token issue remains non-financial access seam

## Next

Suggested next work:

V2 Active 1v1 Schema / Transaction / Product Policy Exact Decision Audit

Purpose:

- close exact rounding / minimum billable minute policy
- close active-start max duration formula
- close finalized billable duration formula
- close finalize-time insufficient balance behavior
- close wallet summary vs ledger-derived truth
- close source uniqueness key shape
- close transaction / row lock / unique guard policy
- close active transition condition
- close cleanup / retry policy

This next work is still doc-only.

No migration, route creation, schema freeze, API freeze, LiveKit production implementation, chat transport implementation, Codex implementation prompt, or production implementation should start from this close-out alone.
