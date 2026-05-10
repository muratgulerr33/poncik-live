# V2 Active 1v1 Balance Reservation / Finalize Debit Policy Audit Close-out

## Status

PASS WITH NOTES

## Scope

This close-out records the V2 Active 1v1 Balance Reservation / Finalize Debit Policy Audit result.

This was not:

- production implementation
- migration
- route creation
- exact schema freeze
- exact API route freeze
- enum name freeze
- constraint name freeze
- exact reservation policy freeze
- exact max duration rule freeze
- exact finalize implementation freeze
- LiveKit grant freeze
- chat transport freeze
- final ADR
- final product readiness
- Codex implementation prompt

## Purpose

The goal was to audit the balance gate, possible reservation model, max active duration, finalize debit policy, insufficient balance handling, and transaction/idempoteny boundary for V2 active 1v1.

The result is:

Balance / finalize planning can continue.

Production implementation cannot start yet.

## Recommended V2 initial direction

The strongest V2 initial candidate is:

- balance check at request create
- balance re-check at publisher accept
- critical balance check at active start
- available minutes snapshot at active start
- max active duration cap derived from active-start available minutes
- no per-second wallet mutation during active call
- finalize-time debit based on backend finalized billable minutes
- finalize marker, ledger debit, wallet update, and publisher earning source in one conceptual financial boundary

This is not full reservation.

This is not exact implementation truth.

This is a safe policy direction for the next audit.

## Balance gate boundary

### Request create

Balance check is needed.

Reason:

- V2 1v1 requires login + minute/balance gate
- users with no available minutes should not create 1v1 requests

Must not do:

- do not debit
- do not create publisher earning
- do not start active session
- do not start billing

Unknown:

- exact minimum required balance

### Publisher accept

Balance re-check is needed.

Reason:

- user balance may change between request and accept

Must not do:

- do not debit
- do not create publisher earning
- do not treat accept as financial start
- do not issue active timestamp from accept alone

Unknown:

- exact failed/expired state when balance is no longer sufficient

### Active start

Critical balance check is needed.

Reason:

- backend active timestamp is the financial start boundary
- max active duration should be derived from available minutes at this point

Writes may conceptually include:

- active timestamp
- available minutes snapshot
- max active duration snapshot

Must not depend on:

- client timer
- camera state
- mic state
- chat state
- LiveKit/client event alone

Unknown:

- exact active transition condition

### Active session

Active session should not mutate wallet every second.

The active-start cap should protect maximum duration.

Must not do:

- do not dynamically extend financial truth from client timer
- do not let camera/mic/chat affect billing truth

Unknown:

- backend timer / cleanup mechanism

### Finalize

Finalize is the debit boundary.

Writes should conceptually happen together:

- session end/finalize marker
- finalized raw duration snapshot
- billable minutes snapshot
- minute ledger debit
- wallet summary update if used
- publisher earning source
- rate snapshot
- computed earning amount snapshot

Must not do:

- double debit
- duplicate publisher earning
- negative balance
- partial successful financial writes

Unknown:

- exact transaction and retry implementation

## Reservation policy comparison result

### No reservation, only pre-check + finalize debit

Not recommended alone.

Reason:

- long calls can end with insufficient balance
- balance can be consumed by another flow before finalize

### Soft reservation at request

Not recommended for V2 initial.

Reason:

- request spam and cancel/expire cleanup become heavier
- request does not mean call will happen

### Soft reservation at accept

Possible but not required for V2 initial.

Reason:

- reduces some risk
- still needs accept-active cleanup
- increases state complexity

### Hard reservation at active

Strong but heavy.

Reason:

- protects balance strongly
- introduces reservation lifecycle and cleanup complexity

### Prepaid max duration cap

Strong V2 candidate.

Reason:

- active-start available minutes can cap max call duration
- helps avoid negative balance
- keeps model simpler than full reservation

### Hybrid candidate

Recommended V2 initial direction:

- request balance check
- accept balance re-check
- active-start available minutes snapshot
- max active duration cap
- finalize debit transaction

This is the safest simple direction.

It still requires the next state-machine/idempotency audit.

## Max active duration boundary

Max active duration should be derived from backend-trusted available minutes at active start.

It should be snapshotted near the same boundary as active timestamp.

It prevents:

- active calls longer than payable balance
- negative balance in normal flow
- client timer becoming financial truth

It must not depend on:

- client timer
- camera state
- mic state
- chat state
- frontend balance display

Unknown:

- exact rounding rule
- exact exhausted transition
- exact backend timer/cleanup implementation

## Finalize debit transaction boundary

Finalize may be triggered by:

- user end
- publisher end
- minute exhausted
- connection failed after active
- timeout after active
- cleanup/retry job

All triggers must converge into one idempotent finalize boundary.

Conceptual transaction should protect:

- finalized marker
- duration snapshot
- billable minutes snapshot
- ledger debit
- wallet update
- publisher earning source
- rate snapshot
- computed earning amount snapshot

If a partial failure occurs:

- the system must rollback
- or retry safely without duplicate debit or duplicate earning

Exact SQL, Drizzle transaction, constraint names, isolation level, and migration remain pending.

## Insufficient balance boundary

