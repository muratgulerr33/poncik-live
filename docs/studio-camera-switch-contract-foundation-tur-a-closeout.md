# Studio Camera Switch Contract Foundation Tur A Close-Out

## Kısa hüküm

- Tur A foundation PASS.
- User-facing behavior değişmedi.
- Camera switch hâlâ disabled.
- New canonical proof truth kaydedildi.
- Browser-native release-first exact deviceId foundation hazırlandı.

## Changed files

- `docs/studio-camera-switch-contract-reset-and-tur0-proof.md`
- `docs/studio-camera-switch-technical-debt-closeout.md`
- `src/app/(studio)/studio/_adapters/studio-camera-device-adapter.ts`
- `docs/studio-camera-switch-contract-foundation-tur-a-closeout.md`

## Drift fix

- Old technical-debt doc kısa redirect stub oldu.
- Current canonical truth `docs/studio-camera-switch-contract-reset-and-tur0-proof.md` dosyasına taşındı.

## Adapter contract

- Export surface: `3 type + 9 function`
- Types:
  - `StudioCameraDeviceDescriptor`
  - `StudioCameraDeviceReadResult`
  - `StudioCameraStreamRequestResult`
- Functions:
  - `readStudioVideoInputDevices`
  - `readStudioActiveVideoDeviceId`
  - `resolveStudioDefaultFrontCamera`
  - `resolveStudioNextCameraDevice`
  - `requestStudioCameraStreamByDeviceId`
  - `stopStudioMediaStream`
  - `stopStudioVideoTracks`
  - `createStudioStreamWithReplacedVideo`
  - `waitStudioCameraReleaseSettle`
- Contract basis:
  - `navigator.mediaDevices`
  - `enumerateDevices()`
  - `getUserMedia()`
  - `exact deviceId`
  - `150ms settle`
- Error mapping:
  - `NotReadableError => not_readable`

## Scope boundaries preserved

- UI wiring yok.
- Prelive switch yok.
- Live switch yok.
- LiveKit handoff yok.
- Top chrome icon yok.
- CSS/geometri yok.
- Live watch yok.

## Validation

- `src/app/(studio)/studio` grep old runtime symbols: no hits.
- `docs` grep hits: yalnız historical / non-canonical context.
- `npm run lint`: PASS
- `npm run build`: PASS

## Next tur

- Tur B: prelive switch wiring
- Tur C: live publish switch
- Tur D: live end cleanup + default front reset
- Tur E: top chrome camera icon
- Tur F: runtime acceptance + viewer validation
