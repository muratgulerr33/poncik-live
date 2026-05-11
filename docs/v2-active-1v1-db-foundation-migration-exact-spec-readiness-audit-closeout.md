# V2 Active 1v1 DB Foundation Migration Exact Spec Readiness Audit Close-out

## Status

PASS WITH NOTES

## Scope

This close-out records the V2 Active 1v1 DB Foundation Migration Exact Spec Readiness Audit — Doc-only Final Preflight result.

This was not:

- migration
- migration plan
- SQL
- Drizzle schema file
- production implementation
- route creation
- API route freeze
- LiveKit implementation
- chat transport implementation
- final ADR
- final product readiness
- Codex implementation prompt

## Purpose

The goal was to review the DB Foundation Migration Planning Map before any migration work.

The result is:

Exact spec readiness audit passed with notes.

Visual Schema / Flow / Surface Map Checkpoint must happen before migration spec / plan.

Migration cannot britten yet.

DB-only production PR cannot start yet.

Production implementation cannot start yet.

## Final preflight boundary

This audit confirms:

- planning candidates are safe enough for visual checkpoint
- DB family separation remains valid
- V1 no-touch boundary remains valid
- financial truth remains backend / DB centered
- source uniqueness direction remains valid
- global publisher rate config direction remains valid
- seed / backfill / rollback blockers remain visible

This audit does not allow:

- writing migration files
- writing SQL
- writing Drizzle schema
- starting DB-only production PR
- starting API implementation
- starting UI implementation
- starting LiveKit implementation
- starting chat transport implementation
- giving Codex a production prompt

## Owner-rule addendum / clarification

This addendum does not change the audit result.

It clarifies publisher earning source scope before visual review:

- paid 1v1 earning remains the required first-slice source direction
- finalized paid `call_sessions` minutes remain the mandatory first-slice publisher earning source
- publisher earning source family must stay source-based and not be narrowed to `call_sessions` only
- owner-approved future source may also come from public broadcast duration derived from `broadcasts.started_at` / `broadcasts.ended_at`
- `broadcasts` remains lifecycle-only truth and must not absorb earning/payment/payout state
- public broadcast duration earning is not frozen into the first DB foundation slice by this audit
- gift and similar future earning sources remain future and outside the first slice
- public broadcast duration first-slice vs future-source placement must be decided in the Visual Schema / Flow / Surface Map Checkpoint owner review

## Planning candidate vs implementation freeze result

The following remain planning candidates only:

- table / family boundaries
- field intent candidates
- enum / state naming candidates
- constraint / index predicate candidates
- source uniqueness key shape candidates
- global publisher rate config candidates
- seed / backfill / rollback direction

They are not implementation freeze.

They must be visually reviewed before migration spec / plan.

## Table / family readiness result

The following candidate families are ready for visual checkpoint review:

- minute_packages
- minute_orders
- bank_transfer_orders
- minute_wallets
- minute_ledger_entries
- call_requests
- call_sessions
- publisher_minute_rates
- publisher_earning_entries

Important:

These names are planning candidates.

They are not Drizzle schema implementation freeze.

## Field intent readiness result

Field intent is ready for visual checkpoint.

Field intent categories remain:

- identity / reference
- status / state
- timestamps
- minute / money / rate
- source / snapshot
- audit / idempotency
- nullability / defaults

Still not frozen:

- exact Drizzle field names
- exact column types
- exact nullable / default values
- exact constraints
- exact indexes

## Enum / state readiness result

Enum and state candidates are ready for visual checkpoint.

State groups:

- package status
- order / payment status
- wallet / ledger direction and type
- request lifecycle
- session lifecycle
- earning source lifecycle
- global rate config lifecycle

Important note:

- accepted state should not be treated as active financial truth by itself
- active / finalizing / finalized state boundaries must be visually reviewed
- pending request duplicate guard state set must be visually reviewed
- correction / refund remains future and must not enter the first DB slice

Exact enum/state implementation remains not frozen.

## Constraint / index readiness result

Constraint and index needs are ready for visual checkpoint.

Guard needs:

- wallet per user uniqueness
- pending request duplicate guard
- one active call per publisher
- one active paid call per user
- ledger debit source uniqueness
- ledger credit source uniqueness
- publisher earning source uniqueness
- payment / order approval idempotency
- global rate effective uniqueness
- public broadcast lifecycle no-touch guard

Still not frozen:

- exact SQL
- exact Drizzle definitions
- exact names
- exact predicates
- exact partial index state sets

## Source uniqueness readiness result

The audit confirms:

source_type + source_id alone is not enough.

Safer source uniqueness must include owner/context dimensions where relevant:

- wallet_id / account_id
- publisher_account_id
- direction
- entry type / earning type
- source_type
- source_id

This protects against:

