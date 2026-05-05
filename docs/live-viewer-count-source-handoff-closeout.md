# Live Viewer Count Source/Handoff Close-out

## Kısa hüküm

- PASS.
- Live viewer count source/handoff + viewer-side source fix tamamlandı.
- Runtime source artık LiveKit room presence snapshot'tan geliyor.
- Count video/media readiness beklemiyor.
- Visual slot daha önceki PR'da hazırdı; bu PR source/handoff wiring ve source correctness işidir.

## Scope

- Live `/live/[username]` viewer count.
- Source/hook/context/handoff.
- Viewer-side source correction.
- Studio yok.
- DB yok.
- polling yok.
- analytics/history/persistence yok.
- discovery viewer count yok.
- visual/CSS polish yok.

## Changed files

- `src/app/(public)/live/[username]/_components/live-watch-route-shell.tsx`
- `src/app/(public)/live/[username]/_components/live-watch-viewer-count-context.tsx`
- `src/app/(public)/live/[username]/_controllers/LiveWatchPlaybackController.tsx`
- `src/app/(public)/live/[username]/_controllers/useLiveWatchViewerCountMetric.ts`
- `docs/live-viewer-count-source-handoff-closeout.md`

## Implementation summary

- Route-local `LiveWatchViewerCountProvider` eklendi.
- `TopChromeBridge` viewer count metric'i context'ten okuyup `LiveWatchTopChrome` prop'una geçiriyor.
- `LiveWatchPlaybackController` hook'u çağırıyor, render-ready metric türetiyor, context'e effect ile publish ediyor.
- Setter render sırasında çağrılmıyor.
- Controller unmount cleanup'ta `null` publish ediyor.
- `LiveWatchTopChrome` render-only kalıyor.
- Visual slot/CSS bu turda değişmedi.

## Source truth

- İlk planlanan live source `Math.max(0, room.numParticipants - 1)` idi.
- Bu source refresh/ilk snapshot anında gecikmeye açık bulundu.
- Final source:
  - `Math.max(1, room.remoteParticipants.size, room.numParticipants - 1)`
- Bu formül:
  - first-viewer case'te `1` gösterebilir
  - room-level iki snapshot alanından daha güçlü olanı kullanır
  - event payload'dan count hesaplamaz
  - DB/polling/timer/rAF kullanmaz
  - owner invariant'a bağlıdır

## Owner invariant

- Her live room'da tek publisher vardır.
- Cohost yoktur.
- Bot/admin participant yoktur.
- Viewer route'a giren her izleyici LiveKit room participant'ıdır.
- Bu invariant değişirse source yeniden audit ister.

## UI timing lock

- Viewer count = room-connected presence metric.
- Viewer count = playback-ready/video-ready metric değildir.
- Count `mediaReady` veya `playbackState === "playing"` beklemez.
- Count'un video frame'den önce görünmesi bug değildir.
- Owner ileride spinner/transition yüzeyini ayrıca değiştirebilir; bu ayrı UI işi olacaktır.

## Reconnect / cleanup behavior

- `ParticipantConnected` / `ParticipantDisconnected`: current room snapshot yeniden okunur.
- `SignalConnected` / `Reconnected`: current room snapshot yeniden okunur.
- `SignalReconnecting` / `Reconnecting`: aynı room session içinde last-known count korunabilir.
- `Disconnected`: hard clear, metric `null`.
- `room === null`: metric `null`.
- Room instance değişirse eski cache yeni room'a taşınmaz.

## No-touch doğrulaması

- `LiveWatchTopChrome.tsx` dokunulmadı.
- `live-watch-top-chrome.module.css` dokunulmadı.
- `use-live-watch-playback.ts` dokunulmadı.
- `use-live-watch-playback-transition.ts` dokunulmadı.
- `live-watch-provider-adapter.ts` dokunulmadı.
- audio unlock behavior dokunulmadı.
- volume behavior dokunulmadı.
- Studio files dokunulmadı.
- DB/API/auth/token endpoint dokunulmadı.
- polling/analytics/persistence dokunulmadı.
- media geometry dokunulmadı.
- chat/comment logic dokunulmadı.

## Manual smoke evidence

- Owner defalarca gir/çık yaptı.
- Önceki 3-5 saniyelik delay görülmedi.
- Count doğru sayıyor.
- Count bazen video'dan önce gelebiliyor; owner bunu kabul etti.
- Bu davranış UI timing lock'a göre bug değil.
- Studio/Live parity ayrıca gözlenmeli; parity bozulursa source invariant yeniden audit edilir.

## Validation results

- `git diff --check`: PASS
- `npm run lint`: PASS
- `npm run build`: PASS
- targeted no-touch diff checks: PASS

## Future caution

- Bu source owner invariant'a bağlıdır.
- İleride cohost, admin/bot participant, 1v1, role-rich presence, discovery count, analytics/persistence gelirse bu source yeniden audit ister.
- Live count'u tekrar `mediaReady` / `playbackState` gate'ine bağlama.
- Video/media health ayrı status'tur; viewer count presence metric'tir.
