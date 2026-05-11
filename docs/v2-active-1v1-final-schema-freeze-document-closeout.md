# V2 Active 1v1 Final Schema Freeze Document Close-out

## Status

PASS WITH NOTES

## Scope

This close-out records the V2 Active 1v1 Final Schema Freeze Document — Doc-only Exact Closure result.

This was not:

- production implementation
- migration
- route creation
- Drizzle schema file
- exact API route freeze
- API implementation
- LiveKit implementation
- chat transport implementation
- final ADR
- final product readiness
- Codex implementation prompt

## Purpose

The goal was to close the V2 active 1v1 final schema freeze document at doc-only level before migration readiness.

The result is:

Document-level schema freeze boundary is ready.

Migration readiness audit can start.

Migration cannot start yet.

Production implementation cannot start yet.

Superseded / owner decision update:

- public broadcast duration publisher earning source is part of the first DB foundation slice
- compact publisher payment reconciliation is part of the first DB foundation slice
- full payout/accounting engine remains later/future scope

## Freeze boundary

This doent freezes at document level:

- family responsibilities
- field group needs
- enum/state meaning groups
- constraint/index needs
- dependency order direction
- first DB foundation slice boundary

This document does not freeze:

- exact Drizzle field names
- exact enum/state names
- exact constraint/index names
- exact partial index predicates
- exact SQL
- exact migration files
- exact migration order
- exact API route names
- exact request/response contracts
- exact LiveKit grant/private token shape
- exact chat transport
- exact UI copy

## Protected V1 schema boundary

The following V1 schema families remain protected:

- accounts
- auth_sessions
- broadcasts
- cover_images
- publisher_applications
- publisher_settings

Protection rules:

- accounts remains single-role
- account_roles is not introduced
- auth_sessions remains auth/session only
- broadcasts remains public broadcast lifecycle only
- broadcasts does not absorb private 1v1/payment/chat/earning/payout/social state
- cover_images remains admin predefined cover image catalog
- publisher_applications remains publisher approval truth only
- publisher_settings remains narrow and does not become a junk drawer

## V2 document-level frozen families

The following V2 families are document-level frozen as responsibilities:

- minute_packages
- minute_orders
- bank_transfer_orders / payment approval
- minute_wallets
- minute_ledger_entries
- call_requests
- call_sessions
- publisher earning source
- public broadcast duration publisher earning source
- compact publisher payment reconciliation
- system/global config for publisher minute unit rate

These are first DB foundation slice candidates.

Important:

First DB foundation slice candidate does not mean production PR can start.

## V2 later / future families

The following remain outside the first DB foundation slice:

- full payout / accounting engine
- correction/refund model
- future publisher-specific rate override

They are tracked but should not bloat the first DB foundation slice.

## Document-level field group freeze

Field group needs are frozen at category level only.

Field group categories:

- identity / reference
- status / state
- timestamp
- minute / money / rate
- source / snapshot
- audit / idempotency

Exact Drizzle field names remain not frozen.

## Document-level enum/state meaning freeze

Enum/state meanings are frozen at meaning level only.

Meaning groups:

- request lifecycle meaning
- session lifecycle meaning
- order/payment lifecycle meaning
- ledger direction/type meaning
- earning source lifecycle meaning
- compact payment reconciliation meaning
- correction/refund later meaning

Exact enum/state names remain not frozen.

## Document-level constraint/index need freeze

Constraint/index needs are frozen at need level only.

Needs:

- wallet per user uniqueness
- pending request duplicate guard
- one active call per publisher
- one active paid call per user
- ledger debit source uniqueness
- publisher earning source uniqueness
- payment/order approval idempotency
- global rate effective uniqueness
- V1 public broadcast lifecycle guard

Exact names, SQL, predicates, and Drizzle definitions remain not frozen.

## Dependency order direction

Dependency direction is document-level frozen.

Direction:

1. global publisher rate config before publisher earning source finalize
2. minute packages before minute orders
3. order/payment approval before wallet credit
4. wallet + ledger before active start / finalize debit
5. call_requests before call_sessions
6. call_sessions before publisher earning source
7. publisher earning source before compact reconciliation/payment records
8. constraints/indexes before production writes
9. backfill/data safety before migration
10. rollback safety before migration

