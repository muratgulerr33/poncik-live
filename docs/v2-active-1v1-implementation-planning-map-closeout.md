# V2 Active 1v1 Implementation Planning Map Close-out

## Status

PASS WITH NOTES

## Scope

This close-out records the V2 Active 1v1 Implementation Planning Map result.

This was not:

- production implementation
- migration
- route creation
- schema freeze
- API route freeze
- file list freeze
- LiveKit private token / grant freeze
- chat transport freeze
- Codex implementation prompt
- final ADR
- final product readiness

## Purpose

The goal was to create a doc-only planning map for V2 active 1v1 before any implementation work starts.

The planning map defines:

- decision audit sequence
- candidate PR slicing direction
- dependency order
- route / surface ownership guardrails
- DB / API / schema decision audit order
- token / access API design audit order
- UX / device evidence follow-up order
- god-file and route-local risk guards

## Planning verdict

Implementation planning map:

PASS WITH NOTES

Implementation planning can continue.

Production implementation cannot start yet.

## Confirmed planning sequence

The planning map established this safe order:

1. Boundary recap
2. Schema / API decision audit
3. Billing / rounding / rate snapshot audit
4. DB constraint + transaction audit
5. Token / access API design audit
6. Route / surface skeleton plan
7. Chat transport boundary audit
8. UX / device evidence follow-up
9. Candidate PR slicing map
10. Implementation readiness gate

## Key planning rules

### Doc-only before implementation

Planning and decision audits must remain doc-only until the relevant blockers are resolved.

### No production implementation yet

No production code should start from this planning map alone.

### No migration yet

Schema/API/constraint decisions are still pending.

### No route creation yet

`/call/[sessionId]` remains a V2 owner-lock boundary and planning surface.

This close-out does not create the route.

### No schema/API freeze yet

Exact fields, endpoint names, enum names, constraints, and route file names remain pending.

### No LiveKit/chat transport freeze yet

Public/private token separation is validated at boundary level, but exact LiveKit grant shape is not frozen.

Ephemeral chat boundary is validated, but exact transport choice is not frozen.

## Candidate PR slicing direction

The planning map produced candidate PR groups only.

These are not implementation prompts.

Candidate groups:

- V2 server boundary foundation
- Billing truth foundation
- Request/session lifecycle boundary
- Private token/access boundary
- `/live` phone action surface
- `/studio` incoming request slot
- `/call` private surface skeleton
- Optional camera/mic UX
- Ephemeral chat implementation
- Publisher earning snapshot
- Minimal admin V2 payment scope if needed
- Real-device UX hardening

## Important PR guard

Each future PR must have one main purpose.

Do not combine:

- auth
- admin
- studio
- call
- payment
- LiveKit
- chat
- earning
- device hardening

into one large PR.

## Dependency rules

The planning map established these dependency rules:

- Schema/API decision audit must happen before migration.
- Billing/rounding/rate snapshot audit must happen before minute ledger implementation.
- DB constraint + transaction audit must happen before production accept/finalize logic.
- Token/access API design audit must happen before private LiveKit token implementation.
- Route/surface skeleton plan must happen before `/call` UI implementation.
- Chat transport boundary audit must happen before chat implementation.
- Real-device evidence execution is required before final UX readiness.
- Implementation readiness gate must happen before the first production PR.

## Surface guardrails

### `/live/[username]`

Allowed:

- public watch
- phone action / 1v1 request entry

Forbidden:

- active private media
- private session detail
- call lifecycle ownership
- billing truth ownership

### `/studio`

Allowed:

- publisher incoming request
- accept / reject narrow slot

Forbidden:

- active private call media
- payment panel
- earning dashboard
- private call lifecycle ownership

### `/call/[sessionId]`

Allowed:

- active private 1v1 surface
- optional camera/mic controls
- ephemeral active-session chat
- visual timer
- end/fallback state

Forbidden:

- dashboard
- payment
- gift
- admin
- publisher earning panel
- discovery
- DM / inbox / social messaging
- persistent chat history

### Discovery

Allowed:

- public broadcast visibility / lifecycle read model

Forbidden:

- direct private call state dependency

### Public fallback

Allowed:

- generic unavailable / busy fallback

Forbidden:

- private session id
- private call detail
- private reason leakage

## DB / API guardrails

### `broadcasts`

Must remain narrow public broadcast lifecycle.

Forbidden inside broadcasts:

- 1v1 state
- minute state
- payment state
- chat state
- publisher earning state
- social state

### `call_requests` / `call_sessions`

Remain conceptual V2 paid 1v1 families.

Exact schema is not frozen.

### Minute ledger

User minute ledger remains separate from publisher earning.

### Publisher earning

Publisher earning remains separate from user package price and manual payment tracking.

V2 owner input:

- publisher earning is not commission-based
- 1v1 publisher earning = paid minutes x global publisher minute unit rate
- future publisher-specific rate can be added later
- duration snapshot + rate snapshot + computed amount snapshot should be considered

Exact schema remains pending.

## God-file risk guards

The planning map blocks these risks:

- `/live` playback controller owning call lifecycle
- `/studio` owning active private call media
- `/call` becoming payment / gift / admin / earning / dashboard surface
- `api/studio/lifecycle` owning private call finalize
- `broadcasts` storing private call state
- public/private LiveKit token logic mixing
- client timer, camera state, mic state, or chat state becoming financial truth
- ephemeral chat becoming DM, inbox, public chat, or persistent history
- generic shared/ui, generic useLive.ts, generic live.ts, or generic utils.ts being opened as shortcuts

## Remaining unknowns

### Product unknowns

- final `/call` microcopy
- busy/private fallback copy
- user request cancel behavior
- reject reason requirement
- admin V2 payment approval exact scope

### DB/API unknowns

- exact schema fields
- exact migration order
- exact enum values
- exact constraint names
- exact endpoint names
- exact transaction boundaries
- exact cleanup / failure recovery policy

### UX/device unknowns

- iOS Safari behavior
- Android Chrome keyboard-open behavior
- Samsung multi-camera behavior
- real permission denied behavior
- real prompt pending behavior
- desktop call layout
- low-device performance

### Finance unknowns

- exact global publisher minute unit rate config source
- rounding policy
- minimum billable duration
- session interruption billing policy
- refund / manual correction policy
- publisher settlement timing

### Transport unknowns

- exact LiveKit private token grant shape
- chat transport choice
- reconnect behavior
- token expiry / refresh behavior

### Implementation unknowns

- exact file list
- exact route implementation
- exact API implementation
- exact component/controller ownership

## Success criteria

This planning map is PASS WITH NOTES because it:

- gives a safe implementation planning sequence
- keeps output doc-only
- avoids migration
- avoids route creation
- avoids schema/API/file freeze
- avoids LiveKit/chat transport freeze
- avoids Codex implementation prompt
- preserves `/live`, `/studio`, `/call` ownership boundaries
- protects `broadcasts` from V2 private state
- protects billing truth from client/media/chat state
- protects ephemeral chat from becoming DM/public/social/history
- keeps real-device evidence as final UX blocker

## Next

Suggested next work:

V2 Active 1v1 Docs Cleanup — Typo and Wording Safety Patch

After docs cleanup, continue with:

V2 Active 1v1 Schema/API Decision Audit — Doc-only Boundary Pass

No migration, route creation, schema freeze, API freeze, LiveKit production implementation, chat transport implementation, Codex implementation prompt, or production implementation should start from this close-out alone.
