# V2 Active 1v1 Visual Schema / Flow / Surface Map Checkpoint Close-out

## Status

PASS WITH NOTES

## Scope

This close-out records the V2 Active 1v1 Visual Schema / Flow / Surface Map Checkpoint — Doc-only Owner Review Map result.

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

The goal was to make the V2 active 1v1 DB families, user flows, financial source flows, and visible UI surfaces understandable before migration spec planning hardens.

The result is:

Visual checkpoint passed with notes.

Doc-only migration spec boundary draft can begin.

Mation cannot be written yet.

SQL cannot be written yet.

Drizzle schema cannot be written yet.

DB-only production PR cannot start yet.

Production implementation cannot start yet.

## Checkpoint boundary

This checkpoint allows:

- owner review of DB family shape
- owner review of 1v1 flow shape
- owner review of wallet / ledger / earning flow
- owner review of user / publisher / admin visible surfaces
- owner review of first DB slice in/out boundary
- owner review of public broadcast duration earning placement
- doc-only migration spec boundary draft preparation

This checkpoint does not allow:

- writing migration files
- writing SQL
- writing Drizzle schema
- starting DB-only production PR
- starting API implementation
- starting UI implementation
- starting LiveKit implementation
- starting chat transport implementation
- giving Codex a production prompt

## DB family map result

The visual checkpoint separated DB families into three groups.

### V1 protected core

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
- broadcasts does not absorb earning/payment/payout/1v1/chat state
- cover_images remains admin predefined cover image catalog
- publisher_applications remains publisher approval truth only
- publisher_settings remains narrow and does not become a junk drawer

### V2 first DB foundation candidates

- minute_packages
- minute_orders
- bank_transfer_orders
- minute_wallets
- minute_ledger_entries
- call_requests
- call_sessions
- publisher_minute_rates
- publisher_earning_entries

### Later / future

- publisher payout / manual tracking
- correction / refund
- publisher-specific rate override
- gift / DM / social / growth
- broad admin panel
- LiveKit implementation
- chat transport
- API route implementation

## 1v1 flow map result

The visual checkpoint confirmed the 1v1 flow:

1. user / public viewer enters `/live/[username]`
2. public watch remains available
3. phone action starts V2 1v1 gate
4. login + minute/balance check is required
5. call request is created
6. publisher sees incoming request in `/studio`
7. publisher rejects or accepts
8. accepted request creates call session candidate
9. parties move to `/call`
10. backend active timestamp starts financial truth
11. active duration accumulates
12. finalize produces wallet debit and publisher earning source

Critical guard:

- accept does not start billing
- backend active timestamp starts financial truth
- client timer is not financial truth
- camera/mic/chat are not financial truth

## Wallet / ledger / earning flow result

The visual checkpoint confirmed the financial flow:

### Package / payment side

- minute package
- minute order
- bank transfer / payment approval
- wallet credit
- minute ledger credit entry

### Paid 1v1 side

- call request
- call session
- backend active timestamp
- finalize
- billable minutes
- wallet debit
- minute ledger debit entry
- publisher earning source entry

Core rules:

- ledger remains append-only audit truth
- wallet summary remains transactionally maintained current balance direction
- user package price is separate from publisher earning rate
- publisher earning is not commission-based
- publisher earning equals finalized paid minutes multiplied by global publisher minute unit rate
- rate snapshot should be captured for earning source
- payout/manual payment does not mutate original earning source

## Publisher earning source map result

The visual checkpoint confirmed three earning-source categories.

### First-slice mandatory source

Paid 1v1 source:

- call_sessions finalized paid minutes
- global publisher minute unit rate
- publisher_earning_entries

This remains mandatory for the first DB foundation slice.

### Owner-review / future source

Public broadcast duration source:

- broadcasts.started_at
- broadcasts.ended_at
- public broadcast duration
- future / owner-approved publisher earning source type

Guards:

- broadcasts remains lifecycle-only truth
- broadcasts does not carry earning/payment/payout state
- publisher earning source model must not be hard-coded to call_sessions only
- public broadcast duration first-slice vs future-source placement remains owner review

### Future sources

- gift
- DM
- social / growth
- other future earning sources

These do not enter the V2 first DB foundation slice unless separately approved later.

## UI surface map result

### User surfaces

- `/`
- `/auth`
- `/live/[username]`
- `/call`

Rules:

- public watch remains public
- `/live/[username]` does not become an auth wall
- phone action is the V2 1v1 gate entry
- login + minute/balance is required for 1v1
- user balance/minute visibility is needed around 1v1 gate

### Publisher surfaces

