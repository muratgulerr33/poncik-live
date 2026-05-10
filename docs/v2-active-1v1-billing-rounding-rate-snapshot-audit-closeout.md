# V2 Active 1v1 Billing / Rounding / Rate Snapshot Decision Audit Close-out

## Status

PASS WITH NOTES

## Scope

This close-out records the V2 Active 1v1 Billing / Rounding / Rate Snapshot Decision Audit result.

This was not:

- production implementation
- migration
- route creation
- exact schema freeze
- exact API route freeze
- enum name freeze
- constraint name freeze
- exact rounding implementation freeze
- exact rate config storage freeze
- LiveKit grant freeze
- chat transport freeze
- final ADR
- final product readiness
- Codex implementation prompt

## Purpose

The goal was to audit the billing, duration, rounding, publisher earning rate snapshot, and manual payout/correction boundary for V2 active 1v1.

The result is:

Billing planning can continue.

Production impleentation cannot start yet.

## Billing truth confirmed

The audit confirmed:

- 1v1 request creation does not start billing
- publisher accept does not start billing
- backend private session active timestamp is the financial start boundary
- active timestamp missing means zero debit and zero publisher earning
- client timer is not financial truth
- camera state is not financial truth
- mic state is not financial truth
- chat state is not financial truth
- raw active duration should come from backend active timestamp to backend end/finalize timestamp
- finalized billable minutes should be derived from backend duration and billing rule
- debit and publisher earning should be created from finalized backend truth

## Rounding / duration boundary

The audit confirmed:

- no active timestamp means 0 billable minutes
- raw active seconds should be snapshotted or derivable from trusted backend timestamps
- billable minutes should be derived during finalize
- exact rounding rule is not frozen in this audit
- exact minimum minute policy is not frozen in this audit
- exact insufficient balance behavior is not frozen in this audit

Strong candidate direction:

- active > 0 seconds may become minimum 1 billable minute
- started minute / ceil-style rounding may be the simplest V2 candidate

But this remains a policy decision and must not be treated as implementation truth yet.

## User minute debit boundary

The audit confirmed:

- user debit should not happen at request create
- user debit should not happen at publisher accept
- user debit should happen only from finalized billable duration
- active-before-fail/cancel/reject/timeout should not produce debit
- active-after-fail/timeout/end may finalize if active timestamp exists
- double debit must be blocked
- ledger debit should be source/idempotency guarded
- wallet balance and ledger truth must not diverge

Exact schema, transaction, constraint, and insufficient balance behavior remain pending.

## Publisher earning boundary

The audit confirmed V2 initial owner/business truth:

- publisher earning is not commission-based
- publisher earning is not derived from user package price
- publisher earning = paid minutes x global publisher minute unit rate
- future publisher-specific rate override can be added later
- duration snapshot should be considered
- rate snapshot should be considered
- computed amount snapshot should be considered
- user package price and publisher earning must stay separate
- commission percentage is not V2 initial truth

Exact schema and exact rate config storage remain pending.

## Rate snapshot boundary

The audit confirmed:

- publisher earning source should use the rate that was true at finalize time
- changing the global publisher minute unit rate later must not mutate old earning source truth
- future publisher-specific override should not force a big refactor if planned carefully
- exact rate config table/source is not frozen
- exact field names are not frozen

## Ledger / earning transaction boundary

The audit confirmed conceptual need for the following writes to be treated as one protected financial boundary:

- session finalize marker
- finalized duration snapshot
- user minute ledger debit
- wallet balance update if a summary wallet exists
- publisher earning source write
- computed publisher earning amount snapshot

Conceptual transaction rule:

- either all financial finalize writes succeed together
- or the system must safely retry without double debit or duplicate earning

Exact PostgreSQL constraint names, Drizzle definitions, transaction isolation, SQL, and migration remain pending.

## Manual payout / correction boundary

The audit confirmed:

- manual payout tracking must not mutate finalized earning source
- payout status is operational payment truth, not earning calculation truth
- finalized earning source should remain auditable
- correction/refund should not directly rewrite original finalized source
- correction/refund model remains unknown
- payout period close policy remains unknown

## Admin / config scope boundary

The audit confirmed:

- global publisher minute unit rate is needed for V2 initial accounting
- a full admin panel for rate config is not automatically required at the first step
- safe manual/config fallback may be enough initially
- minute package CRUD and publisher rate config are not the same thing
- publisher-specific rate override is future extension, not V2 initial requirement
- commission percentage must not be introduced as V2 initial truth

## Blockers and unknowns

### First implementation PR blockers

Still pending before relevant production implementation:

- exact rounding rule
- exact minimum billable minute policy
- exact active transition condition
- exact insufficient balance behavior
- exact balance reservation or max duration policy
- exact global publisher minute unit rate source
- exact transaction boundary
- exact idempotency guard
- exact schema fields
- exact migration order

### Tracked unknowns

Still pending:

- refund / manual correction behavior
- payout period close policy
- publisher-specific future rate override precedence
- exact money storage type / minor unit strategy
- exact UI copy for billing/session end states
- exact admin/config surface timing

## Decision result

### Can billing planning continue?

Yes.

### Can migration start?

No.

### Can exact schema freeze happen?

No.

### Can exact rounding rule freeze happen?

No.

### Can exact rate config schema freeze happen?

No.

### Can production implementation start?

No.

## PASS criteria

This audit is PASS WITH NOTES because:

- accept does not start billing
- active timestamp remains the financial start truth
- active timestamp missing means no debit and no earning
- client timer, camera, mic, and chat are not financial truth
- raw duration remains backend-derived
- billable minutes remain finalized backend-derived
- publisher earning remains separate from user package price
- commission percentage was not made V2 initial truth
- duration snapshot, rate snapshot, and computed amount snapshot were identified
- manual payout does not mutate earning source
- transaction/idempotency needs were identified without freezing constraints
- exact schema/API/migration/rounding/rate config were not frozen

## Remaining risks

The biggest remaining risk is balance/finalize safety:

- user may have enough minutes at request time but not enough at finalize
- long active sessions need max duration or reservation logic
- double finalize must not double debit
- partial financial writes must rollback or retry safely
- insufficient balance at finalize must not create negative or inconsistent accounting

This requires the next audit.

## Next

Suggested next work:

V2 Active 1v1 Balance Reservation / Finalize Debit Policy Audit — Doc-only Boundary Pass

Purpose:

- active session start balance check
- possible minute reservation
- max active duration
- finalize debit policy
- infficient balance behavior
- double debit prevention
- transaction/idempotency guard

No migration, route creation, schema freeze, API freeze, LiveKit production implementation, chat transport implementation, Codex implementation prompt, or production implementation should start from this close-out alone.
