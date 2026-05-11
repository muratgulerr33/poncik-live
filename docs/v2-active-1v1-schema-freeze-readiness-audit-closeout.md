# V2 Active 1v1 Schema Freeze Readiness Audit Close-out

## Status

PASS WITH NOTES

## Scope

This close-out records the V2 Active 1v1 Schema Freeze Readiness Audit result.

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
- final ADR
- final product readiness
- Codex implementation prompt

## Purpose

The goal was to audit whether V2 active 1v1 schema freeze preparation can begin.

The result is:

Schema freeze draft preparation can begin.

Schema freeze itself has not happened.

Migration cannot start yet.

Production implementation cannot start yet.

Superseded / owner decision update:

- publisher earning source direction now includes paid 1v1 plus public broadcast duration
- compact publisher payment reconciliation is a first-slice direction
- full payout/accounting engine remains later scope

## Current schema truth

Current repo schema remains V1 core.

Current exported failies remain:

- accounts
- auth_sessions
- broadcasts
- cover_images
- publisher_applications
- publisher_settings

Current repo schema does not yet include V2 paid 1v1 / payment / earning families.

## V1 / V2 boundary

V1 core remains narrow.

V2 active 1v1 must be added as separate extension families.

`broadcasts` must remain public live lifecycle only.

`broadcasts` must not own:

- 1v1 state
- minute/payment state
- private chat state
- publisher earning state
- payout state
- social/gift/DM state

## Schema readiness result

The audit found that schema freeze draft preparation is allowed because:

- V2 table family needs are sufficiently mapped
- field needs are sufficiently mapped at need-level
- enum/state groups are sufficiently mapped at meaning-level
- constraint/index needs are sufficiently mapped at conceptual level
- migration order dependencies are sufficiently understood at readiness level
- transaction/schema coupling is sufficiently mapped
- API/schema coupling risks are understood

But this is still not exact schema freeze.

## V2 table family readiness

### Near-ready for schema freeze draft

The following families are near-ready for schema freeze draft preparation:

- minute_packages
- minute_orders
- minute_wallets
- minute_ledger_entries
- call_requests
- call_sessions

Near-ready means:

- family ownership is clear
- dependencies are clear enough for draft preparation
- field needs can be listed
- constraints can be discussed conceptually

Near-ready does not mean:

- exact table names are frozen
- exact field names are frozen
- exact enum values are frozen
- exact constraint/index names are frozen
- migration can start

### Needs more freeze draft detail

The following families need more detail inside the schema freeze draft:

- bank_transfer_orders / payment approval family
- publisher earning source family
- compact publisher payment reconciliation family
- system/global config family for publisher minute unit rate

Reasons:

- payment approval must not become broad admin scope
- earning source must not mix with user package price
- earning source now covers paid 1v1 finalized minutes plus public broadcast duration source
- compact reconciliation is first-slice direction but exact schema detail remains unresolved
- global publisher minute unit rate source/storage mechanics are needed before exact schema freeze

### Partial / later

The following boundary split applies:

- compact publisher payment reconciliation family is first-slice readiness direction
- full payout / accounting engine remains later
- correction/refund later family remains later

These are important, but they should not bloat the first DB foundation slice.

### Not needed for V2 initial

The following is not needed for V2 initial:

- future publisher-specific rate override family

It must remain future extension.

## Field needs readiness

Field needs are ready to be drafted at category level.

The schema freeze draft may list needs such as:

- identity fields
- account references
- owner references
- status/state fields
- timestamps
- minute amount fields
- money/rate fields
- source/snapshot fields
- audit fields
- idempotency fields

But exact field names must not be assumed from this close-out.

## Enum/state readiness

Enum/state groups are ready to be drafted at meaning level.

Needed groups include:

- request lifecycle states
- session lifecycle states
- payment/order approval states
- ledger direction/type states
- publisher earning source states
- payout/manual payment states
- correction/refund later states

Exact enum/state names are not frozen.

## Constraint/index readiness

Constraint/index needs are ready to be drafted conceptually.

