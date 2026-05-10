# V2 Pack 3A UX / Device / Ephemeral Chat State Local Evidence Close-out

## Status

PASS

## Scope

This close-out records a local-only UX / device / ephemeral chat state simulation result.

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
- real browser permission evidence
- real-device evidence
- chat transport freeze

## Purpose

The goal was to validate V2 active 1v1 UX state boundaries before route, API, LiveKit, migration, schema, or production implementation work.

Validated assumptions:

- User can enter active 1v1 with camera off and mic off.
- User can watch and use ephemeral chat while camera/mic are off.
- Mic enabled is media/UX state only.
- Camera enabled is media/UX state only.
- Camera + mic enabled changes media state but not financial truth.
- Camera permission denied keeps call continuity.
- Mic permission denied keeps call continuity.
- Missing camera device keeps call continuity.
- Missing mic device keeps call continuity.
- Permission prompt ignored / pending does not freeze the call surface in the simulation.
- Chat-only mode stays active-session scoped.
- Call end disables controls and chat compose.
- Ephemeral chat does not persist as DM, inbox, public live chat, or social messaging.
- Camera/mic/chat/client timer do not become financial truth.
- /call does not own payment, gift, admin, earning dashboard, or discovery.
- Admin is not a private call participant.
- Auto capture without explicit user action is treated as forbidden.

## Local simulation

Script path:

/private/tmp/poncik-v2-pack-3a-ux-device-chat-state.js

Command:

node /private/tmp/poncik-v2-pack-3a-ux-device-chat-state.js

Result:

Result: 12 PASS / 0 FAIL

## Confirmed scenarios

- call entered with camera off + mic off
- mic enabled
- camera enabled
- camera + mic enabled
- camera permission denied
- mic permission denied
- no camera device
- no mic device
- permission prompt ignored / pending
- chat only mode
- call ended
- forbidden ownership attempts are rejected

## Key confirmations

### Camera and mic are optional

Camera and microphone are not required to enter or remain in the active 1v1 call state.

### Camera and mic are not financial truth

Camera state and microphone state do not start billing and do not change financial truth.

Financial truth remains backend active timestamp and finalized duration.

### Ephemeral chat stays scoped to active 1v1

Chat-only mode is valid in the simulation.

Chat is active-session scoped only.

It is not DM, inbox, public live chat, social messaging, or persistent history.

### Permission/device problems do not end the call

Camera denied, mic denied, no camera, no mic, and pending permission states keep call continuity in the simulation.

### Call end is terminal for controls and chat

When the call ends, controls are disabled and chat compose is disabled.

### Forbidden ownership is blocked

The simulation detects these invalid ownership attempts:

- camera state starts billing
- mic state starts billing
- chat state starts billing
- client timer becomes financial truth
- /call owns payment/gift/admin/earning/discovery
- ephemeral chat persists or crosses into DM/public/social
- permission denied exits the call automatically
- auto capture starts without explicit user action
- admin becomes private call party

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
- no chat transport implementation added

This close-out is doc-only evidence.

## Important caveat

This PASS is local state simulation evidence only.

It does not prove:

- real browser permission prompt behavior
- iOS Safari behavior
- Android Chrome behavior
- Samsung multi-camera behavior
- real getUserMedia behavior
- keyboard-open chat behavior
- LiveKit transport behavior
- DB/API/route implementation behavior
- exact UI copy
- exact file/component/controller ownership

## Remaining blockers before migration / implementation

This PASS does not freeze exact route, DB schema, API endpoint, LiveKit grant shape, chat transport, token expiry, access query implementation, UI copy, or UI ownership file list.

Still pending:

- Pack 3B real-device evidence plan
- iOS Safari permission behavior evidence
- Android Chrome permission behavior evidence
- Samsung multi-camera behavior evidence
- permission denied real-device screenshots
- permission prompt ignored / pending real-device behavior
- keyboard-open ephemeral chat behavior
- exact /call UX ownership
- exact camera/mic controller ownership
- exact ephemeral chat controller ownership
- exact LiveKit track publish behavior
- exact chat transport choice
- exact UI copy
- final readiness audit

## Next

Suggested next evidence area:

Pack 3B — Real-device UX / Permission / Keyboard Evidence Plan

No migration, route creation, schema freeze, LiveKit production implementation, chat transport implementation, or production implementation should start from this close-out alone.
