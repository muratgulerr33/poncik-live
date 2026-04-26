# LiveKit Data Channel Realtime Seam Tur 5B Close-out

## 1. kısa hüküm

Tur 5B realtime seam completed with notes. Bu global chat completion değildir; yalnız V1 active live context içinde ephemeral LiveKit data packet realtime seam close-out'udur.

## 2. tur adı

Tur 5B — LiveKit Data Channel Realtime Seam

## 3. exact scope

- `/studio` publisher surface ile `/live/[username]` watcher surface arasında ephemeral realtime chat data seam’i kuruldu.
- LiveKit reliable data packet send/receive seam’i eklendi.
- Studio publish path local smoke davranışından çıkarıldı.
- Live Watch publish/receive path local smoke davranışından çıkarıldı.
- Packet protocol source-of-truth tek helper altında toplandı.
- Packet id, UI row id ve duplicate guard tek truth haline getirildi.
- Route-local Live Watch permission truth, token grant ve chatAccess ile hizalı tutuldu.
- Guest read açık, write kapalı kaldı.
- Publisher `/live/[username]` write kapalı kaldı; publisher write surface `/studio` olarak kaldı.
- Admin operational write `/live/[username]` içinde açık bırakıldı.

## 4. önceki durum / problem proof

Tur 5B öncesinde realtime seam yoktu.

- `publishData` yoktu.
- `RoomEvent.DataReceived` yoktu.
- `poncik.chat.message.v1` yoktu.
- `live-chat-packet-protocol` yoktu.
- Studio ve Live Watch local `setMessages(...)` smoke path ile yalnız kendi ekranında mesaj gösteriyordu.
- Cross-device visible realtime data propagation yoktu.

## 5. changed files

Tracked modified files:

- `src/app/(public)/live/[username]/_adapters/live-watch-viewer-token-boundary.ts`
- `src/app/(public)/live/[username]/_components/LiveWatchChatSurface.tsx`
- `src/app/(public)/live/[username]/_controllers/LiveWatchChatController.tsx`
- `src/app/(public)/live/[username]/_controllers/LiveWatchPlaybackController.tsx`
- `src/app/(public)/live/[username]/_controllers/live-watch-controller.tsx`
- `src/app/(public)/live/[username]/_controllers/use-live-watch-playback.ts`
- `src/app/(studio)/studio/_adapters/studio-livekit-token-adapter.ts`
- `src/app/(studio)/studio/_components/StudioChatOwners.tsx`
- `src/app/(studio)/studio/_components/StudioPreviewPanel.tsx`
- `src/app/(studio)/studio/_components/useStudioPublishFoundation.ts`

Untracked/new files added in this tur:

- `src/app/_lib/live-chat-packet-protocol.ts`
- `src/app/(studio)/studio/_lib/studio-chat-realtime-transport.ts`
- `src/app/(public)/live/[username]/_lib/live-watch-chat-realtime-transport.ts`
- `src/app/(public)/live/[username]/_lib/live-watch-viewer-write-access.ts`
- `docs/livekit-data-channel-realtime-seam-tur-5b-closeout.md`

## 6. packet protocol contract

- Topic: `poncik.chat.message.v1`
- Payload:
  - `v: 1`
  - `type: "chat.message"`
  - `id: string`
  - `text: string`
- Reliable LiveKit data packet kullanılır.
- Username payload'a taşınmaz.
- Display username receiver tarafında `participant.name` üzerinden okunur.
- Validation/drop kuralları:
  - topic mismatch drop
  - malformed JSON drop
  - unknown version/type drop
  - invalid or oversized id drop
  - invalid, trimmed-empty, or `>220` text drop
  - oversized payload drop

## 7. protocol helper boundary

- Helper path: `src/app/_lib/live-chat-packet-protocol.ts`
- Helper client-safe kalır:
  - no `server-only`
  - no Node-only API
  - no token/secret
  - no React/JSX/CSS
  - no Room lifecycle
