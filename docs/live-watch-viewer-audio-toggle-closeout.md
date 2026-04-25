# Live Watch Viewer Audio Toggle Close-out

## 1. Kısa hüküm

`PASS WITH NOTES`

## 2. Scope

- yalnız `/live/[username]` active live viewer audio toggle
- global Live Watch redesign değil
- viewer count değil
- V2 minute slot değil
- chat / DB / LiveKit transport işi değil

## 3. Changed files

- `src/app/(public)/live/[username]/_components/live-watch-audio-control-context.tsx`
- `src/app/(public)/live/[username]/_controllers/live-watch-controller.tsx`
- `src/app/(public)/live/[username]/_components/live-watch-shell.tsx`
- `src/app/(public)/live/[username]/_components/live-watch-route-shell.tsx`
- `src/app/(public)/live/[username]/_components/LiveWatchTopChrome.tsx`
- `src/app/(public)/live/[username]/_components/live-watch-top-chrome.module.css`
- `src/app/(public)/live/[username]/_controllers/use-live-watch-playback.ts`
- `src/app/(public)/live/[username]/page.tsx`

`page.tsx` değişti çünkü `LiveWatchShell` artık `audioToggleEnabled` prop'u istiyor; suspense fallback shell'inde audio toggle gösterilmemesi için `audioToggleEnabled={false}` açıkça geçirildi.

## 4. Ne yapıldı

- route-local audio control context kuruldu
- audio toggle active live top chrome sağ tarafına eklendi
- `LiveWatchTopChrome` prop-based render-only kaldı
- active-live-only guard `view.kind === "live"` üzerinden sağlandı
- ended/unavailable'da trailing audio button render edilmiyor
- audio muted state `use-live-watch-playback.ts` içinde gerçek audio element'e uygulanıyor
- attach öncesi mevcut muted state audio element'e set ediliyor

## 5. Accessibility

- `aria-pressed`
- state'e göre `aria-label`
- muted/unmuted icon state

## 6. No-touch

- `/studio`
- `StudioTopChrome`
- media geometry: `.page`, `.shell`, `.contentStack`, `.frame`, `.mediaStage`, `.playbackVideo`
- LiveKit transport / connection / subscription
- token API
- DB
- realtime/chat
- viewer count
- minute slot
- 1v1
- camera switcher
- shared/global abstraction

## 7. Validation

- `npm run lint`: PASS
- `npm run build`: PASS
- owner manual smoke: PASS

## 8. Owner smoke details

- audio mute/unmute works
- rapid toggle works
- X close works
- audio icon disappears after stream ended
- active live visual state PASS
- ended visual state PASS

## 9. Remaining notes / unknowns

- real iOS/Safari audio behavior future smoke olabilir
- viewer count ayrı tur
- V2 minute slot ayrı tur
- future chat/history/composer ayrı contract ister
