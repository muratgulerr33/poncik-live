# Live Watch Auth-Aware Playback Reconnect Close-out

## 1. Kısa hüküm

PASS

Auth sonrası stale guest LiveKit viewer connection problemi kapatıldı.
`chatAccess` değişince playback hook eski room'u cleanup ile kapatıp yeni session token ile yeniden bağlanır.
Full page reload, redirect, router refresh loop, chat submit hack'i eklenmedi.

## 2. Problem

Drawer login/register sonrası `chatAccess` `viewer_ready` oluyordu.
Composer açılıyordu.
Ama LiveKit room eski guest token ile bağlı kaldığı için ilk mesaj local history'de görünüp karşı tarafa gitmiyordu.
Sayfa refresh sonrası düzelmesi stale room/token root cause'unu doğruluyordu.

## 3. Root cause

`useLiveWatchPlayback` yalnız `username` dependency'si ile token fetch/connect yapıyordu.
Auth/access değişimi playback hook reconnect tetiklemiyordu.
Viewer token endpoint zaten session'a göre `canPublishData` üretiyordu.
Sorun token API değil, client room lifetime'ın auth sonrası stale kalmasıydı.

## 4. Changed files

- `LiveWatchPlaybackController.tsx`
- `use-live-watch-playback.ts`

## 5. Exact reconnect behavior

- `LiveWatchPlaybackController` içinde `chatAccess`'ten stable `viewerConnectionKey` üretildi.
- `viewer_ready` için key `viewer_ready:${viewerUsername}`.
- Diğer access state'lerinde key `access.kind`.
- `useLiveWatchPlayback` artık `username + viewerConnectionKey` alıyor.
- `viewerConnectionKey` token fetch/connect effect dependency listesine eklendi.
- Key server'a gönderilmiyor.
- Key yalnız client-side reconnect lifecycle tetikleyicisi.

## 6. Runtime flow

Guest room
→ drawer login/register
→ `router.refresh` sonrası `chatAccess` `viewer_ready`
→ `viewerConnectionKey` değişir
→ old room cleanup/disconnect
→ `fetchLiveWatchViewerToken(username)` yeniden çağrılır
→ server current session'a göre write-capable token üretir
→ `connectLiveWatchRoom` yeni token ile bağlanır
→ `setRoom` fresh room'u chat tarafına geçirir
→ chat realtime binding yeni room'a geçer

## 7. Non-scope / no-touch

- Drawer refactor yok
- ChatController değişmedi
- Notice değişmedi
- token API değişmedi
- `canPublishData` guest'e açılmadı
- local fake broadcast yok
- DB/migration yok
- Studio yok
- `/auth` yok

## 8. Validation

- `git diff --check`: PASS
- `npm run lint`: PASS
- `npm run build`: PASS
- forbidden file check: PASS

## 9. Manual smoke

Owner tarafından doğrulanacak:

- Guest olarak `/live/[username]` aç.
- Drawer üzerinden login ol.
- Welcome notice sonrası sayfayı refresh etmeden mesaj yaz.
- Mesaj publisher/studio ve diğer viewer'a gidiyor mu doğrula.
- Register için aynı testi yap.
- İkinci mesajın da refresh olmadan gittiğini doğrula.
- Reconnect sırasında kısa loading/transition kabul edilebilir.
- Uzun degraded state veya full page reload başarısızlık sayılır.

## 10. Follow-up note

- iPhone Safari drawer refactor ayrı turdur.
- Bu reconnect commit'i drawer refactor baseline'ı olarak kabul edilecek.
- Drawer refactor sırasında reconnect, notice, chat transport ve LiveKit room lifecycle'a dokunulmayacak.

## 11. Commit message

Planned/final commit message:

`live: reconnect viewer room after auth`