- Helper yalnız şunları taşır:
  - topic constant
  - version/type constants
  - max text/id length
  - packet id generator
  - encode/decode
  - validation/drop result
- Bu helper shared UI değildir.
- Bu helper generic chat abstraction değildir.
- Bu helper generic `utils/live.ts` helper çöplüğü değildir.

## 8. Studio realtime seam

- `useStudioPublishFoundation` publisher `Room` state expose eder.
- `StudioPreviewPanel` dar prop ile `publisherRoom`u `StudioChatOwners`'a verir.
- `StudioChatOwners` transport implementation dosyası olmadı; UI state ve bridge katmanı olarak kaldı.
- Studio numeric smoke id path kaldırıldı ve packet id string truth'una geçti.
- Publish success olmadan local append yapılmaz.
- Publish success sonrası aynı packet id ile local append yapılır.
- `RoomEvent.DataReceived` ile remote append yapılır.
- Own echo duplicate guard ile drop edilir.

## 9. Live Watch realtime seam

- `use-live-watch-playback` mevcut playback ownership'i bozmadan `Room | null` state expose eder.
- `LiveWatchPlaybackController` room'u dar prop olarak `LiveWatchChatController`'a iletir.
- `LiveWatchChatController` transport implementation dosyası olmadı; UI/controller katmanı olarak kaldı.
- Live Watch local random id path helper-generated packet id truth'una taşındı.
- Publish success olmadan local append yapılmaz.
- Publish success sonrası aynı packet id ile local append yapılır.
- `RoomEvent.DataReceived` ile remote append yapılır.
- Own echo duplicate guard ile drop edilir.

## 10. room access seam

- Playback hook media/playback owner olarak kaldı.
- Chat transport playback hook içine gömülmedi.
- Studio publish foundation chat transport owner yapılmadı.
- Room seam yalnız reactive room access expose edecek kadar açıldı.
- Listener cleanup room değişiminde ve unmount sırasında çalışır.

## 11. permission / role gate

- Permission truth helper: `src/app/(public)/live/[username]/_lib/live-watch-viewer-write-access.ts`
- Token grant ve `chatAccess` aynı route-local server permission truth'a bağlıdır.
- Guest:
  - playback/read açık
  - write kapalı
- User:
  - `roleType === "user"` + non-empty username ise write açık
- Admin:
  - operational write açık
  - bu moderation/report sistemi değildir
  - bu manuel operasyonel denetim/katılım kolaylığıdır
- Publisher:
  - `/live/[username]` write kapalı
  - publisher write surface `/studio`
- Username empty or degraded:
  - read açık
  - write kapalı
- Fake username fallback yok:
  - `Sen`
  - `User`
  - `Viewer`
  - `anonymous`
  - `guest`

## 12. token grants

- Viewer token:
  - `canPublishData` yalnız allowed write lane'lerde açılır
  - guest/degraded/username-empty/publisher read-only kalır
- Publisher token:
  - explicit `canPublishData: true`
  - `canSubscribe: false` olarak kaldı
  - media subscription scope büyütülmedi
- Payload username taşımaz.
- Participant identity/name token kaynaklı kalır.

## 13. duplicate / memory / cooldown policy

- Duplicate key: `${participant.identity}:${payload.id}`
- Packet id = UI row id = duplicate id
- History cap: 100
- Duplicate key cap: 200
- Cooldown: 900ms
- Unbounded Set/Map bırakılmaz

## 14. listener cleanup policy

- Transport helper'lar:
  - `room.on(RoomEvent.DataReceived, ...)`
  - `room.off(RoomEvent.DataReceived, ...)`
- Cleanup room change ve unmount sırasında çalışır.
- Stale room listener çoğalması önlenir.

## 15. ephemeral behavior