### Request-time insufficient balance

Safe behavior:

- request should not open

### Accept-time insufficient balance

Safe behavior:

- accept should not proceed
- request should move to a safe failed/expired/unavailable state

Exact state name remains pending.

### Active-start insufficient balance

Safe behavior:

- active session should not start

### Active-after-balance-changed

Safe behavior:

- active-start max duration cap should protect the current session
- other balance-consuming operations must be race-guarded conceptually

### Finalize-time insufficient balance

Safe behavior:

- negative balance is not recommended for V2 initial
- max duration cap should make this rare
- if it still happens, safe failed finalize / manual correction remains unknown

This is a first implementation PR blocker.

## Wallet / ledger truth

Conceptual direction:

- minute ledger should be append-only audit truth
- wallet summary may exist as transaction-updated current balance
- debit source should be finalized call session
- current balance must come from backend DB truth
- client balance is display only

Must not depend on:

- browser state
- client timer
- optimistic UI only
- LiveKit/client state

Unknown:

- whether wallet summary is canonical or derived/cache
- exact ledger schema
- exact wallet update strategy

## Publisher earning coupling

Publisher earning source should be tied to:

- successful finalized paid minutes
- finalized duration
- finalized billable minutes
- rate snapshot at finalize time

Publisher earning should not be written if user debit fails.

Publisher earning must not depend on:

- user package price
- commission percentage
- manual payout status
- client timer
- camera/mic/chat state

Manual payout tracking must not mutate finalized earning source.

Unknown:

- correction/refund model
- payout period close policy
- exact rate config source

## Concurrency / race guard needs

The audit confirmed conceptual guard needs for:

- same user opening multiple active paid calls
- same publisher accepting multiple active private calls
- cancel vs accept race
- double accept
- double active timestamp
- double end
- double finalize
- duplicate debit source
- duplicate publisher earning source
- wallet balance read/update race
- repeated public broadcast drop
- duplicate LiveKit/client events

Conceptual tools may include:

- transaction boundary
- row lock
- conditional update
- unique source guard
- finalize marker
- one-active-call guard

Exact SQL, exact constraint names, exact index shape, exact isolation level, and migration remain pending.

## API ownership boundary

### Request create boundary

Owns:

- login/user gate
- target publisher validation
- balance gate
- request create

Must not own:

- debit
- publisher earning
- active timestamp

### Publisher accept boundary

Owns:

- target approved publisher ownership
- request state transition
- balance re-check
- one-active-call conceptual guard

Must not own:

- finalized debit
- publisher earning
- client/media billing truth

### Active start boundary

Owns:

- backend active timestamp
- available minutes snapshot
- max active duration snapshot

Must not own:

- client timer financial truth
- camera/mic/chat financial truth

### Finalize boundary

Owns:

- duration
- billable minutes
- debit
- wallet update
- publisher earning source

Must not own:

- token issue
- public broadcast lifecycle
- UI timer state

### Token issue boundary

Owns:

- access authorization
- provider token seam

Must not own:

- debit
- finalize
- wallet mutation
- publisher earning write

### Public broadcast lifecycle boundary

Owns:

- public broadcast visibility and lifecycle

Must not own:

- private call finance
- private call session detail
- minute ledger
- earning source

## Decision result

### Can balance/finalize planning continue?

Yes.

### Can migration start?

No.

### Can exact schema freeze happen?

No.

### Can exact reservation policy freeze happen?

No.

### Can exact max duration rule freeze happen?

No.

### Can production implementation start?

No.

### Can Codex receive a production implementation prompt?

No.

## PASS criteria

This audit is PASS WITH NOTES because:

- request create does not start billing
- publisher accept does not start billing
- balance gate is required before paid 1v1 entry
- active timestamp remains backend financial start truth
- active-start available minutes snapshot direction was identified
- max active duration cap direction was identified
- finalize remains the debit boundary
- negative balance is not recommended for V2 initial
- ledger debit, wallet update, finalize marker, and publisher earning source should be one conceptual financial boundary
- double debit and duplicate earning risks were identified
- publisher earning remains tied to finalized paid minutes
- user package price and publisher earning remain separate
- no migration, route, schema, API, enum, constraint, LiveKit/chat transport, or implementation freeze was produced

## Remaining unknowns

Still pending:

- exact minimum required balance
- exact rounding rule
- exact max active duration formula
- exact exhausted transition
- exact insufficient balance state
- exact transaction boundary
- exact row lock / unique guard implementation
- exact wallet summary vs derived balance decision
- exact schema fields
- exact migration order
- exact API route names
- exact UI copy
- exact backend timer/cleanup behavior
- correction/refund model
- payout period close policy

## Next

Suggested next work:

V2 Active 1v1 Max Duration / Finalize State Machine / Idempotency Policy Audit — Doc-only Boundary Pass

Purpose:

- active start max duration calculation
- minute exhausted finalize behavior
- user end / publisher end / timeout / cleanup retry convergence
- double finalize no-op rule
- insufficient balance edge-case classification
- idempotent finalize state machine boundary

No migration, route creation, schema freezeAPI freeze, LiveKit production implementation, chat transport implementation, Codex implementation prompt, or production implementation should start from this close-out alone.
