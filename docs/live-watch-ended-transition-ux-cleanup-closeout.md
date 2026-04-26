# Live Watch Ended Transition UX Cleanup Close-out

## 1. Kısa hüküm

`PASS WITH NOTES`

`/live/[username]` ended transition UX cleanup kapatıldı.

Bu close-out global Live Watch redesign değildir; yalnız live branch stale chat cleanup, strict ended redirect owner ve god-file recovery kapsamını kapatır.

## 2. Problem ve root cause

- Publisher stop sonrası viewer yüzeyinde kısa siyah ara ekran görülebiliyordu.
- Bu ara anda stale chat history ve composer siyah surface üstünde görünür kalıyordu.
- Strict ended truth server branch ile geliyordu, fakat client playback/transition tarafında ara cleanup eksikti.
- İlk implementation denemesi behavior’ın bir kısmını toplasa da `use-live-watch-playback.ts` dosyasını 491 satıra şişirerek playback/media lifecycle ile transition UX ownership’i aynı dosyada topladı.

## 3. God-file recovery sonucu

- `use-live-watch-playback.ts` HEAD satır sayısı: `314`
- kötüleşmiş worktree satır sayısı: `491`
- final satır sayısı: `297`
- 491’den azalış: `194`
- HEAD’e göre net fark: `-17`

Hook’tan çıkarılan sorumluluklar:

- overlay mode ownership
- accessibility label ownership
- spinner-only incident ownership
- bounded recovery timeout
- route refresh ownership
- visible transition orchestration

Yeni route-local boundary:

- `use-live-watch-playback.ts` = media/playback signal owner
- `use-live-watch-playback-transition.ts` = spinner/refresh/recovery owner
- `LiveWatchPlaybackController.tsx` = compose-only boundary
- `LiveWatchPlaybackSurface.tsx` = render-only
- `LiveWatchEndedRedirectOwner.tsx` = strict ended redirect owner

## 4. Changed files

- `src/app/(public)/live/[username]/_controllers/use-live-watch-playback.ts`
- `src/app/(public)/live/[username]/_controllers/use-live-watch-playback-transition.ts`
- `src/app/(public)/live/[username]/_controllers/LiveWatchPlaybackController.tsx`
- `src/app/(public)/live/[username]/_controllers/live-watch-controller.tsx`
- `src/app/(public)/live/[username]/_components/LiveWatchPlaybackSurface.tsx`
- `src/app/(public)/live/[username]/_components/LiveWatchEndedRedirectOwner.tsx`
- `src/app/(public)/live/[username]/_components/live-watch-state.tsx`
- `src/app/(public)/live/[username]/_components/live-watch.module.css`
- `docs/live-watch-ended-transition-ux-cleanup-closeout.md`

## 5. Ne yapıldı

- playback hook current active video loss için minimal `requestAnimationFrame` proof ve minimal `liveStatusCheckRequestSequence` sinyali verecek şekilde daraltıldı
- token `not_live` redirect proof yapılmadı; yalnız live branch status-check/cleanup sinyali olarak kullanıldı
- transition ownership yeni `use-live-watch-playback-transition.ts` içine taşındı
- one-shot `router.refresh()` guard transition hook’a taşındı
- hidden tab immediate refresh suppression transition hook’ta tutuldu
- bounded recovery transition hook’ta tutuldu; spinner-only ara state sonsuza kadar takılmıyor
- `LiveWatchPlaybackSurface.tsx` spinner-only ve message overlay render-only yüzeyi olarak bırakıldı
- ended branch copy `Yayın sona erdi / Ana sayfaya dönüyorsun…` olarak korundu
- strict ended branch’te 3 saniye sonra yalnız `router.replace("/")` yapan ayrı owner bırakıldı

## 6. Strict contract

- redirect yalnız strict `view.kind === "ended"` branch mount olduğunda başlar
- `view.kind === "unavailable"` auto redirect almaz
- active/current video loss redirect proof değildir
- token `not_live` redirect proof değildir
- disconnect/degraded redirect proof değildir
- spinner-only ara state görünür yazı taşımaz
- spinner-only ara state erişilebilir label taşır

## 7. No-touch

- `/studio/**`
- DB/schema/migration
- token/grant dosyaları
- realtime chat transport helper’ları
- LiveKit packet protocol
- media geometry / video ratio / object-fit
- top chrome
- shared/global abstraction
- generic hook/util

## 8. Validation

- `git diff --check`: PASS
- `npm run lint`: PASS
- `npm run build`: PASS

Boundary metrics:

- `use-live-watch-playback-transition.ts`: `111` satır
- `LiveWatchPlaybackController.tsx`: `53` satır

Bu close-out sonunda yeni bir god-file riski tespit edilmedi.

## 9. Manual smoke beklentisi

- live video + chat normal çalışır
- publisher stop sonrası stale chat/composer siyah ekran üstünde görünmez
- active/current video loss halinde spinner-only ara state görünür
- spinner-only ara state’te görünür yazı yoktur
- server live dönerse playback/chat normale geri gelir
- live dönmezse bounded recovery neutral degraded message/retry’a döner
- ended copy yalnız strict ended branch’te görünür
- ended branch’te 3 saniye sonra discovery redirect olur
- unavailable auto redirect almaz

## 10. Notes

- `git diff --name-only` untracked dosyaları göstermediği için yeni route-local dosyalar `git status -sb` ile ayrıca doğrulandı.
- Bu close-out compile/scope/ownership cleanup kapanışıdır; gerçek cihaz smoke bu turda command-verified alınmadı.