- Bu DM değildir.
- Bu persisted chat değildir.
- Bu moderation/report sistemi değildir.
- Bu social/growth feature değildir.
- Bu UI redesign değildir.
- Bu global chat completion değildir.
- Bu V1 active live room içinde ephemeral in-scene realtime chat seam'idir.
- Reliable data packet kullanılır ama disconnected receiver için history/replay garanti edilmez.
- Server-side persisted history yoktur.
- Message history client-side cap ile sınırlıdır.
- Refresh sonrası mesajların kaybolması beklenen davranıştır.
- Replay yoktur.
- Offline queue yoktur.

## 16. security smoke / text rendering

- Chat render React text node olarak kalır:
  - Live Watch: `<p>{message.content}</p>`
  - Studio: `<p>{message.text}</p>`
- `dangerouslySetInnerHTML`, `innerHTML`, `insertAdjacentHTML`, `eval`, `new Function` seam içinde kullanılmaz.
- Owner manual payload smoke:
  - `<script>alert("xss")</script>`
  - `<img src=x onerror=alert("xss")>`
  - `<svg onload=alert("xss")></svg>`
  - `<a href="javascript:alert(1)">tıkla</a>`
- Sonuç:
  - alert çalışmadı
  - HTML execute olmadı
  - payloadlar düz metin olarak göründü

## 17. manual smoke result

Owner-reported/manual smoke:

- Test cihazları:
  - MacBook Chrome: `/studio`
  - Redmi Note 11 Pro
  - Galaxy Note 10 Lite
- Guest PASS:
  - guest yalnız okuyor
  - guest yazamıyor
- Realtime PASS:
  - kim mesaj atarsa atsın 3 cihazda da 1 saniyenin altında görünüyor
  - Studio -> viewer çalışıyor
  - user viewer -> Studio çalışıyor
  - user viewer -> diğer viewer çalışıyor
  - admin viewer -> yazabiliyor
  - publisher viewer -> yazamıyor
- Duplicate PASS:
  - 1 mesaj atılınca 1 mesaj görünüyor
  - duplicate/echo yok
- Max length PASS
- Scroll PASS:
  - 10-15 mesaj sonrası scroll sorunsuz
- Refresh expected behavior PASS:
  - refresh sonrası mesajlar kayboluyor
  - bu beklenen, çünkü chat ephemeral
- Composer security PASS:
  - kod/sembol payloadları düz metin olarak gidiyor

## 18. known non-blocking follow-up notes

- Yayın bitirme anında `/live/[username]` tarafında 2-3 saniye siyah ekran / ended transition gecikmesi görülebiliyor.
- Bu sırada eski chat history siyah ekran üzerinde kısa süre görünebiliyor.
- Composer kapanıyor / write kapanıyor.
- Sonrasında `Yayın sona erdi` UI geliyor.
- Surface tarafında micro visibility patch uygulandı:
  - `isHistoryVisible = isInteractive && messages.length > 0`
  - `hasVisibleChatContent` ile `aria-hidden` düzeltildi
- Gerçek kök neden chat değil:
  - Live Watch ended/disconnect transition siyah ekran gecikmesi
- Bu Tur 5B realtime seam blocker değildir.
- Ayrı follow-up:
  - `Live Watch ended/disconnect transition black-screen cleanup`

## 19. özellikle yapılmayanlar / scope dışı

- DB/schema/migration
- persistence
- replay
- offline queue
- moderation/report/admin panel
- typing/reaction/gift/DM
- shared/global abstraction
- generic `useChat`
- generic `utils`
- generic `live.ts`
- auth route değişikliği
- watch auth wall
- media geometry
- top chrome geometry
- UI redesign

Future V3 moderation/persistence için bugünkü guardrail:

- topic versioned
- payload versioned
- protocol helper tek source-of-truth
- transport helper UI controller'dan ayrı
- participant identity/name token kaynaklı
- payload username taşımaz

## 20. validation

- `git diff --check`: PASS
- `npm run lint`: PASS
- `npm run build`: PASS

## 21. commit / push / final worktree result

- Commit bu close-out turunda atılacaktır:
  - `live: close out data channel realtime seam tur 5b`
- Push hedefi:
  - `origin main`
- Final worktree clean olmalıdır.
