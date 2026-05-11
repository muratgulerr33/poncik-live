# V2 Active 1v1 Migration Readiness Audit Close-out

## Status

PASS WITH NOTES

## Scope

This close-out records the V2 Active 1v1 Migration Readiness Audit — Doc-only Exact Preflight result.

This was not:

- migration
- migration plan
- SQL
- Drizzle schema file
- production implementation
- route creation
- exact API route freeze
- API implementation
- LiveKit implementation
- chat transport implementation
- final ADR
- final product readiness
- Codex implementation prompt

## Purpose

The goal was to check whether document-level schema freeze decisions are ready to move toward migration planning.

The result is:

Migration planning doc can begin.

Migration cannot be written yet.

DB-only production PR cannot start yet.

Production implementation cannot start yet.

Superseded / owner decision update:

- public broadcast duration publisher earning source is resolved into the first DB foundation slice
- compact publisher payment reconciliation is resolved into the first DB foundation slice
- full payout/accounting engine remains later/future scope

## Migration readis boundary

This audit allows:

- doc-only migration planning map preparation
- first DB foundation slice planning at plan level
- exact-decision closure for table boundary, field groups, enum/state naming, constraint/index predicates, source uniqueness, seed/backfill, and rollback safety

This audit does not allow:

- writing migration files
- writing SQL
- writing Drizzle schema
- starting DB-only production PR
- starting API implementation
- starting UI implementation
- starting LiveKit implementation
- starting Codex production prompt

## Current repo schema truth

Current repo schema remains V1 core.

Current exported families remain:

- accounts
- auth_sessions
- broadcasts
- cover_images
- publisher_applications
- publisher_settings

Current repo schema does not yet include V2 paid 1v1 / payment / earning families.

## V1 protection result

V2 migration planning must keep these V1 families protected:

- accounts
- auth_sessions
- broadcasts
- cover_images
- publisher_applications
- publisher_settings

Protection rules:

- accounts should not become multi-role
- account_roles should not be introduced
- auth_sessions should not absorb call/payment/financial state
- broadcasts should remain public broadcast lifecycle only
- broadcasts should not absorb private 1v1/payment/chat/earning/payout/social state
- cover_images should remain admin predefined cover image catalog
- publisher_applications should remain publisher approval truth only
- publisher_settings should remain narrow and should not become a junk drawer

## Migration planning readiness result

Migration planning can start because:

- V2 family responsibilities are document-level frozen
- V2 first DB foundation slice boundary is known at plan level
- V1 no-touch / protected schema boundary is known
- transaction boundaries are known at planning level
- major DB race guards are known at planning level
- later/future scope is separated from first slice

Migration writing cannot start because exact implementation decisions remain open.

## Exact unknowns that still block migration

Still blocking migration:

- exact table names
- exact Drizzle field names
- exact enum/state names
- exact constraint/index names
- exact partial index predicates
- exact source uniqueness key shape
- exact global rate config storage implementation
- exact payment approval detail
- exact migration files/order
- exact backfill/data safety
- exact rollback safety
- exact lock order
- exact transaction implementation

These must close before any migration or DB-only production PR.

## Family-by-family readiness

### Planning-ready first DB foundation candidates

The following families are planning-ready but not migration-ready:

- minute_packages
- minute_orders
- bank_transfer_orders / payment approval, narrow only
- minute_wallets
- minute_ledger_entries
- call_requests
- call_sessions
- publisher earning source
- public broadcast duration publisher earning source
- compact publisher payment reconciliation
- global publisher minute unit rate config

### Later / excluded from first slice

The following should stay outside the first DB foundation slice:

- full payout / accounting engine
- correction/refund model
- future publisher-specific rate override

## Constraint/index readiness

The following needs are known at planning level but exact shape remains unknown:

- wallet per user uniqueness
- pending request duplicate guard
- one active call per publisher
- one active paid call per user
- ledger debit source uniqueness
- publisher earning source uniqueness
- payment/order approval idempotency
- global rate effective uniqueness
- public broadcast lifecycle guard

Exact partial predicates, exact source keys, exact SQL, exact names, and exact Drizzle definitions remain not frozen.

## Transaction / migration coupling

The following transaction boundaries are planning-ready:

- request create
- publisher accept
- active start
- finalize debit
- publisher earning source write
- payment approval credit
- cleanup / retry

But production migration remains blocked until:

- exact schema fields are known
- exact lock targets are known
- exact uniqueness keys are known
- exact partial predicates are known
- exact rollback / retry safety is known

## Data safety / backfill / rollback

The audit classified current risk as manageable only if the future migration remains additive and V1-safe.

Required before migration:

- confirm current DB state
- write V1 no-touch list
- avoid destructive migration in first DB foundation slice
- keep owner starting rate values fixed at planning level while exact storage/activation mechanics remain unresolved
- keep resolved owner package catalog values fixed while exact seed/manual activation mechanics remain unresolved
- define rollback/no-destructive policy
- define backfill expectations
- confirm payment approval needs no initial data

Resolved owner values carried forward:

- paid 1v1 publisher earning rate = 5 TL/minute
- public broadcast duration earning rate = 1 TL/minute
- started minute counts and any duration `> 0` yields minimum 1 minute
- initial package catalog values are resolved as owner values

## First DB foundation migration candidate

Future first DB foundation migration planning may include:

- minute package/order/payment foundation
- wallet + ledger foundation
- call request/session foundation
- global publisher rate config
- publisher earning source
- public broadcast duration publisher earning source
- compact publisher payment reconciliation
- core uniqueness / source guard needs

It must exclude:

- API implementation
- UI implementation
- LiveKit implementation
- chat transport
- payout UI
- correction/refund implementation
- publisher-specific rate override
- broad admin panel
- gift/DM/social scope

## Still later / not first slice

These remain later/future:

- full payout/accounting engine
- correction/refund model
- future publisher-specific rate override
- exact LiveKit grant/private token shape
- exact chat transport
- exact API route names/contracts
- exact UI copy

## Decision result

### Can migration planning doc start?

Yes.

### Can migration be written now?

No.

### Can DB-only production PR start?

No.

### Can Codex production prompt be given?

No.

### Can production implementation start?

No.

## PASS criteria

This audit is PASS WITH NOTES because:

- V1 schema protection remains intact
- current repo schema remains V1 core
- V2 families are document-level separated
- first DB foundation slice can be planned at doc-only level
- public broadcast duration earning is resolved into the first slice
- compact reconciliation is resolved into the first slice while full payout/accounting remains later
- migration writing remains blocked
- DB-only production PR remains blocked
- exact table/field/enum/constraint/index/source key/migration order remains open
- source uniqueness and partial predicate blockers were identified
- exact global rate config storage/activation mechanics remain blockers while owner starting values are resolved
- backfill/data safety/rollback blockers were identified
- correction/future rate override/full payout-accounting were kept outside the first slice
- Codex production prompt was not produced

## Next

Suggested next work:

V2 Active 1v1 DB Foundation Migration Planning Map — Doc-only Exact Decision Closure

Purpose:

- define first DB foundation slice boundary
- close exact table boundary decisions at planning level
- prepare field groups to field closure
- prepare enum/state naming closure
- prepare constraint/index predicate closure
- prepare source uniqueness key shape decision
- prepare global rate config storage decision
- prepare seed/backfill and rollback safety decisions

This next work is still doc-only.

No migration, SQL, Drizzle schema, route creation, API freeze, LiveKit production implementation, chat transport implementation, Codex implemtation prompt, or production implementation should start from this close-out alone.
