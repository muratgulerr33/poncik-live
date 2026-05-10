# V2 Pack 2B Handoff Sequence Local Evidence Close-out

## Status

PASS

## Scope

This close-out records a local-only handoff sequence simulation result.

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

The goal was to validate the V2 active 1v1 handoff ownership and state transition boundary before route, API, LiveKit, migration, or schema implementation work.

Validated assumptions:

- /live phone action does not disturb public watch.
- 1v1 auth/minute gate stays scoped to the phone action.
- Logged-in user request creation does not start billing.
- /studio incoming request stays as a narrow slot.
- /studio active call media ownership is not taken by StudioPreviewPanel.
- Reject remains financially neutral.
- Accept creates one session candidate.
- Double accept does not create a second session candidate.
- Accept makes same-publisher public broadcast unavailable.
- Discovery follows public visibility, not private call detail.
- Public fallback does not leak private session detail.
- /call access is allowed only for session sides.
- Terminal session blocks /call access.
- Admin is not a private call participant.
- Call end finalizes the session.
- Public broadcast does not auto-resume after call end.
- Publisher returns to safe studio idle/prep.
- User return to / is the simulation default; /live current public state remains owner UX unknown / not frozen.
- Bad ownership attempts are detected and rejected.

## Local simulation

Script path:

/private/tmp/poncik-v2-pack-2b-handoff-sequence.js

Command:

node /private/tmp/poncik-v2-pack-2b-handoff-sequence.js

Result:

RESULT: PASS
PASS: 10
FAIL: 0
TOTAL: 10

## Correction note

The first local run failed because the throwaway script returned denied on the second accept attempt before checking the idempotent existing-session case.

The script was patched locally under /private/tmp only.

The patch changed the simulation so a repeated accept for an already accepted request with an existing session candidate returns noop instead of creating another session or failing the idempotency expectation.

This correction did not touch repo files.

## Confirmed scenarios

- guest taps phone on /live
- logged-in user taps phone on /live with sufficient minutes
- publisher sees incoming request on /studio
- publisher rejects request
- publisher accepts request
- requesting user enters /call
- publisher enters /call
- public viewer fallback
- call ends
- bad ownership attempts are rejected

## Key confirmations

### /live stays public watch

Phone action is an entry point for 1v1 request only.

Public playback/media ownership is not touched by the simulated request flow.

### Request creation does not start billing

A logged-in user with sufficient minutes creates a pending request, but billing does not start.

Financial truth remains tied to active timestamp and finalized duration from previous evidence.

### /studio owns incoming request, not active call media

The simulation keeps the incoming request as a narrow studio slot.

StudioPreviewPanel does not become the owner of active private call media.

### Accept creates one session candidate

Publisher accept creates one session candidate.

Double accept does not create another session candidate.

### Public visibility is separated from private call detail

Accept makes same-publisher public broadcast visibility false.

Discovery drops through public visibility.

Public fallback does not leak private session detail.

### /call is session-party scoped

Requesting user and target approved publisher can enter the accepted call.

Unrelated user, non-target publisher, unapproved publisher, admin, and terminal session access are denied.

### Call end stays terminal

Call end finalizes the session.

Public broadcast does not auto-resume.

Publisher returns to safe studio idle/prep.

### Bad ownership attempts are blocked

The simulation detects these invalid ownership attempts:

- live playback controller owns call lifecycle
- studio owns active call media
- call owns payment/gift/admin/earning dashboard
- api/studio/lifecycle owns private call finalize
- broadcasts store private call state

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

This PASS does not freeze exact route, DB schema, API endpoint, LiveKit grant shape, token expiry, access query implementation, or UI ownership file list.

Still pending:

- exact call API design
- exact private token endpoint / grant shape
- exact session-party access query
- exact public broadcast visibility read model
- exact request/session enum names
- exact DB constraints / transaction isolation
- exact insufficient balance behavior at finalize
- exact user return UX after call end
- exact /live phone action implementation ownership
- exact /studio incoming request slot implementation ownership
- exact /call active private media route ownership
- Pack 3 camera/mic optional evidence
- mobile/iOS behavior evidence

## Next

Suggested next evidence area:

Pack 3 — UX / Device / Camera-Mic Optional / Ephemeral Chat Evidence

No migration, route creation, schema freeze, LiveKit production implementation, or production implementation should start from this close-out alone.