This is not a migration plan.

No migration should be written from this close-out alone.

## First DB foundation slice boundary

After migration readiness and later implementation planning, the first DB foundation slice may include:

- minute_packages
- minute_orders
- narrow bank_transfer_orders / payment approval
- minute_wallets
- minute_ledger_entries
- call_requests
- call_sessions
- global publisher minute unit rate config
- publisher earning source
- public broadcast duration publisher earning source
- compact publisher payment reconciliation
- core uniqueness / source guard needs

It must not include:

- API implementation
- UI implementation
- LiveKit implementation
- chat transport
- payout UI
- correction/refund implementation
- publisher-specific rate override
- broad admin panel
- gift/DM/social scope

## Financial policy boundary frozen at document level

The following policy directions are frozen at document level:

- V2 1v1 requires login + minute/balance gate
- accept does not start billing
- backend active timestamp is financial start truth
- client timer is not financial truth
- camera/mic/chat are not financial truth
- active-start available minutes snapshot + max duration cap is required direction
- active > 0 seconds means minimum 1 billable minute owner policy
- started-minute / ceil-style rounding owner policy
- debit is written at finalize boundary
- negative balance is not recommended for V2 initial
- publisher earning is not commission-based
- paid 1v1 publisher earning rate starts at 5 TL/minute
- public broadcast duration earning rate starts at 1 TL/minute
- paid 1v1 user debit and publisher earning share the same finalized billable minute truth
- public broadcast duration earning may derive from `broadcasts.started_at` / `broadcasts.ended_at`
- publisher earning equals finalized paid minutes x the applicable global publisher minute unit rate
- effective rate + snapshot direction is resolved at policy level
- user package price does not mix with publisher earning
- compact reconciliation formula is `remaining payment = total earning - total admin payment`
- admin payment records do not mutate finalized earning source
- ledger is append-only audit truth
- wallet summary is transactionally maintained current balance direction
- ledger debit source uniqueness is required
- publisher earning source uniqueness is required

Exact implementation remains not frozen.

## Still not frozen

Still not frozen:

- exact Drizzle field names
- exact enum/state names
- exact constraint/index names
- exact partial index predicates
- exact SQL
- exact migration files/order
- exact source uniqueness key shape
- exact global rate config storage implementation
- exact payment approval detail
- exact compact reconciliation schema/table/field/constraint/UI detail
- full payout/accounting engine design
- correction/refund implementation
- exact API route names/contracts
- exact request/response contracts
- exact auth/ownership guard implementation
- exact active transition condition
- exact backend timer/cleanup cadence
- exact LiveKit grant/private token shape
- exact chat transport
- exact UI copy

## Migration readiness result

### Does this close-out allow migration readiness audit?

Yes.

### Does this close-out allow writing migration?

No.

### Does this close-out allow DB-only production PR?

No.

### Does this close-out allow Codex production prompt?

No.

### Does this close-out declare final product readiness?

No.

## PASS criteria

This close-out is PASS WITH NOTES because:

- V1 schema protection remains intact
- accounts remains single-role
- account_roles is not introduced
- broadcasts remains public lifecycle only
- publisher_settings remains narrow
- V2 families remain separate extensions
- public broadcast duration earning source and compact reconciliation are included in first-slice boundary
- field group needs are frozen only at category level
- enum/state meanings are frozen only at meaning level
- constraint/index needs are frozen only at need level
- dependency order direction is frozen only at document level
- first DB foundation slice boundary is identified without production PR prompt
- migration remains blocked
- production implementation remains blocked
- Codex implementation prompt was not produced

## Next

Suggested next work:

V2 Active 1v1 Migration Readiness Audit — Doc-only Exact Preflight

Purpose:

- check whether document-level frozen schema decisions are enough to prepare migration planning
- separate exact field/enum/constraint/index/migration-order unknowns
- decide whether migration planning can start later
- protect DB quality before any production DB work

This next work is still doc-only.

No migration, route creation, API freeze, LiveKit production implementation, chat transport implementation, Codex implementation prompt, or production implementation should start from this close-out alone.