- `/studio`
- incoming 1v1 request narrow slot
- accept / reject
- active private call transition to `/call`
- public broadcast control remains in studio
- earning visibility is owner review / later decision

Rules:

- `/studio` must not become a god surface
- accept does not start billing
- public broadcast duration earning is owner review

### Admin surfaces

- publisher approval
- narrow payment / bank transfer approval
- owner/admin ops effect for public broadcast duration earning decision

Rules:

- admin is not a private call participant
- payout/manual tracking stays outside first slice
- broad admin panel does not enter first slice

## First DB slice in/out result

### IN

- minute_packages
- minute_orders
- bank_transfer_orders / payment approval narrow
- minute_wallets
- minute_ledger_entries
- call_requests
- call_sessions
- global publisher minute rate config
- paid 1v1 publisher earning source

### OWNER REVIEW

- public broadcast duration earning source first-slice vs future-source placement
- global publisher minute unit rate starting value
- package catalog actual values or empty/manual setup
- publisher earning visibility first release vs later
- payout/manual tracking remaining outside first release

### OUT

- payout/manual tracking
- correction / refund
- publisher-specific rate override
- gift / DM / social
- broad admin panel
- LiveKit implementation
- chat transport
- API route implementation

## State / predicate map result

The visual checkpoint confirmed:

- request lifecycle needs pending / accepted / rejected style meanings
- session lifecycle needs accepted / active / finalizing / finalized style meanings
- accepted is not active financial truth by itself
- backend active timestamp is financial truth
- pending duplicate guard must be visible
- one active paid call guard must be visible
- active / finalizing / finalized state boundaries need exact migration spec review

Exact enum/state names remain not frozen.

## Source uniqueness map result

The visual checkpoint confirmed:

source_type + source_id alone is too weak.

Safer uniqueness direction needs context such as:

- wallet_id / account_id
- publisher_account_id where relevant
- direction
- entry type / earning type
- source_type
- source_id

Source categories:

- ledger credit from payment approval
- ledger debit from call finalize
- publisher earning from finalized paid 1v1
- future publisher earning from public broadcast duration
- later correction/refund sources

Rules:

- original source is immutable
- payout does not mutate original earning source
- correction/refund remains future and separate

## Blocker map result

The visual checkpoint preserved these blockers before actual migration / DB-only production PR:

- actual DB state inspection
- final global publisher rate value
- package catalog actual values or explicit empty/manual setup decision
- public broadcast duration earning first-slice vs future-source owner decision
- exact Drizzle syntax
- exact SQL
- exact migration file split
- generated diff review
- migration dry-run
- backup/checkpoint before applying
- exact lock order
- exact transaction implementation
- exact partial index predicates
- exact source uniqueness key shape
- exact enum/state names
- exact precision/scale for money/rate fields

## Owner review questions

Questions to carry forward:

1. Should public broadcast duration earning enter the first DB slice, or stay as a future source?
2. What is the initial global publisher minute unit rate?
3. Should initial minute packages be seeded, or created later through manual/admin setup?
4. Should publisher earning visibility appear in the first release, or later?
5. Should payout/manual payment tracking stay outside the first release?
6. Is empty/manual setup acceptable for initial package/rate values?
7. Is V1 public watch no-touch still approved?

## Decision result

### Is the visual checkpoint PASS?

Yes, PASS WITH NOTES.

### Is it clear enough for owner review?

Yes.

### Can doc-only migration spec boundary draft begin?

Yes.

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

This checkpoint is PASS WITH NOTES because:

- V1 core no-touch boundary remains visible
- current V2 first DB foundation candidates remain separate from V1 core
- 1v1 flow is understandable
- wallet / ledger / earning flow is understandable
- paid 1v1 earning source is mandatory for first slice
- public broadcast duration earning is visible as owner-review / future source
- broadcasts remains lifecycle-only truth
- source_type + source_id weakness remains visible
- state / predicate risk remains visible
- blocker list remains explicit
- owner review questions are clear
- migration / SQL / Drizzle schema / Codex prompt / production PR were not produced

## Next

Suggested next work:

V2 Active 1v1 Migration Spec Boundary Draft — Doc-only Owner Decisions Carryover

Purpose:

- carry visual checkpoint decisions into a doc-only migration spec boundary draft
keep unresolved owner decisions visible
- prepare migration spec direction without writing migration, SQL, or Drizzle schema
- preserve first DB slice boundaries and V1 no-touch guard

This next work is still doc-only.

No migration, SQL, Drizzle schema, route creation, API freeze, LiveKit production implementation, chat transport implementation, Codex implementation prompt, or production implementation should start from this close-out alone.
