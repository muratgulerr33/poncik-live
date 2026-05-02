# Live Watch Media Frame Parity + Source-Ratio Safe-Contain Close-out

## 1. Kısa hüküm

`PASS WITH NOTES`

Bu close-out yalnız `/live/[username]` mobile portrait active playback media geometry ailesini kapatır:

- Tur 3A: media frame parity
- Tur 3B: source-ratio safe-contain fallback

Global Live Watch redesign PASS değildir.

## 2. Scope

Bu close-out şunları kapsar:

- `/live/[username]` mobile portrait active playback scene
- portrait source için canonical frame-fill parity
- legacy `scale(1.1)` migration removal
- route-local media polish compatibility
- non-portrait source için source-ratio-aware `safe-contain` fallback

Bu close-out şunları kapsamaz:

- `/studio` değişikliği
- top chrome foreground polish
- comment/login affordance polish
- chat / realtime / LiveKit / DB / auth
- landscape/orientation redesign
- shared/global abstraction
- `contain-with-backdrop`

## 3. Repo safety sonucu

- `git branch --show-current`: `main`
- `git status -sb`: expected dirty Tur 3 files doğrulandı
- `git diff --name-only`: yalnız beklenen Tur 3 source file'ları doğrulandı

## 4. Changed files

- `src/app/(public)/live/[username]/_components/live-watch.module.css`
- `src/app/(public)/live/[username]/_components/useLiveWatchMediaPolish.ts`
- `docs/live-watch-media-frame-parity-source-ratio-safe-contain-closeout.md`

## 5. Diff özeti

### Tur 3A parity foundation

- mobile portrait playback video legacy `contain + scale(1.1)` path'i kaldırıldı
- portrait canonical path `cover + transform none` olarak kilitlendi
- polish hesabı transform-scale bağımlılığından çıkarıldı
- cover path için `sideInset: 0` route-local olarak korundu

### Tur 3B source-ratio safe-contain

- media stage üzerinde local `data-live-media-fit` contract üretildi
- resolved fit mode:
  - metadata yoksa `cover`
  - portrait frame + `videoWidth >= videoHeight` ise `safe-contain`
  - diğer tüm durumda `cover`
- CSS, yalnız local `data-live-media-fit="safe-contain"` branch'inde `contain` tüketiyor
- `safe-contain` path'te zoom/scale yok, stretch/deform yok, full source görünürlüğü öncelikli

## 6. Final runtime contract

### Portrait source canonical baseline

- `object-fit: cover`
- `transform: none`
- frame fill
- polish ready
- `sideInset: 0`
- source ratio korunur
- stretch/deform yok

### Non-portrait source fallback

- policy adı: `safe-contain`
- trigger:
  - frame portrait
  - metadata ready
  - `videoWidth >= videoHeight`
- davranış:
  - `object-fit: contain`
  - `transform: none`
  - source ratio korunur
  - zoom/scale yok
  - backdrop/blur/dim yok

## 7. No-touch alanlar

- `/studio` untouched
- `LiveWatchPlaybackSurface.tsx` untouched
- `LiveWatchMediaPolish.tsx` untouched
- `live-watch-media-polish.module.css` untouched
- `LiveWatchTopChrome.tsx` untouched
- `live-watch-top-chrome.module.css` untouched
- chat/comment/login/auth/LiveKit/DB untouched
- shared/global abstraction yok
- third helper/component yok
- `contain-with-backdrop` yok

## 8. Risk / notes

- portrait source regression bu iş ailesindeki en kritik risk olarak değerlendirildi
- non-portrait source için `safe-contain` görsel olarak boşluk üretebilir; bu bilinçli tradeoff'tur
- `contain-with-backdrop` istenirse ayrı küçük PR gerektirir
- owner gerçek cihaz manual smoke bu turn içinde terminalden doğrulanmadı; bu yüzden close-out dürüstçe `PASS WITH NOTES`

## 9. Validation

- `git diff --check`: PASS
- `npm run lint`: PASS
- `npm run build`: PASS

## 10. Commit message

- `live: close out media frame parity safe-contain`

## 11. Push sonucu

- close-out execution turn'ünde `git push origin main` çalıştırılır
- gerçek push sonucu terminal kaydıyla doğrulanır

## 12. Final worktree durumu

- close-out turn'ü sonunda `git status -sb` clean olmalıdır
- gerçek clean status terminal kaydıyla doğrulanır
