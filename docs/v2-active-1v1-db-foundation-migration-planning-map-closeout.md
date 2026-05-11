# V2 Active 1v1 DB Foundation Migration Planning Map Close-out

## Status

PASS WITH NOTES

## Scope

This close-out records the V2 Active 1v1 DB Foundation Migration Planning Map — Doc-only Exact Decision Closure result.

This was not:

- migration
- migration file
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

The goal was to prepare a doc-only migration planning map for the first V2 active 1v1 DB foundation slice.

The result is:

DB foundation migration planning map is ready.

Migration cannot be written yet.

DB-only production PR cannot start yet.

Production implementation cot start yet.

## Planning map boundary

This planning map allows:

- first DB foundation slice boundary planning
- table/family boundary candidate closure
- field intent candidate closure
- enum/state naming candidate closure
- constraint/index predicate candidate closure
- source uniqueness key shape candidate closure
- global publisher rate config storage candidate closure
- seed/backfill/rollback direction planning

This planning map does not allow:

- writing migration files
- writing SQL
- writing Drizzle schema
- starting DB-only production PR
- starting API implementation
- starting UI implementation
- starting LiveKit implementation
- starting chat transport implementation
- giving Codex a production prompt

## First DB foundation slice result

The first DB foundation slice candidate includes:

- minute packages
- minute orders
- narrow bank transfer / payment approval
- minute wallets
- minute ledger entries
- call requests
- call sessions
- global publisher minute unit rate config
- publisher earning source

The first DB foundation slice excludes:

- publisher payout / manual tracking
- correction / refund model
- future publisher-specific rate override
- UI / admin panel breadth
- LiveKit implementation
- chat transport
- API route implementation
- gift / DM / social scope

## Owner-rule addendum / clarification

This addendum does not change the close-out result.

It clarifies publisher earning source direction:

- paid 1v1 earning remains required in the first slice
- finalized paid `call_sessions` minutes remain the mandatory first-slice publisher earning source
- publisher earning source model must not be conceptually hard-coded to `call_sessions` only
- owner-approved future source may also come from public broadcast duration derived from `broadcasts.started_at` / `broadcasts.ended_at`
- `broadcasts` remains public broadcast lifecycle only and must not absorb earning/payment/payout state
- public broadcast duration source is not automatically included in the first DB foundation slice by this close-out
- gift or other future earning sources remain outside the first slice unless separately approved in a later review
- public broadcast duration first-slice vs future-source placement must be reviewed in the Visual Schema / Flow / Surface Map Checkpoint

## V1 protection result

V1 schema must remain protected.

V2 DB foundation planning must not mutate or overload:

- accounts
- auth_sessions
- broadcasts
- cover_images
- publisher_applications
- publisher_settings

Guards:

- accounts remains single-role
- account_roles is not introduced
- auth_sessions does not absorb call/payment/financial state
- broadcasts remains public broadcast lifecycle only
- broadcasts does not absorb private 1v1/payment/chat/earning/payout/social state
- publisher_settings does not become a junk drawer
- cover_images remains admin predefined cover image catalog
- publisher_applications remains publisher approval truth only

## Table / family boundary candidates

The planning map identified table/family boundary candidates.

These are planning candidates, not Drizzle schema implementation freeze.

Candidate boundaries:

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

These names are not production schema freeze.

They must be reviewed again in the exact spec readiness audit before any migration.

## Field intent candidates

Field intent was mapped for the first DB foundation slice.

Categories:

- identity / reference
- status / state
- timestamps
- minute / money / rate
- source / snapshot
- audit / idempotency
- nullability / defaults

Important:

This is field intent only.

It is not Drizzle field implementation.

Exact field names, column types, nullability, defaults, and constraints remain not frozen.

## Enum / state naming candidates

The planning map identified naming candidates for:

- package status
- order/payment status
- wallet/ledger direction/type
- request lifecycle
- session lifecycle
- earning source lifecycle
- global rate config lifecycle

Important:

These are naming candidates only.

Exact enum/state implementation remains not frozen.

The accepted / active / finalizing predicate set still needs final review before migration.

## Constraint / index predicate candidates

The planning map identified guard needs for:

- wallet per user uniqueness
- pending request duplicate guard
- one active call per publisher
- one active paid call per user
- ledger debit source uniqueness
- ledger credit source uniqueness
- publisher earning source uniqueness
- payment/order approval idempotency
- global rate effective uniqueness
- public broadcast lifecycle no-touch guard

