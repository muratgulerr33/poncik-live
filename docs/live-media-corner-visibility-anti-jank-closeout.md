# Live Media Corner Visibility Anti-Jank Close-out

## 1. Kisa hukum

`PASS WITH NOTES`

Live `/live/[username]` first visible frame radius/corner anti-jank kapandi.

Owner manual smoke: `PASS`.

Settled screenshot, refresh ve discovery-entry visual evidence mevcut.

Studio dosyalari untouched kaldi. Studio radius parity ayri follow-up kapsamidir.

## 2. Scope

Bu close-out yalniz Live `/live/[username]` media corner visibility anti-jank isidir.

Kapsam:

- `/live/[username]`
- radius/corner visibility micro-polish
- first visible frame anti-jank
- no real layout gap
- no media geometry change

Kapsam disi:

- Studio radius parity
- Studio implementation
- top chrome
- chat/comment/login
- Start CTA
- LiveKit transport
- DB
- shared/global abstraction

## 3. Changed files

Yalniz locked iki file degisti:

- `src/app/(public)/live/[username]/_components/useLiveWatchMediaPolish.ts`
- `src/app/(public)/live/[username]/_components/live-watch-media-polish.module.css`

## 4. Preserved contracts

- `object-fit: cover` bozulmadi.
- `safe-contain` bozulmadi.
- source-ratio policy bozulmadi.
- `transform: none` bozulmadi.
- frame/video olcusu degismedi.
- crop behavior degismedi.
- top chrome untouched.
- chat/comment/login untouched.
- Start CTA untouched.
- Studio untouched.
- new file yok.

## 5. Implementation summary

- polish readiness daha erken hazirlaniyor.
- metadata gec kalirsa conservative full-stage polish uygulanir.
- metadata gelince gercek source-ratio hesabı tekrar uygulanir.
- pending video-hide guard eklendi.
- mask/rim treatment guclendirildi.
- geometry degistirilmedi.

## 6. Owner visual evidence

- Redmi viewer + Redmi source screenshots.
- iPhone SE simulator viewer + Redmi source screenshot.
- iPhone 16 Pro simulator viewer + Redmi source screenshot.
- logged-in user live screenshot.
- Owner refresh'i 2 kez test etti.
- Owner publisher cards/discovery entry'i 2 kez test etti.
- Owner gozlemi: "jank yok, polishsiz/radiussuz ilk frame acilmiyor".

## 7. Validation

- `git diff --check`: PASS
- `npm run lint`: PASS
- `npm run build`: PASS

## 8. Notes

- Terminal ortaminda manual first-frame smoke yapilamadi; owner device smoke ile dogrulandi.
- Slow-motion/frame-by-frame kayit olmadigi icin close-out `PASS WITH NOTES` kalir.
- Studio radius parity bu close-out kapsaminda tamamlandi denmeyecek.
