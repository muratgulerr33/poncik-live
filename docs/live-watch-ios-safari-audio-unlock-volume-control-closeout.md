# Live Watch iOS Safari Audio Unlock Volume Control Close-Out

## Kısa hüküm

- PASS.
- Spinner kaldırılmadı.
- Unified transition overlay contract korundu.
- Video settled olunca overlay doğru kapanıyor.
- Audio autoplay blocked olursa volume ikon kapalı state ile refreshsiz unlock yapıyor.

## Root cause

- İlk problem: iOS/Safari audio autoplay policy nedeniyle ses unlock gerekebilmesi.
- Follow-up problem: audio/video fiilen oynarken unified spinner overlay'in settle olmaması.
- Final çözüm: audio unlock volume control üzerinden; media settled reconciliation video element truth ile güçlendirildi.

## Changed files

- `src/app/(public)/live/[username]/_adapters/live-watch-provider-adapter.ts`
- `src/app/(public)/live/[username]/_components/live-watch-audio-control-context.tsx`
- `src/app/(public)/live/[username]/_components/live-watch-route-shell.tsx`
- `src/app/(public)/live/[username]/_controllers/use-live-watch-playback-transition.ts`
- `src/app/(public)/live/[username]/_controllers/use-live-watch-playback.ts`
- `docs/live-watch-ios-safari-audio-unlock-volume-control-closeout.md`

## Implementation summary

- `room.startAudio()` + `audioElement.play()` volume icon user gesture path'ine bağlandı.
- `isUserMuted` ve `isAudioBlocked` ayrıldı.
- Icon muted truth ile media element muted truth ayrıldı.
- Video settled helper eklendi.
- `playing`, `loadeddata`, `canplay`, `timeupdate`, `resize` eventleriyle positive video settle reconciliation eklendi.
- Transition recovery sequence media settled sonrası kapanacak şekilde düzeltildi.
- Audio unlock hattı ve spinner contract birlikte korundu.

## Spinner contract

- Spinner/unified overlay kaldırılmadı.
- Refresh/reconnect/current video loss/media-not-ready geçişlerinde overlay hâlâ tek transition katmanı.
- Video settled olduğunda overlay kalkar.
- Chat/composer overlay üstüne çıkmaz.

## Manual runtime validation

- iPhone 16 Pro/Safari simulator:
  - ilk girişte spinner kısa geçişten sonra kapanıyor
  - volume ikon kapalı state'te geliyor
  - volume ikonuna dokununca ses refreshsiz açılıyor
  - çık/gir davranışı doğru
  - refresh fallback'e takılmıyor
  - 10–15 kez ses aç/kapat state ters düşürmedi
- Redmi kaynak -> MacBook izleyici:
  - davranış bozulmadı
- Redmi kaynak -> Redmi izleyici:
  - video/ses davranışı bozulmadı
  - volume kapat/aç çalışıyor
  - refresh bozulmuyor
- Yayın sonlandırma:
  - iPhone ve Redmi izleyici aynı anda `yayın sonlandı / anasayfaya yönlendiriliyorsunuz` akışını gördü
  - anasayfaya yönlendirme çalıştı

## Static validation

- `git diff --check`
- `npm run lint`
- `npm run build`

## Red flag / follow-up debt

- `src/app/(public)/live/[username]/_controllers/use-live-watch-playback.ts` şu anda yaklaşık 523 satırdır; mevcut ölçüm 522 satırdır.
- Bu dosya kırmızı bayrak / follow-up debt olarak işaretlenmelidir.
- Bu close-out turunda refactor yapılmayacak.
- Sonraki ayrı turda route-local sorumluluk ayrımı audit edilmelidir.
- Ancak bu turda çalışan audio unlock + transition settle davranışı bozulmamalıdır.

## Non-scope / no-touch

- Studio yok.
- auth/gate yok.
- DB/API/migration yok.
- V2/V3 yok.
- generic shared/ui yok.
- top chrome CSS değişikliği yok.
- spinner feature kaldırılmadı.

## Resmi kaynak hiyerarşisine göre doğrulama özeti

- Browser/runtime primary truth:
  - WebKit/Safari autoplay behavior
  - Chromium/Chrome autoplay behavior
- Web platform truth:
  - HTML media element play promise / muted / autoplay behavior
  - video settled truth: `paused === false`, `currentTime` advancing, yeterli `readyState`, render edilmiş video boyutları
- Provider helper:
  - LiveKit `RoomEvent.AudioPlaybackStatusChanged`
  - LiveKit `room.canPlaybackAudio`
  - LiveKit `room.startAudio()`
- Follow-up ölçüm kanıtı:
  - `video.readyState = 4`
  - `video.paused = false`
  - `video.currentTime` artıyor
  - `video.srcObject = true`
  - `video.videoWidth/videoHeight > 0`
  - `audio.readyState = 4`
  - `audio.paused = false`
  - `audio.muted = false`
  - `audio.currentTime` artıyor
  - volume ikon aktif ve `aria-label="Sesi kapat"`
  - overlay görünür kalıyordu
- Sonuç:
  - `video/audio playing + overlay visible = transition settle mismatch`
  - Bu follow-up audio unlock redesign değildir.
  - Spinner kaldırılmadı; yalnız media settled olduğunda doğru kapanması sağlandı.

## Known caveat

- Browser policy nedeniyle sesli autoplay her cihazda garanti edilemez.
- Garanti edilen şey: video mümkünse gösterilir, ses bloklanırsa refreshsiz volume ikon dokunuşuyla recover edilir.
- Audio blocked icon state'i media element muted truth'u değildir; media element mute truth'u yalnız user mute state'idir.

## Commit message

- `live: unlock audio and settle watch transition`