Important:

Exact SQL, exact Drizzle definitions, exact names, and exact predicates remain not frozen.

Partial predicate sets must be reviewed before migration.

## Source uniqueness key direction

The planning map confirmed:

source_type + source_id alone is not enough.

Safer source uniqueness direction requires owner/context dimensions such as:

- wallet_id / account_id
- publisher_account_id where relevant
- direction
- entry type / earning type
- source_type
- source_id

Direction:

- ledger debit source should prevent duplicate call finalize debit
- ledger credit source should prevent duplicate payment approval credit
- publisher earning source should prevent duplicate earning for the same finalized call session
- publisher earning source family should remain open to owner-approved future source types such as public broadcast duration
- original financial sources should not be mutated by payout, correction, or refund

Still unknown:

- exact source enum names
- exact key shape
- exact constraint/index implementation
- correction/refund later implementation

## Global publisher rate config direction

The planning map confirmed:

- global publisher minute unit rate should be separate from user package price
- publisher-specific override remains future
- earning source should snapshot the rate used at finalize time
- one active global rate must be guarded conceptually
- initial global rate value requires owner decision before migration

Candidate storage direction:

- a dedicated global publisher minute rate config family

Important:

Exact storage, exact field names, exact precision, exact seed, and exact owner value remain not frozen.

## Seed / backfill / rollback direction

The planning map confirmed:

- first DB foundation should be additive and V1-safe
- destructive migration should be avoided in the first DB foundation slice
- actual DB state inspection is required before migration
- global publisher rate initial seed/value must be decided before migration
- minute package catalog values must be decided before migration or explicit empty/manual setup must be accepted
- V1 tables should be no-touch unless proven necessary
- rollback safety must be considered before migration execution
- backup/checkpoint should exist before applying DB changes

Still unknown:

- actual DB state
- final global publisher minute unit rate
- actual package catalog values
- exact generated diff
- exact migration file split
- migration dry-run result

## Migration order direction

The planning map direction is:

1. V1 no-touch checkpoint
2. global rate config boundary
3. minute package catalog boundary
4. minute order + bank transfer approval boundary
5. wallet summary boundary
6. ledger entries boundary
7. call requests boundary
8. call sessions boundary
9. publisher earning source boundary
10. constraint/index review
11. seed review
12. rollback checkpoint

This is not a migration plan.

No migration should be written from this close-out alone.

## Production blocker register

Can be carried forward as planning outputs:

- table boundary candidates
- field intent candidates
- enum/state naming candidates
- source uniqueness key shape direction
- partial predicate direction
- global rate config storage direction
- seed/backfill/rollback direction
- V1 no-touch boundary

Still blocks actual migration:

- exact Drizzle syntax
- exact SQL
- exact migration file split
- exact generated diff review
- actual DB state inspection
- final owner value for global publisher rate
- package catalog actual values
- exact lock order
- exact transaction implementation
- final code review
- migration dry-run
- backup/checkpoint before applying

## Decision result

### Is the migration planning map PASS?

Yes, PASS WITH NOTES.

### Can migration file writing start?

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

This planning map is PASS WITH NOTES because:

- V1 schema boundary remains protected
- current repo schema remains V1 core
- V2 first DB foundation families remain separate extensions
- publisher payout / correction / publisher-specific rate override remain outside the first slice
- table/family boundary candidates were mapped without schema implementation freeze
- field intent candidates were mapped without Drizzle field freeze
- enum/state naming candidates were mapped without production enum freeze
- constraint/index predicate candidates were mapped without SQL/Drizzle freeze
- source_type + source_id was identified as insufficient alone
- safer source uniqueness direction was identified
- global publisher minute rate config direction was identified
- seed/backfill/rollback direction was identified
- migration / SQL / Drizzle schema / Codex prompt were not produced

## Next

Suggested next work:

V2 Active 1v1 DB Foundation Migration Exact Spec Readiness Audit — Doc-only Final Preflight

Purpose:

- review this planning map before any migration work
- separate planning candidates from implementation freeze
- check table/family name candidates
- check field intent readiness
- check enum/state candidate readiness
- check partial predicate readiness
- check source uniquess key shape readiness
- check global rate seed/value dependency
- check DB state inspection, dry-run, and rollback blockers

This next work is still doc-only.

No migration, SQL, Drizzle schema, route creation, API freeze, LiveKit production implementation, chat transport implementation, Codex implementation prompt, or production implementation should start from this close-out alone.
