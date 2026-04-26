# Live Watch Unified Media Transition Overlay Close-out

## 1. kısa hüküm

`/live/[username]` live branch unified media transition overlay işi dar scope içinde tamamlandı. Owner manual smoke sonucu PASS: overlay artık transition anlarında tek native spinner olarak görünüyor, chat/composer/guest CTA overlay üstüne çıkmıyor ve video geri gelince overlay kalkıyor.

## 2. tur adı

Poncik Live — Live Watch Unified Media Transition Overlay Close-out

## 3. exact scope

- Bu kapanış yalnız `/live/[username]` live branch unified media transition overlay işidir.
- Bu global watch completion değildir.
- Bu route loading/copy cleanup değildir.
- Bu `Yayın yükleniyor / Canlı yayın bağlanıyor` copy consolidation değildir.
- Bu rVFC / perfect first-frame işi değildir.
- Bu `/studio` işi değildir.
- Bu realtime transport işi değildir.

## 4. changed files

- `src/app/(public)/live/[username]/_controllers/use-live-watch-playback.ts`
- `src/app/(public)/live/[username]/_controllers/use-live-watch-playback-transition.ts`
- `src/app/(public)/live/[username]/_controllers/LiveWatchPlaybackController.tsx`
- `src/app/(public)/live/[username]/_components/LiveWatchPlaybackSurface.tsx`
- `src/app/(public)/live/[username]/_components/live-watch.module.css`

## 5. yapılan iş

- `mediaReady` playback hook içinde minimal media-readiness truth olarak eklendi.
- Transition owner `use-live-watch-playback-transition.ts` içinde overlay/chat visibility kararı normalize edildi.
- `LiveWatchPlaybackController.tsx` compose boundary olarak kaldı.
- `LiveWatchPlaybackSurface.tsx` render-only kaldı.
- Unified overlay live branch içinde:
  - refresh
  - reconnect
  - current video loss
  - media-not-ready
  anlarında tek native spinner olarak çalışacak şekilde sabitlendi.

## 6. mediaReady contract

- `mediaReady` UI policy değildir; playback hook içindeki minimal media-readiness truth’tur.
- `mediaReady` false:
  - playback başında
  - current video detach sırasında
  - current video loss proof öncesinde
  - cleanup / teardown sırasında
  - video playback fail / blocked path’te
- `mediaReady` true:
  - current video attach/playback success path’inde
  - current video-specific playback-start callback doğrulandığında
  - retry/manual-start sonrası current video gerçekten tekrar başlayabildiyse

## 7. unified overlay contract

- Overlay görünür:
  - live branch içinde
  - media not ready iken
  - blocked fallback dışında transition anlarında
- Overlay gizlenir:
  - `playbackState === "playing"`
  - `mediaReady === true`
- Chat/composer/guest CTA görünür:
  - live branch
  - `playbackState === "playing"`
  - `mediaReady === true`
- Chat/composer/guest CTA görünmez:
  - connecting
  - refresh/reconnect
  - current video loss
  - media-not-ready
  - overlay visible
  - ended
  - unavailable

## 8. layer precedence fix

- `.frameOverlay` z-index `2` oldu.
- chat root z-index `1` kaldı.
- Overlay artık chat/composer/guest CTA üstünde.
- Media geometry / object-fit / top chrome değişmedi.

## 9. özellikle yapılmayanlar

- `page.tsx` untouched kaldı.
- `live-watch-state.tsx` untouched kaldı.
- `LiveWatchChatSurface.tsx` untouched kaldı.
- ended owner untouched kaldı.
- route controller untouched kaldı.
- studio untouched kaldı.
- token/grant untouched kaldı.
- transport/realtime untouched kaldı.
- DB untouched kaldı.
- route loading shell alignment yapılmadı.
- loading/copy cleanup yapılmadı.
- `Yayın yükleniyor / Canlı yayın bağlanıyor` copy consolidation yapılmadı.
- rVFC eklenmedi.

## 10. validation

- `git diff --check`: PASS
- `npm run lint`: PASS
- `npm run build`: PASS

## 11. manual smoke sonucu

Owner manual smoke PASS:

- discovery card → live: tek native overlay spinner
- refresh: tek overlay spinner
- reconnect/current video loss: overlay üstte
- chat/composer/guest CTA overlay üstüne çıkmıyor
- video gelince overlay kalkıyor
- playback blocked bozulmadı
- ended/unavailable bozulmadı

## 12. known notes / follow-up

Kalan follow-up’lar:

- route loading shell alignment
- loading/copy consolidation
- optional rVFC/first-frame perfection mini audit

## 13. commit/push sonucu için alan

- commit: pending
- push: pending

## 14. final worktree status için alan

- status: pending

## 15. tek cümlelik karar

`/live/[username]` live branch unified media transition overlay işi dar scope içinde kapandı; route loading/copy cleanup ve rVFC follow-up olarak bırakıldı.
