# Studio Camera Switch Prelive Wiring Tur B Close-Out

## Kısa hüküm

- Tur B PASS.
- Prelive camera switch wired successfully.
- Contract: release-first + 150ms settle + exact deviceId + React preview state commit.
- Live switch implementation bu turda scope dışı kaldı.
- Live sırasında switcher hidden/disabled kalması Tur B için intended behavior olarak korundu.

## Changed files

- `src/app/(studio)/studio/_components/useStudioPreviewBootstrap.ts`
- `src/app/(studio)/studio/_components/StudioPreviewPanel.tsx`
- `src/app/(studio)/studio/_components/StudioTopChrome.tsx`
- `src/app/(studio)/studio/_components/studio-route-shell.tsx`
- `src/app/(studio)/studio/_components/StudioPrepSurface.tsx`
- `docs/studio-camera-switch-prelive-wiring-tur-b-closeout.md`

## Implemented flow

- Top chrome camera button existing `utilityButton` sistemi üzerinden eklendi.
- `StudioPrepSurface` `cameraControl` state owner olarak bağlandı.
- `StudioPreviewPanel` stable memoized `cameraControl` publish ediyor.
- `useStudioPreviewBootstrap` `switchPreviewCamera` owner olarak bağlandı.
- Flow:
  - pending ref guard
  - current stream/video read
  - lock + `switchAttemptId`
  - `videoinput` device enumerate
  - active `deviceId` read
  - next device resolve
  - current video track stop
  - 150ms wait
  - `getUserMedia` exact target `deviceId`
  - live non-video/audio tracks preserve
  - next stream attach
  - `streamRef.current` commit
  - `previewState` `preview_ready` commit

## Scope boundaries preserved

- CSS/geometri değişmedi.
- `studio-livekit-publisher-adapter.ts` değişmedi.
- Live watch/viewer dosyaları değişmedi.
- DB/API/migration dosyaları değişmedi.
- `restartTrack` / `setDeviceId` / `preferredFacingMode` revival yapılmadı.
- Live camera switch implementation henüz yapılmadı.

## Static validation

- `git diff --name-only`
- Forbidden runtime grep:
  - `rg -n "restartTrack|setDeviceId|preferredFacingMode|switchStudioPublisherLiveVideo|useStudioLiveCameraSwitchSurface|StudioLiveCameraControl" src/app/'(studio)'/studio`
- `npm run lint`
- `npm run build`
- `git status -sb`

## Manual smoke result

- Redmi Chrome `/studio` prelive
- camera switch prelive içinde yaklaşık 9-10 kez tıklandı; hepsi başarılı
- refresh reset/boot sağlıklı kaldı ve front default behavior sağlıklı kaldı
- back camera seçiliyken prelive exit yapıldı, studio yeniden açıldı, stuck state oluşmadı
- mic button çalıştı
- close/exit çalıştı
- back camera seçiliyken live başlatıldı; switcher kayboldu ve back camera aktif kaldı
- back camera aktifken live bitti; studio yeniden açıldı, permission/stuck state oluşmadı
- live end/re-enter senaryosu yaklaşık 3 kez tekrarlandı; permission/stuck state oluşmadı
- MacBook Chrome viewer publisher back camera aktifken join oldu ve viewer back camera'yı doğru gördü
- live bittikten ve studio yeniden açıldıktan sonra permission/stuck state oluşmadı

## Remaining scope / next tur

- Tur C, live sırasında switch enable etmeye karar verirsek live publish camera switch'i ele alacak.
- Live switch implementation için viewer acceptance zorunlu kalmaya devam ediyor.
- Tur B yalnız prelive switch'i ve seçili camera ile live'a güvenli handoff'u ispatlıyor.
