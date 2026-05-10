# V2 Pack 2A Token / Access Matrix Local Evidence Close-out

## Status

PASS

## Scope

This close-out records a local-only throwaway token/access matrix simulation result.

This was not:

- production implementation
- migration
- route creation
- schema freeze
- API implementation
- Codex implementation
- persistent feature code
- DB integration test
- LiveKit production implementation

## Purpose

The goal was to validate the V2 active 1v1 access and token boundary before route, API, LiveKit, migration, or schema implementation work.

Validated assumptions:

- Public viewer token is allowed only when publicBroadcastVisible is true.
- publicBroadcastVisible false represents public fallback / unavailable state.
- Same publisher public broadcast token is denied when private call made public broadcast unavailable.
- Discovery / fallback behavior is represented through public broadcast visibility, not private call state leak.
- Guest private token is denied.
- Unrelated user private token is denied.
- Requesting user accepted / activating / active private token is allowed.
- Ended / finalized private token is denied.
- Target approved publisher private token is allowed.
- Non-target publisher private token is denied.
- Unapproved publisher private token is denied.
- Admin private call token is denied.
- Public broadcast token cannot be used as private call token.
- Private call token cannot be used as public broadcast token.
- Token issue depends on server-side session-party truth.

## Local simulation

Script path:

/private/tmp/poncik-v2-pack-2a-token-access-matrix.js

Command:

node /private/tmp/poncik-v2-pack-2a-token-access-matrix.js

Result:

RESULT: PASS
PASS: 29
FAIL: 0
TOTAL: 29

## Confirmed scenarios

- guest can get public viewer token when public broadcast is visible
- guest cannot get public viewer token when public broadcast is not visible
- logged-in user can get public viewer token when public broadcast is visible
- requesting user cannot get same publisher public viewer token when private call made public broadcast unavailable
- discovery fallback is represented by publicBroadcastVisible=false, not private call state leak
- guest cannot get private call user token
- logged-in non-party user cannot get private call token
- unrelated user cannot get private call token by guessing sessionId
- requesting user can get own accepted session token
- requesting user can get own activating session token
- requesting user can get own active session token
- requesting user cannot get ended session token
- requesting user cannot get finalized session token
- target approved publisher can get accepted private publisher token
- target approved publisher can get activating private publisher token
- target approved publisher can get active private publisher token
- non-target publisher cannot get private publisher token
- unapproved publisher cannot get private publisher token
- admin cannot get private call token
- target approved publisher can get public broadcast publisher token when public broadcast is visible
- target approved publisher cannot get public broadcast publisher token when public broadcast is not visible
- unapproved publisher cannot get public broadcast publisher token
- guest cannot get public broadcast publisher token
- requesting user cannot get private token while only requested
- rejected session/request cannot issue private token
- cancelled session/request cannot issue private token
- timeout session/request cannot issue private token
- public broadcast token cannot be used as private call token
- private call token cannot be used as public broadcast token

## Key confirmations

### Public visibility is the public token truth

Public viewer token is controlled by publicBroadcastVisible.

Private call state is not leaked directly into discovery or public fallback logic.

### Private call token is session-party scoped

Only the requesting user or target approved publisher can receive private call token in accepted, activating, or active states.

### Terminal states block token issue

Ended, finalized, rejected, cancelled, and timeout states do not issue private call token.

### Admin is not a private call participant

Admin does not receive private call token in this V2 boundary.

Admin monitoring, moderation, or dashboard behavior remains out of scope.

### Token scopes do not mix

Public broadcast token cannot be used as private call token.

Private call token cannot be used as public broadcast token.

## Repo impact

The simulation itself was run outside the repo under /private/tmp.

Repo impact of the simulation:

- no app code changed
- no migration created
- no route created
- no schema changed
- no production file created
- no DB connection used
- no LiveKit implementation added

This close-out is doc-only evidence.

## Remaining blockers before migration / implementation

This PASS does not freeze exact route, DB schema, API endpoint, LiveKit grant shape, token expiry, or access query implementation.

Still pending:

- exact token endpoint design
- exact LiveKit grant shape
- exact token expiry / refresh policy
- exact session-party access query
- exact call state enum
- exact public broadcast visibility read model
- exact handoff ownership boundaries
- DB/API implementation evidence
- LiveKit private room/session naming boundary
- mobile camera/mic optional behavior evidence

## Next

Suggested next evidence area:

Pack 2B — Handoff Ownership Audit

No migration, route creation, schema freeze, LiveKit production implementation, or production implementation should start from this close-out alone.
