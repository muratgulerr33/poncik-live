# V1 Lifecycle Hardening + Discovery Freshness Close-out

## 1. Kisa hukum

Bu is kapandi. Repo current `main`, `broadcasts.status` server truth'unu koruyarak studio close-stop best-effort hardening ve discovery freshness guncellemesini tasiyor.

## 2. Scope denetimi

Korunanlar:
- `broadcasts.status` tek server truth olarak kaldi
- explicit `Baslat / Bitir` zinciri korundu
- watch/studio route-local freshness cizgisi korundu
- public watch auth gate'e donmedi

Bu close-out icinde kalanlar:
- orphan-live riskini daraltan best-effort studio close-stop hardening
- browser-close / tab-close stale live riskini daraltma
- discovery ana sayfada refreshsiz canli/kapali donus freshness fix'i

Bilerek disarida kalanlar:
- hidden-tab stop
- schema genislemesi
- provider degisimi
- auth split
- admin breadth
- payment / minute / 1v1
- chat
- viewer count persistence
- discovery redesign
- secure mobile acceptance

## 3. Dogrulanan teknik cikti

- `pagehide` primary close-path olarak kullanildi; browser-close / tab-close davranisi best-effort hardening olarak kaldı
- tiny internal stop route eklendi: `/api/studio/lifecycle/stop`
- stop write current approved publisher session uzerinden dogrulaniyor
- stop path idempotent `stopped / noop` semantiğinde
- discovery tarafina route-local visible-only freshness eklendi
- studio publish tarafinda one-shot close-stop guard var; explicit stop sonrasi ikinci stop write tetiklenmiyor

## 4. Command-verified sanity

- `npm run lint`: PASS
- `npm run build`: PASS
- build output'ta `/api/studio/lifecycle/stop` route goruldu
- `/`: `200`
- `/auth`: `200`
- `/live/test-user`: `200`
- anonymous `/studio`: `307 -> /auth?next=/studio`

## 5. Operator-verified smoke

- discovery karti 3 izleyici yuzeyinde refreshsiz canliya dustu
- yayin bitince tum izleyicilerde 1-3 saniye araliginda sona erdi
- tekrar baslat / tekrar bitir zinciri calisti
- sekme gizleme yayin akisina bozucu etki uretmedi
- yayinci sekmesi kapatilinca tum izleyicilerde yayin sona erdi
- tekrar girip baslatinca izleyiciler yeniden eszamanli izledi
- tab kapatma sonrasi yayin hemen sona erdi

## 6. Changed files / diff ozeti

Implementation surface:
- `src/app/(public)/_components/discovery-freshness.tsx`
- `src/app/(public)/_controllers/discovery-controller.tsx`
- `src/app/(studio)/studio/_actions/studio-lifecycle-actions.ts`
- `src/app/(studio)/studio/_adapters/studio-broadcast-stop-adapter.ts`
- `src/app/(studio)/studio/_adapters/studio-lifecycle-client-adapter.ts`
- `src/app/(studio)/studio/_adapters/studio-livekit-publisher-adapter.ts`
- `src/app/(studio)/studio/_components/useStudioPublishFoundation.ts`
- `src/app/api/studio/lifecycle/stop/route.ts`

Owner-rule note:
- `next.config.ts` sabit LAN IP tasimaz
- development origin listesi local `.env.local` icindeki `DEV_ALLOWED_ORIGINS` ile yonetilir
- bu degerin degismesi tracked config churn uretmemelidir

## 7. Durust sinirlar / follow-up

- browser-close / tab-close stop davranisi best-effort olarak harden edildi; garantili stop dili kullanilmiyor
- hidden-tab stop acilmadi
- discovery freshness route-local kaldi
- schema genisletilmedi
- non-blocking gozlem: aktif yayin acikken devtools network'te duzenli cift istek goruluyor
  - local `/studio?_rsc=...`
  - LiveKit Cloud `/settings/regions`
- bu gozlemin exact kok sebebi bu close-out icinde kapanmis truth olarak yazilmiyor; sonrasi icin performans/traffic gozlemi olarak kaldi

## 8. Ana pencere merge notu

- V1 Lifecycle Hardening + Discovery Freshness scope'u current `main` uzerinde yer aliyor
- orphan-live stale state riski daraltildi
- discovery ana sayfa canli/kapali donusleri client refreshsiz yakinliyor
- owner rule: LAN/dev origin degeri tracked `next.config.ts` icine sabit yazilmaz; local `.env.local` icindeki `DEV_ALLOWED_ORIGINS` ile yonetilir
- bu close-out secure mobile acceptance PASS notu degildir
