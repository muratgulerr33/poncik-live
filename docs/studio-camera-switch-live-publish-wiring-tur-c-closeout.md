# Studio Camera Switch Live Publish Wiring Tur C Close-Out

## Kısa hüküm

- Tur C PASS.
- Live camera switch publish wiring başarıyla uygulandı.
- Prelive Tur B behavior korundu.
- Contract: release-first + 150ms settle + exact deviceId + React preview state commit + LiveKit unpublish/publish.
- Viewer acceptance manual smoke ile doğrulandı.

## Changed files

- `src/app/(studio)/studio/_adapters/studio-livekit-publisher-adapter.ts`
- `src/app/(studio)/studio/_components/StudioPreviewPanel.tsx`
- `src/app/(studio)/studio/_components/useStudioPreviewBootstrap.ts`
- `src/app/(studio)/studio/_components/useStudioPublishedCameraSwitch.ts`
- `docs/studio-camera-switch-live-publish-wiring-tur-c-closeout.md`

## Implemented live switch flow

- `StudioPreviewPanel` live availability için `publisherRoom !== null` state truth kullanıyor.
- Prelive toggle hâlâ `switchPreviewCamera()` çağırıyor.
- Live toggle `useStudioPublishedCameraSwitch()` çağırıyor.
- Live hook flow:
  - current room check
  - pending guard
  - `beforeCurrentVideoStop`: current published camera track `unpublishTrack(track, true)`
  - browser-side release-first preview switch
  - 150ms settle
  - exact target `deviceId` `getUserMedia`
  - next stream attach
  - `afterNextVideoAttachBeforeCommit`: new camera track `publishTrack(..., { source: Track.Source.Camera })`
  - stale/abort safety with best-effort orphan cleanup
  - success only after `streamRef.current` and `previewState = "preview_ready"` commit

## Scope boundaries preserved

- no CSS/geometri changes
- no viewer/live watch file changes
- no DB/API/migration changes
- no top chrome visual polish changes
- no `restartTrack`
- no `setDeviceId`
- no `preferredFacingMode`
- no old `switchStudioPublisherLiveVideo`
- no old `useStudioLiveCameraSwitchSurface`

## Static validation

- `git branch --show-current`
- `git status -sb`
- `git diff --name-only`
- `rg -n "restartTrack|setDeviceId|preferredFacingMode|switchStudioPublisherLiveVideo|useStudioLiveCameraSwitchSurface|StudioLiveCameraControl" src/app/'(studio)'/studio`
- `npm run lint`
- `npm run build`
- `git status -sb`

## Manual smoke result

- Redmi Chrome publisher `/studio`
- prelive switch remained healthy
- live started successfully
- live switch front -> back PASS
- live switch back -> front PASS
- repeated live switches PASS
- rapid consecutive switch tapping PASS
- no stuck state
- no permission popup regression
- no geometry regression
- mic mute/unmute worked
- chat worked while back camera was active
- live stop and re-enter defaulted safely to front camera
- repeated exit/re-enter remained healthy
- MacBook Chrome viewer saw camera changes correctly
- iPhone 16 Pro viewer also saw camera changes correctly at the same time
- live end transition remained healthy

## Remaining scope / next tur

- Camera switch live publish is accepted.
- Future hardening can be separate only if a concrete runtime issue appears.
- No additional viewer code was needed in Tur C.
- Next tur should not reopen this scope unless a new failing proof exists.