Needs include:

- unique source guard for ledger debit
- unique source guard for publisher earning
- one active call per publisher
- one active paid call per user
- pending request duplicate guard
- wallet/account uniqueness
- payment/order idempotency
- publisher rate config effective uniqueness if config family is used
- preserve public broadcast lifecycle constraints

Exact constraint/index names and exact partial index predicates are not frozen.

## Migration order readiness

Migration order is ready for readiness discussion only.

Conceptual order direction:

1. foundational V2 lookup/config if needed
2. minute packages before orders
3. orders/payment before wallet credit
4. wallet + ledger before call finalize
5. call_requests before call_sessions
6. call_sessions before earning source
7. earning source before compact reconciliation/payment records
8. constraints/indexes with data safety
9. full payout/accounting and correction later if needed

This is not a migration plan.

No migration should be written from this close-out.

## Transaction/schema coupling

The audit confirmed schema needs are sufficiently clear for draft preparation around:

- request create
- publisher accept
- active start
- finalize
- cleanup/retry
- correction/refund later

Finalize remains the strongest financial boundary.

Finalize schema draft must support:

- finalized marker
- raw duration snapshot
- billable minutes snapshot
- user minute ledger debit
- wallet update if wallet summary exists
- publisher earning source
- rate snapshot
- computed earning amount snapshot
- retry/idempotency guard

Exact transaction implementation remains pending.

## API/schema coupling

Schema readiness can proceed without freezing exact API routes.

Guards:

- `/live/[username]` remains public watch + phone action entry
- `/studio` remains incoming request + accept/reject narrow slot
- `/call/[sessionId]` remains active private 1v1 UX
- token boundary must not own financial writes
- `api/studio/lifecycle` must remain public broadcast lifecycle
- `broadcasts` must remain public lifecycle only

Exact API route names are not frozen.

## First production PR readiness

### Can schema freeze doc preparation begin?

Yes.

### Can migration start?

No.

### Can DB-only production PR start?

No.

### Can Codex production prompt be given?

No.

### Can final ADR / final product readiness be declared?

No.

## Remaining blockers before migration

Still pending:

- exact schema fields
- exact enum/state names
- exact constraint/index names
- exact migration order
- exact source uniqueness key shape
- exact global publisher minute unit rate storage/activation mechanics
- exact payment approval schema detail
- exact compact reconciliation schema/field/source/detail remains not frozen
- full payout/accounting later
- exact API route/request/response contracts
- exact auth/ownership guard contracts

## DB quality guard

The schema freeze draft must preserve:

- V1 core separation
- V2 table family separation
- append-only ledger audit direction
- wallet summary as transaction-maintained current balance direction
- publisher earning separated from user package price
- manual payout separated from earning source calculation
- broadcasts as public lifecycle only
- no V3 gift/DM/social leakage into V2
- no junk drawer use of publisher_settings
- no private call state inside broadcasts

## PASS criteria

This audit is PASS WITH NOTES because:

- current repo schema truth was respected
- V2 table family readiness was mapped
- field needs were mapped without field freeze
- enum/state needs were mapped without enum freeze
- constraint/index needs were mapped without constraint/index freeze
- migration order was discussed only as readiness
- transaction/schema coupling was mapped
- API/schema coupling risk was mapped
- public broadcast duration earning and compact reconciliation were carried into first-slice readiness direction
- schema freeze draft preparation can begin
- migration and production implementation remain blocked

## Next

Suggested next work:

V2 Active 1v1 Schema Freeze Draft — Doc-only Exact Boundary Preparation

Purpose:

- turn near-ready table families into schema freeze draft candidates
- separate exact vs still-unknown field needs
- separate exact vs still-unknown enum/state needs
- separate exact vs still-unknown constraint/index needs
- prepare the final doc-only schema freeze boundary before any migration or DB-only PR

This next work is still doc-only.

No migration, route creation, schema freeze, API freeze, LiveKit production implementation, chat transport implementation, Codex implementation prompt, or production implementation should start from this close-out alone.
