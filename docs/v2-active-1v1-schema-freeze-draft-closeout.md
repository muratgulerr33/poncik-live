# V2 Active 1v1 Schema Freeze Draft Close-out

## Status

PASS WITH NOTES

## Scope

This close-out records the V2 Active 1v1 Schema Freeze Draft — Doc-only Exact Boundary Preparation result.

This was not:

- final schema freeze
- production implementation
- migration
- route creation
- DB-only production PR
- Drizzle schema file
- exact API contract
- enum/state/constraint/index freeze
- LiveKit grant freeze
- chat transport freeze
- final ADR
- final product readiness
- Codex implementation prompt

## Purpose

The goal was to prepare a doc-only schema freeze draft before the final schema freeze document.

The result is:

Final schema freeze document preparation can begin.

Migration cannot start yet.

Production implementation cannot start yet.

Superseded / owner decision update:

- public broadcast duration publisher earning source is part of first-slice direction
- compact publisher payment reconciliation is part of first-slice direction
- full payout/accounting engine remains later scope

## Draft boundary

This draft clarified:

- V1 schema protection
- V2 table family boundaries
- draft field need groups
- draft enum/state meaning groups
- draft constraint/index needs
- draft dependency order
- first DB foundation slice candidate
- still-not-freezable areas

This draft did not freeze:

- exact table names
- exact Drizzle field names
- exact enum/state names
- exact constraint/index names
- exact partial index predicates
- exact migration order
- exact API route names
- exact request/response contracts

## V1 schema protection

The draft preserved the V1 core:

- accounts
- auth_sessions
- broadcasts
- cover_images
- publisher_applications
- publisher_settings

Protection rules:

- accounts remains single-role
- account_roles is not introduced
- auth_sessions does not own call/payment state
- broadcasts remains public live lifecycle only
- broadcasts does not own private 1v1/payment/chat/earning/payout/social state
- publisher_settings does not become a junk drawer
- cover_images remains admin predefined cover image catalog
- publisher_applications remains approval truth only

## V2 draft table families

The draft mapped these V2 families:

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
- future publisher-specific rate override

## First-slice candidate families

The following families are first-slice candidates for later DB foundation planning:

- minute_packages
- minute_orders
- bank_transfer_orders / payment approval, narrowly
- minute_wallets
- minute_ledger_entries
- call_requests
- call_sessions
- publisher earning source
- public broadcast duration publisher earning source
- compact publisher payment reconciliation
- system/global config for publisher minute unit rate

Important:

First-slice candidate does not mean production PR can start.

It only means these families are relevant to the future DB foundation slice.

## Later / future families

The following should not bloat the first DB foundation slice:

- full payout / accounting engine
- correction/refund model
- future publisher-specific rate override

These remain later/future policy areas.

## Draft field need groups

Field needs were mapped only as categories.

Groups include:

- identity/reference needs
- status/state needs
- timestamp needs
- minute/money/rate needs
- source/snapshot needs
- audit/idempotency needs

Exact field names are not frozen.

## Draft enum/state groups

State groups were mapped at meaning level only:

- request lifecycle
- session lifecycle
- order/payment lifecycle
- ledger direction/type
- earning source lifecycle
- compact payment reconciliation lifecycle
- correction/refund later

Exact enum/state names are not frozen.

## Draft constraint/index needs

Constraint/index needs were mapped conceptually:

- wallet per user uniqueness
- pending request duplicate guard
- one active call per publisher
- one active paid call per user
- ledger debit source uniqueness
- publisher earning source uniqueness
- payment/order approval idempotency
- global rate effective uniqueness
- V1 public broadcast constraints remain guarded

Exact names, predicates, SQL, and Drizzle definitions are not frozen.

## Draft dependency order

Dependency order was mapped as readiness only:

- global publisher rate config before earning source finalize
- minute packages before minute orders
- minute orders/payment approval before wallet credit
- wallet + ledger before active start/finalize debit
- call_requests before call_sessions
- call_sessions before publisher earning source
- earning source before compact reconciliation/payment records summary
- full payout/accounting later
- constraints/indexes before production writes
- backfill/data safety before migration execution
- rollback safety before migration execution

This is not a migration plan.

## First DB foundation slice candidate

The safest future DB-only foundation slice candidate would include, after final schema freeze:

- minute package/order/payment foundation
- wallet + ledger foundation
- call request/session foundation
- global publisher rate config foundation
- publisher earning source foundation
- public broadcast duration earning source foundation
- compact publisher payment reconciliation foundation
- core source/uniqueness guard needs

It must not include:

- API implementation
- UI implementation
- LiveKit implementation
- chat transport
- payout UI
- correction/refund implementation
- publisher-specific rate override
- admin panel breadth
- gift/DM/social scope

## Still-not-freezable areas

The following remain not frozen:

- exact Drizzle field names
- exact enum/state names
- exact constraint/index names
- exact partial index predicates
- exact source uniqueness key shape
- exact global rate config storage
- exact payment approval detail
- exact compact reconciliation implementation
- full payout/accounting engine
- correction/refund model
- exact API route names
- exact request/response contracts
- exact active transition condition
- exact backend timer/cleanup
- exact LiveKit grant/private token shape
- chat transport

## Decision result

### Is this final schema freeze?

No.

### Can final schema freeze document preparation begin?

Yes.

### Can migration start?

No.

### Can DB-only production PR start?

No.

### Can Codex production prompt be given?

No.

### Can final ADR / final product readiness be declared?

No.

## PASS criteria

This draft is PASS WITH NOTES because:

- V1 schema protection was preserved
- broadcasts remains public lifecycle only
- publisher_settings remains narrow
- accounts remains single-role
- V2 table families are separated as extensions
- field needs were mapped without field-name freeze
- enum/state needs were mapped without enum/state freeze
- constraint/index needs were mapped without exact name/predicate freeze
- dependency order was mapped without migration plan
- first DB foundation slice candidate was identified without PR prompt
- not-freezable areas were clearly separated
- official DB/Drizzle support was separated from owner/repo truth

## Next

Suggested next work:

V2 Active 1v1 Final Schema Freeze Document — Doc-only Exact Closure

Purpose:

- move the draft family / field need / enum meaning / constraint need / dependency order into a final schema freeze document
- explicitly separate what is frozen from what remains unknown
- prepare the last doc-only schema decision boundary before migration readiness

This next work is still doc-only.

No migration, route creation, API freeze, LiveKit production implementation, chat transport implementation, Codex implementation prompt, or production implementation should start from this close-out alone.
