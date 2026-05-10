# V2 Active 1v1 Max Duration / Finalize State Machine / Idempotency Policy Audit Close-out

## Status

PASS WITH NOTES

## Scope

This close-out records the V2 Active 1v1 Max Duration / Finalize State Machine / Idempotency Policy Audit result.

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
- exact max duration implementation freeze
- exact finalize implementation freeze
- LiveKit grant freeze
- chat transport freeze
- final ADR
- final product readiness
- Codex implementation prompt

## Purpose

The goal was to audit the max active duration policy, conceptual finalize state machine, minute exhausted beavior, double finalize handling, insufficient balance classification, and idempotency boundary for V2 active 1v1.

The result is:

State-machine planning can continue.

Production implementation cannot start yet.

## Confirmed policy direction

The audit confirmed this strong V2 initial direction:

- active-start available minutes snapshot
- backend max duration cap
- client timer is display only
- camera, mic, and chat are not financial truth
- max duration exhausted goes to the same finalize boundary
- user end, publisher end, fail, timeout, exhausted, and cleanup retry converge into one finalize boundary
- finalized session re-finalize should be noop
- ledger debit source uniqueness is required conceptually
- publisher earning source uniqueness is required conceptually
- negative balance is not recommended for V2 initial

This is still not exact implementation truth.

## Max duration boundary

Max active duration should be backend-owned.

Conceptual inputs:

- backend wallet / balance truth
- active-start available minutes snapshot
- billing / minimum minute policy candidate

Conceptual output:

- max allowed active duration
- backend-enforceable duration window
- UI countdown display data

Must not depend on:

- client timer
- frontend balance display
- camera state
- mic state
- chat state
- LiveKit/client event alone

Unknowns:

- exact max duration formula
- exact rounding rule
- exact minimum billable minute policy
- exact backend timer / cleanup mechanism

## Conceptual state machine boundary

State names are not frozen.

Conceptual meanings reviewed:

- requested
- cancelled
- rejected
- expired / timeout before active
- accepted
- activating
- active
- ending
- ended
- finalized
- failed before active
- failed after active

Financial effect boundary:

- requested, accepted, activating, cancelled, rejected, expired before active, and failed before active create zero debit and zero publisher earning
- active timestamp starts the financial duration window
- any active-after close path must converge into one finalize boundary
- finalized is terminal for financial writes

Exact enum/state names remain pending.

## Finalize trigger boundary

All active-after close triggers should converge into the same finalize boundary:

- user end
- publisher end
- max duration exhausted
- connection failed after active
- timeout after active
- cleanup / retry finalize
- duplicate webhook / client / provider signal
- duplicate manual action

Expected behavior:

- first valid finalize wins
- later duplicate finalize attempts are noop
- duration should not be overwritten after finalized
- ledger debit should not duplicate
- publisher earning source should not duplicate

Unknowns:

- exact trigger names
- exact retry job design
- exact provider event mapping
- exact response shape for duplicate/noop finalize

## Minute exhausted policy

Max duration exhausted should not create a separate financial path.

Expected behavior:

- exhausted trigger goes into the same finalize boundary
- exhausted must not double debit
- exhausted must not duplicate publisher earning
- exhausted reason may be a future reason/snapshot concept
- exact enum/reason name is not frozen
- token/media/control teardown remains implementation detail

## Double finalize / retry policy

Conceptual rule:

- finalized session re-finalize should be noop
- finalized duration should be write-once
- ledger debit source should be unique conceptually
- publisher earning source should be unique conceptually
- retry after rollback can safely try again
- retry after committed finalize must not write again

Exact SQL, constraint, index, transaction isolation, Drizzle implementation, and migration remain pending.

## Insufficient balance classification

### Request-time insufficient balance

Expected safe behavior:

- request should not open
- no financial write

### Accept-time insufficient balance

Expected safe behavior:

- accept should not proceed
- request should move to a safe terminal / unavailable / expired-like state

Exact state name remains pending.

### Active-start insufficient balance

Expected safe behavior:

- active timestamp should not be written
- no financial write

### Active-after-balance-changed

Expected safe behavior:

- active-start max duration cap protects the current session
- other balance-consuming operations must be race-guarded conceptually

### Finalize-time insufficient balance despite cap

Expected safe behavior:

- should not happen in normal flow
- negative balance is not recommended for V2 initial
- safe failed finalize / manual correction remains unknown

This remains a first implementation PR blocker.

## Idempotency guard needs

The audit confirmed conceptual guard needs for:

- request create duplicate / spam
- accept double session
- active timestamp overwrite
- end timestamp overwrite
- double finalize
- duplicate ledger debit
- duplicate publisher earning source
- one-active-call-per-user
- one-active-call-per-publisher
- provider/client duplicate signals

Likely conceptual tools:

- transaction boundary
- row lock
- conditional update
- finalized marker
- write-once timestamp semantics
- unique source guard
- one-active-call guard

Exact constraint/index/schema/API implementation remains pending.

## Transaction / lock boundary

Conceptual transaction boundaries reviewed:

### Request create

Protects:

- user balance read
- pending request guard
- request create

### Publisher accept

Protects:

- request state
- user balance re-check
- one-active-call guard
- session candidate

### Active start

Protects:

- session state
- wallet/balance read
- active timestamp
- available minutes snapshot
- max duration snapshot

### Finalize

Protects:

- session duration
- finalized marker
- ledger debit
- wallet update
- publisher earning source
- rate snapshot
- computed earning amount snapshot

Finalize should be the strongest financial transaction boundary.

Exact SQL, Drizzle code, migration, isolation level, constraint/index names remain pending.

## API / surface ownership boundary

### Request create boundary

Owns:

- login/user gate
- target publisher validation
- balance check
- request create

Must not own:

- debit
- publisher earning
- active timestamp

### Accept boundary

Owns:

- publisher ownership
- balance re-check
- request to accepted transition
- session candidate

Must not own:

- billing start
- finalize debit
- publisher earning

### Active start boundary

Owns:

- backend active timestamp
- available minutes snapshot
- max duration snapshot

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

- wallet mutation
- debit
- finalize
- publisher earning write

### `/live/[username]`

Owns:

- public watch
- phone action entry

Must not own:

- private call lifecycle
- private finalize
- private financial truth

### `/studio`

Owns:

- incoming request slot
- accept / reject action

Must not own:

- active private media
- private finalize
- payment / earning dashboard breadth

### `/call/[sessionId]`

Owns:

- active private call UX

Must not own:

- dashboard
- payment
- gift
- admin
- earning panel
- discovery
- persistent chat history

### `api/studio/lifecycle`

Owns:

- public broadcast lifecycle

Must not own:

- private call finalize

## Decision result

### Can state machine planning continue?

Yes.

### Can migration start?

No.

### Can exact schema freeze happen?

No.

### Can exact enum/state freeze happen?

No.

### Can exact API route freeze happen?

No.

### Can exact constraint/index freeze happen?

No.

### Can production implementation start?

No.

### Can Codex receive a production implementation prompt?

No.

## PASS criteria

This audit is PASS WITH NOTES because:

- accept still does not start billing
- backend active timestamp remains financial start truth
- client timer, camera, mic, and chat are not financial truth
- max duration is positioned as backend cap
- exhausted, user end, publisher end, fail, timeout, and cleanup retry converge into one finalize boundary
- double finalize is expected to be noop
- ledger debit and publisher earning source uniqueness needs are clear conceptually
- insufficient balance edge-cases are classified
- `/live`, `/studio`, `/call`, token issue, and finalize ownership are separated
- `broadcasts` remains public lifecycle only
- no migration, route, schema, API, enum, constraint, index, LiveKit/chat transport, or implementation freeze was produced

## Remaining unknowns

Still pending:

- exact rounding / minimum billable minute policy
- exact active-start max duration formula
- exact finalized billable duration formula
- exact insufficient balance behavior at finalize
- wallet summary vs derived balance decision
- source uniqueness conceptual key shape
- active transition condition
- cleanup / retry policy
- exact transaction boundary
- exact row lock / unique guard implementation
- exact schema fields
- exact migration order
- exact API route names
- exact UI copy
- exact backend timer / cleanup behavior
- correction / refund model
- payout period close policy

## Next

Suggested next work:

V2 Active 1v1 Implementation Readiness Gate — State Machine / Financial Transaction / Unknown Closure Audit

Purpose:

- close remaining blocker unknowns before implementation planning turns into production PRs
- verify exact rounding / minimum billable minute policy readiness
- verify active-start max duration formula readiness
- verify finalize-time insufficient balance behavior readiness
- verify wallet summary vs derived balance decision readiness
- verify source uniqueness conceptual key shape readiness
- verify active transition condition readiness
- verify cleanup / retry policy readiness
- define first implementation PR boundary at plan level

No migration, route creation, schema freeze, API freeze, LiveKit production implementation, chat transport implementation, Codeimplementation prompt, or production implementation should start from this close-out alone.