- duplicate call finalize debit
- duplicate payment approval credit
- duplicate publisher earning for the same finalized call session
- over-narrowing publisher earning source to a single source family before owner review
- accidental mutation of original financial source by payout, correction, or refund

Still unknown:

- exact source enum names
- exact key shape
- exact constraint / index implementation
- correction / refund future implementation

## Global publisher rate readiness result

The audit confirms:

- global publisher minute unit rate should be separate from user package price
- publisher-specific override remains future
- earning source should snapshot the rate used at finalize time
- one active global rate must be guarded conceptually
- initial global rate value requires owner decision before migration

Still unknown:

- exact storage shape
- exact field names
- exact precision / scale
- exact seed value
- final owner value

## Seed / backfill / rollback readiness result

The audit confirms:

- actual DB state inspection is required before migration
- first DB foundation should be additive and V1-safe
- destructive migration should be avoided in the first DB foundation slice
- global rate initial value requires owner input
- package catalog values require owner input or explicit empty/manual setup acceptance
- rollback checkpoint and backup are required before applying DB changes
- migration dry-run remains required before production DB work

Still blocking actual migration:

- actual DB state inspection
- final global publisher rate value
- package catalog actual values or explicit empty/manual setup decision
- exact generated diff
- exact migration file split
- migration dry-run result
- backup/checkpoint before applying

## V1 no-touch readiness result

V1 schema and surfaces remain protected.

V2 DB foundation work must not mutate or overload:

- accounts
- auth_sessions
- broadcasts
- cover_images
- publisher_applications
- publisher_settings

Guards:

- accounts remains single-role
- account_roles is not introduced
- auth_sessions remains auth/session only
- broadcasts remains public broadcast lifecycle only
- broadcasts does not absorb private 1v1/payment/chat/earning/payout/social state
- publisher_settings remains narrow
- cover_images remains admin predefined cover image catalog
- publisher_applications remains publisher approval truth only

## Production blocker register

These remain blockers before actual migration / DB-only production PR:

- exact Drizzle syntax
- exact SQL
- exact migration file split
- exact generated diff review
- actual DB state inspection
- final owner value for global publisher rate
- package catalog actual values or explicit empty/manual setup decision
- exact lock order
- exact transaction implementation
- exact partial index predicates
- exact source uniqueness key shape
- exact enum/state names
- exact nullable/default policy
- exact precision/scale for money/rate fields
- final code review
- migration dry-run
- backup/checkpoint before applying
- Visual Schema / Flow / Surface Map Checkpoint owner review

## Visual checkpoint decision

Visual checkpoint is required before migration spec / plan.

Reason:

- owner and builder must see DB, flow, finance, and UI surface shape before migration planning hardens
- planning candidates must not accidentally become implementation freeze
- V1 no-touch boundary should be visible
- first DB slice in/out boundary should be visible
- wallet / ledger / earning flow should be understandable before DB work

The visual checkpoint must include:

- DB family map
- 1v1 flow map
- wallet / ledger / earning flow map
- user UI surface map
- publisher UI surface map
- admin UI surface map
- first DB slice in/out map
- blocker map

This checkpoint is not:

- implementation
- migration
- SQL
- Drizzle schema
- Codex prompt
- production readiness

## Decision result

### Is Exact Spec Readiness Audit PASS?

Yes, PASS WITH NOTES.

### Can migration spec / plan be started directly?

No.

### What must happen first?

Visual Schema / Flow / Surface Map Checkpoint.

### Can migration be written?

No.

### Can SQL be written?

No.

### Can Drizzle schema be written?

No.

### Can DB-only production PR start?

No.

### Can Codex production prompt be given?

No.

### Can production implementation start?

No.

## PASS criteria

This audit is PASS WITH NOTES because:

- V1 no-touch boundary remains protected
- V2 DB family candidates are separated from V1 core
- planning candidates were not treated as implementation freeze
- field intent remains non-Drizzle implementation
- enum/state candidates remain non-production enum freeze
- constraint/index candidates remain non-SQL/non-Drizzle freeze
- source_type + source_id alone was confirmed insufficient
- safer source uniqueness direction remains valid
- global publisher rate config remains separate from package price
- ledger append-only audit truth and wallet current balance summary remain separated
- seed/backfill/rollback blockers remain explicit
- visual checkpoint was inserted before migration spec / plan
- migration / SQL / Drizzle schema / Codex prompt / production PR were not produced

## Next

Suggested next work:

V2 Active 1v1 Visual Schema / Flow / Surface Map Checkpoint — Doc-only Owner Review Map

Purpose:

- create visual DB family map
- create 1v1 request/session/finalize flow map
- create wallet / ledger / earning flow map
- create user / publisher / admin visible surface map
- show first DB slice in/out boundary
- show blocker map for owner review

This next work is still doc-only.

No migration, L, Drizzle schema, route creation, API freeze, LiveKit production implementation, chat transport implementation, Codex implementation prompt, or production implementation should start from this close-out alone.
