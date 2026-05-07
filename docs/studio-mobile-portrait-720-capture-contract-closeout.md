# Studio Mobile Portrait 720 Capture Contract Close-out

## Kısa Hüküm

- Local Studio front/back matematiksel ölçüm PASS.
- Manual front/back switch PASS.
- Exit/return prelive PASS.
- `/live/[username]` henüz ölçülmedi; sıradaki temiz tur olacak.

## Değişen Dosyalar

- `src/app/(studio)/studio/_adapters/studio-camera-capture-contract.ts`
- `src/app/(studio)/studio/_adapters/studio-preview-adapter.ts`
- `src/app/(studio)/studio/_adapters/studio-camera-device-adapter.ts`

## Gate / Contract / Guard / Fallback Özeti

- Mobile portrait gate:
  - portrait orientation
  - narrow viewport
  - touch/coarse/mobile signal
- Request contract:
  - `width: { ideal: 1280 }`
  - `height: { ideal: 720 }`
  - `frameRate: { ideal: 30, max: 30 }`
- Actual expected source:
  - `720x1280 @ 30fps` portrait
- Actual source non-portrait ise:
  - yeni stream reject edilir
  - legacy fallback bir kez denenir
- Constraint / compatibility error ise:
  - legacy fallback bir kez denenir
- Permission blocked:
  - fallback ile maskelenmez

## Validation

- `git diff --check`
- `npm run lint`
- `npm run build`

## Manual Smoke Evidence

- Local `/studio` front: `720x1280 @ 30fps` PASS
- Local `/studio` back: `720x1280 @ 30fps` PASS
- Camera switch front/back/front PASS
- X ile çıkış + prelive dönüş PASS

## Residual

- Vercel smoke pending
- `/live/[username]` viewer measurement pending
- MacBook/desktop/kare kamera için eski behavior korunmalı; ayrı evidence olmadan kalite kararı yok
