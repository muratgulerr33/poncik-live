# V2 Spike 1B Idempotency / Transaction Local Evidence Close-out

## Status

PASS

## Scope

This close-out records a local-only throwaway transaction/idempotency simulation result.

This was not:

- production implementation
- migration
- route creation
- schema freeze
- API implementation
- Codex implementation
- persistent feature code
- DB integration test

## Purpose

The goal was to validate the V2 active 1v1 idempotency and transaction boundary before any migration or implementation work.

Validated assumptions:

- Double accept creates only one session.
- Cancel + accept race has one winner.
- Timeout + accept race has one winner.
- Active + failed race finalizes only if active wins first.
- User end + publisher end is write-once.
- Minute exhausted + manual end is write-nce.
- Double finalize creates only one debit and one publisher earning.
- Partial finalize failure rolls back cleanly.
- Finalized session cannot become active again.
- Duplicate ledger source session is blocked.
- Duplicate publisher earning source session is blocked and rolled back.

## Local simulation

Script path:

/private/tmp/poncik-v2-spike-1b-idempotency-transaction.js

Command:

node /private/tmp/poncik-v2-spike-1b-idempotency-transaction.js

Result:

PASS: 12
FAIL: 0
TOTAL: 12

## Confirmed scenarios

- double accept creates one session
- cancel plus accept race has one winner
- timeout plus accept race has one winner
- active plus failed race finalizes if active wins
- user end plus publisher end is write-once
- minute exhausted plus manual end is write-once
- double finalize writes one debit and one earning
- ledger success plus earning fail rolls back
- earning success plus finalize marker fail rolls back
- finalized session cannot become active again
- duplicate ledger source session is blocked
- duplicate publisher earning source session is blocked and rolled back

## Key confirmations

### Accept is idempotent

Repeated accept for the same request produces only one session candidate.

### Terminal request states are protected

Cancelled or timed-out requests cannot later become accepted in the simulation.

### Active and ended timestamps are write-once

Repeated active or end transitions do not overwrite the first accepted timestamp or duration boundary.

### Finalization is idempotent

Repeated finalize attempts do not create duplicate ledger debit or duplicate publisher earning source.

### Partial finalize failure rolls back

If ledger succeeds but earning fails, the simulated transaction rolls back.

If earning succeeds but finalize marker fails, the simulated transaction rolls back.

### Finalized sessions stay terminal

A finalized session cannot become active again.

### Source uniqueness is required

The simulation confirms that ledger debit and publisher earning must be unique by source session.

## Repo impact

The simulation itself was run outside the repo under /private/tmp.

Repo impact of the simulation:

- no app code changed
- no migration created
- no route created
- no schema changed
- no production file created
- no DB connection used

This close-out is doc-only evidence.

## Remaining blockers before migration / implementation

This PASS does not freeze exact DB schema, constraints, transaction isolation, or API implementation.

Still pending:

- exact call_requests schema
- exact call_sessions schema
- exact status enum names
- exact DB constraints
- exact transaction isolation choice
- exact API transition design
- exact payment approval flow
- exact publisher earning / payout model
- exact insufficient balance behavior at finalize
- LiveKit private call token / handoff evidence
- mobile camera/mic optional evidence

## Next

Suggested next evidence area:

V2 Spike 1C — Publisher Earning Source Accounting Evidence

No migration, route creation, schema freeze, or implemeation should start from this close-out alone.
