# V2 Pack 3B Real-device UX / Permission / Keyboard Evidence Plan Close-out

## Status

PASS WITH NOTES

## Scope

This close-out records the V2 Pack 3B real-device UX / permission / keyboard evidence plan.

This was not:

- real-device test execution
- production implementation
- migration
- route creation
- schema freeze
- API implementation
- Codex implementation
- persistent feature code
- DB integration test
- LiveKit production implementation
- chat transport freeze
- final product readiness

## Purpose

The goal was to define what must be tested on real devices before V2 active 1v1 UX can be considered ready.

This plan covers:

- real-device permission behavior
- camera/microphone optional UX
- keyboard-open ephemeral chat behavior
- Samsung multi-camera risk
- iOS Safari risk
- Android Chrome risk
- no-device fallback risk
- evidence capture format
- PASS / FAIL criteria
- remaining blockers

## Evidence status

Pack 3B is a plan-level PASS WITH NOTES.

It does not prove that real devices pass.

Real-device testing remains pending.

## Required device matrix

Minimum required evidence devices:

- Android Chrome baseline device
- Samsung Android Chrome multi-camera device
- iPhone Safari
- Desktop Chrome fallback / no-device case when needed

## Required permission scenarios

The real-device evidence plan requires these scenarios:

- camera permission allowed
- mic permission allowed
- camera permission denied
- mic permission denied
- camera + mic denied
- permission prompt ignored / pending
- no camera device
- no mic device
- permission retry / settings path notes
- OS/browser permission revoked behavior when feasible

## Required camera / mic optional UX scenarios

The plan requires evidence for:

- call entered with camera off and mic off
- mic enable
- camera enable
- camera + mic enable
- camera disable
- mic disable
- denied state keeps call continuity
- media controls disabled after call end
- camera/mic do not auto-capture without explicit user action

## Required ephemeral chat / keyboard scenarios

The plan requires evidence for:

- chat-only mode
- camera/mic off while chat active
- keyboard-open composer visibility
- keyboard-open media surface usability
- send message state
- call ended compose disabled
- no persistent chat history expectation
- long message readability
- iOS keyboard behavior
- Android keyboard behavior

## Evidence capture format

Each evidence item should record:

- route / surface
- device
- browser and browser version when available
- orientation
- viewport size
- account role
- state
- action taken
- expected result
- actual result
- screenshot or video need
- PASS / FAIL / UNKNOWN
- notes

## PASS criteria

Pack 3B plan is considered PASS WITH NOTES because it defines:

- device matrix
- permission scenario matrix
- keyboard / ephemeral chat evidence matrix
- screenshot / video checklist
- evidence collection order
- risk register
- PASS / FAIL criteria
- unknowns and blockers

A future real-device test can only be considered PASS if:

- permission denied does not close the call
- permission prompt pending does not freeze the UI
- keyboard-open composer remains usable
- camera/mic do not auto-capture
- camera/mic toggles do not affect billing truth
- chat remains active-call scoped
- chat does not become DM, inbox, public chat, social messaging, or persistent history
- admin does not become a private call participant
- public/private detail does not leak
- Samsung multi-camera behavior is understood
- iOS Safari behavior is separately validated

## Important caveat

This close-out does not mean:

- iPhone Safari passed
- Android Chrome passed
- Samsung multi-camera passed
- keyboard-open chat passed
- permission denied passed
- prompt pending passed
- final UX readiness passed
- final product readiness passed

It only records that the real-device evidence plan is ready.

## Repo impact

This close-out is doc-only.

Repo impact:

- no app code changed
- no migration created
- no route created
- no schema changed
- no production file created
- no DB connection used
- no LiveKit implementation added
- no chat transport implementation added

## Remaining blockers before implementation readiness

Still pending:

- real-device evidence execution
- iPhone Safari permission + keyboard evidence
- Android Chrome permission + keyboard evidence
- Samsung multi-camera behavior evidence
- prompt pending non-freeze evidence
- denied state call continuity evidence
- camera/mic auto-capture absence evidence
- call ended controls/chat disabled evidence
- chat persistence expectation evidence
- exact /call UX ownership
- exact camera/mic controller ownership
- exact ephemeral chat controller ownership
- exact LiveKit track publish behavior
- exact chat transport choice
- exact UI copy
- exact route/API/schema implementation design

## Next

Suggested next evidence area:

V2 Active 1v1 Implementation Planning Readiness Audit

That audit must not be treated as final product readiness.

No migration, route creation, schema freeze, LiveKit production implementation, chat transport implementation, or production implementation should start from this close-out alone.
