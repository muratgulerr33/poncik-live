# V2 Spike 1A Financial Truth Local Evidence Close-out

## Status

PASS

## Scope

This close-out records a local-only throwaway simulation result.

This was not:

- production implementation
- migration
- route creation
- schema freeze
- API implementation
- Codex implementation
- persistent feature code

## Purpose

The goal was to validate the V2 active 1v1 financial truth boundary before any migration or implementation work.

Validated assumptions:

- accept does not start billing.
- Billing starts only after backend private_session_active_at.
- Client timer is not financial truth.
- Camera/mic state is not billing truth.
- No active timestamp means zero financial impact.
- Active session finalization produces at most one debit and one publisher earning source.
- Double accept, doubl active and double finalize do not create duplicate financial writes in the simulation model.

## Local simulation

Script path:

/tmp/poncik-v2-spike-1a-financial-truth.js

Command:

node /tmp/poncik-v2-spike-1a-financial-truth.js

Result:

PASS: 17
FAIL: 0
TOTAL: 17

## Confirmed scenarios

- accept only does not start billing
- pre-active rejected has zero financial impact
- pre-active cancelled has zero financial impact
- pre-active timeout has zero financial impact
- pre-active failed has zero financial impact
- post-active completed finalizes duration
- post-active failed finalizes duration
- post-active minute exhausted finalizes once
- double accept creates one session
- double active does not overwrite timestamp
- double end does not change duration
- double finalize writes one debit and one earning
- cancel plus accept race does not accept non-pending request
- active plus failed race finalizes if active won first
- finalize from two triggers remains single financial write
- balance changed between accept and finalize does not become timer truth
- client timer manipulation does not change financial result

## Key confirmations

### Accept is not billing

Publisher accept creates only a session candidate. It does not create billed minutes, ledger debit, or publisher earning.

### Active timestamp is financial start

Financial duration starts only when private_session_active_at exists.

### Pre-active terminal states are financially neutral

Before active timestamp, these states produce zero billed minutes, zero debit, and zero publisher earning:

- rejected
- cancelled
- timeout
- failed

### Client timer is visual only

Changing client timer values does not change billed minutes or financial output.

### Finalization is idempotent in the simulation

Double finalize does not create duplicate ledger debit or duplicate publisher earning.

## Repo impact

The simulation itself was run outside the repo under /tmp.

Repo impact of the simulation:

- no app code changed
- no migration created
- no route created
- no schema changed
- no production file created

This close-out is doc-only evidence.

## Remaining blockers before migration / implementation

This PASS does not freeze exact DB schema or API implementation.

Still pending:

- exact call_requests schema
- exact call_sessions schema
- exact status enum names
- exact DB constraints
- exact transaction boundaries
- exact payment approval flow
- exact publisher earning / payout model
- exact insufficient balance behavior at finalize
- LiveKit private call token / handoff evidence
- mobile camera/mic optional evidence

## Next

Suggested next evidence area:

V2 Spike 1B — Idempotency / Transaction Boundary Evidence

No migration, route creation, schema freeze, or implementation should start from this close-out alone.
