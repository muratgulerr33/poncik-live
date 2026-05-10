# V2 Active 1v1 Schema/API Decision Audit Close-out

## Status

PASS WITH NOTES

## Scope

This close-out records the V2 Active 1v1 Schema/API Decision Audit result.

This was not:

- production implementation
- migration
- route creation
- exact schema freeze
- exact API route freeze
- enum name freeze
- constraint name freeze
- file list freeze
- LiveKit grant freeze
- chat transport freeze
- final ADR
- final product readiness
- Codex implementation prompt

## Purpose

The goal was to audit the conceptual DB/API boundary for V2 active 1v1 before any migration, schema freeze, API route freeze, or production implementation work.

The result is:

Schema/API planning can continue.

Production implementation cannot start yet.

## Current schema truth

Current repo schema remains V1 core.

Current exported schema families:

- accounts
- auth_sessions
- broadcasts
- cover_images
- publisher_applications
- publisher_settings

Current repo does not yet include V2 paid 1v1 / payment / earning schema families.

Current `broadcasts` remains narrow public broadcast lifecycle.

It must not own:

- 1v1 state
- minute state
- payment state
- chat state
- publisher earning state
- social state

## V1 / V2 DB boundary

V1 core remains narrow.

V2 active 1v1 must be added as separate extension families.

Conceptual V2 families reviewed:

- minute_packages
- minute_orders
- bank_transfer_orders / payment approval family
- minute_wallets
- minute_ledger_entries
- call_requests
- call_sessions
- publisher earning source family
- publisher payout / manual payment tracking family
- optional future publisher rate override family

These are conceptual family boundaries.

Exact table names, field names, enum names, constraints, relations, indexes, and migrations remain pending.

## V1 / V2 image reference note

The V1 and V2 DB diagrams are useful planning references.

They are not implementation truth.

Truth order remains:

1. owner lock / freeze
2. merged canonical repo docs
3. current repo schema
4. previous diagrams / old repo references
5. unknown / suggestion

Therefore:

- diagram field names are not schema freeze
- diagram table names are not migration freeze
- current repo schema remains implementation truth
- V2 diagrams remain conceptual direction only

## Transition / API boundary

The audit reviewed these conceptual transitions:

- user request create
- user request cancel
- publisher incoming read
- publisher reject
- publisher accept
- one-active-call guard
- public broadcast active state drop
- private active timestamp create
- session end
- session finalize
- minute ledger debit
- publisher earning source write
- public viewer fallback read
- expired / timeout / failed handling

These transitions are conceptual boundaries.

Exact endpoint names are not frozen.

Exact API route names are not frozen.

Exact request / response contracts are not frozen.

## Financial boundary confirmed

The audit confirmed:

- accept does not start billing
- active timestamp is the financial start boundary
- active timestamp is backend truth
- client timer is not financial truth
- camera state is not financial truth
- mic state is not financial truth
- chat state is not financial truth
- raw active duration should come from backend active/end timestamps
- finalized duration should feed debit and publisher earning source
- user package price and publisher earning must stay separate
- commission percentage is not V2 initial publisher earning truth

## Publisher earning boundary confirmed

V2 initial owner/business truth:

- publisher earning is not commission-based
- publisher earning is not derived from user package price
- publisher earning = paid minutes x global publisher minute unit rate
- future publisher-specific rate can be added later
- duration snapshot should be considered
- rate snapshot should be considered
- computed amount snapshot should be considered

Exact schema remains pending.

## Idempotency / transaction boundary confirmed

The audit confirmed conceptual need for guards around:

- double accept
- double active timestamp
- double end
- double finalize
- duplicate ledger source
- duplicate publisher earning source
- one active call per publisher
- cancel / reject / timeout vs accept race
- public broadcast drop once
- partial failure rollback

These are conceptual guard requirements.

Exact PostgreSQL constraint names, partial indexes, isolation level, SQL, Drizzle definitions, and migration details remain pending.

## API ownership boundary confirmed

Current public broadcast API boundaries must remain narrow.

`api/studio/lifecycle` must not become private call finalize.

Public LiveKit token boundary must not become private call token boundary.

Future private call API boundary should be separate conceptually.

Exact endpoint names are not frozen.

## Route / surface DB coupling guard

The audit confirmed these risks and guards:

### `/live/[username]`

Allowed:

- public watch
- phone action as 1v1 request entry

Forbidden:

- private call lifecycle ownership
- billing truth ownership
- active private media ownership

### `/studio`

Allowed:

- publisher incoming request read
- accept / reject narrow slot

Forbidden:

- active private media
- private call finalize ownership
- payment / earning dashboard breadth

### `/call/[sessionId]`

Allowed:

- active private 1v1 surface
- session-party scoped access
- optional camera/mic UX
- ephemeral active-session chat

Forbidden:

- dashboard
- payment
- gift
- admin surface
- earning panel
- discovery
- DM / inbox / persistent chat history

### Discovery / fallback

Allowed:

- public broadcast visibility / lifecycle read model

Forbidden:

- private call detail leak
- private session id leak
- direct private call state dependency

## Decision result

### Can schema planning continue?

Yes.

### Can migration start?

No.

### Can exact schema freeze happen?

No.

### Can exact API route freeze happen?

No.

### Can enum / constraint names freeze?

No.

### Can LiveKit private call grant shape freeze?

No.

### Can chat transport freeze?

No.

### Can production implementation start?

No.

## PASS criteria

This audit is PASS WITH NOTES because:

- current repo schema truth was separated from conceptual V2 planning
- `broadcasts` remained narrow public lifecycle
- V2 DB families stayed separate from V1 core
- lifecycle/API transitions were mapped conceptually
- financial truth stayed backend active timestamp based
- publisher earning stayed separate from user package price
- commission percentage was not made V2 initial truth
- idempotency needs were identified without freezing constraints
- API ownership boundaries were separated without freezing route names
- route/surface DB coupling risks were identified
- no migration, route, schema, API, file, enum, or constraint freeze was produced

## Remaining unknowns

Still pending:

- exact schema fields
- exact enum values
- exact migration order
- exact constraint names
- exact transaction boundaries
- exact API route names
- exact request / response contracts
- exact active transition condition
- exact one-active-call implementation
- exact billing rounding rule
- exact insufficient balance behavior
- exact global publisher rate source
- exact publisher payout / correction model
- exact LiveKit private token grant shape
- exact chat transport choice

## Next

Suggested next work:

V2 Active 1v1 Billing / Rounding / Rate Snapshot Decision Audit — Doc-only Boundary Pass

No migration, route creation, schema freeze, API freeze, LiveKit production implementation, chat transport implementation, Codex implementation prompt, or production implementation should start from this close-out alone.
