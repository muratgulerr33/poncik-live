# Live Watch Mobile Media Geometry Parity Close-out

## 1. Short verdict

`PASS WITH NOTES`

Bu close-out yalnız `/live/[username]` active live media geometry parity kapsamını kapatır.

Global Live Watch redesign PASS değildir.

## 2. Scope

Bu close-out şunları kapsar:

- `/live/[username]` active live media geometry parity
- Studio publisher mobile media scene ile Live viewer mobile active media scene arasında media presentation parity
- mobile portrait viewer scene budget düzeltmesi
- source ratio ve contain-preserving behavior korunması
- owner/manual visual smoke evidence

Bu close-out şunları kapsamaz:

- global `/live/[username]` redesign
- chat / DB / realtime / LiveKit data channel
- viewer controls
- ended/unavailable redesign
- camera switcher
- `/studio` değişikliği
- shared/global abstraction

## 3. Changed file

Yalnız şu source file değişti:

- `src/app/(public)/live/[username]/_components/live-watch.module.css`

## 4. What changed

Mobile portrait branch içinde Live viewer scene budget parent zinciri route-local olarak düzeltildi.

Değişen/etkilenen selector ailesi:

- `.page`
- `.shell`
- `.chrome`
- `.contentStack`
- `.frame`
- `.mediaStage`
- `.playbackVideo`

Amaç:

- `/live/[username]` mobile portrait active live viewer surface’i card/frame/min-height bütçesinden çıkarıp viewport-bounded scene budget mantığına yaklaştırmak
- Studio publisher mobile media scene ile Live viewer mobile media presentation parity sağlamak
- viewer medyayı scrollsuz, source ratio bozulmadan ve deform olmadan göstermek

## 5. Why this was needed

Önceki evidence şunu gösterdi:

- sorun camera/source ratio değildi
- `object-fit: contain` root cause değildi
- yalnız `.playbackVideo` scale düzeltmesi yeterli değildi
- console evidence parent scene/frame budget farkını kanıtladı
- Live viewer surface, Studio publisher surface’e göre daha kısa card/frame budget içinde kalıyordu

Bu nedenle mobile portrait path’te parent scene budget zinciri route-local olarak düzeltildi.

## 6. Studio parity

`/studio` mobile portrait contract yeniden açılmadı.

Studio’daki mobile portrait media presentation davranışı referans alındı; Live viewer route-local CSS içinde parity hedeflendi.

Studio publisher controls viewer’a taşınmadı.

## 7. Preserved / no-touch areas

Korunan alanlar:

- `/studio` untouched
- TSX untouched
- LiveKit untouched
- DB untouched
- realtime/chat untouched
- camera switcher untouched
- shared/global abstraction yok
- publisher controls viewer’a taşınmadı
- ended/unavailable redesign yapılmadı

## 8. Media safety

Korunan media güvenliği:

- source ratio korundu
- `object-fit: contain` korundu
- `object-position: center` korundu
- `object-fit: cover` kullanılmadı
- crop yok
- stretch/deform yok
- source ratio hardcode yok
- `480x640`, `3/4`, `4/3` gibi kaynak-özel kural yok
- `!important` yok

## 9. Owner/manual evidence

Owner/manual smoke:

- Gerçek Redmi Note 11 Pro `/live/[username]` viewer ile gerçek Redmi Note 11 Pro `/studio` publisher side-by-side kıyas PASS
- Evidence: `final-redmi-note-11-pro-live-username-vs-studio-live.png`
- MacBook Chrome iPhone 14 Pro responsive `/live/[username]` smoke PASS
- iOS/iPhone 14 Pro benzeri responsive viewer görünümü hizalı smoke edildi ve PASS kabul edildi
- Desktop genişliklerde owner-smoke kabul edilebilir:
  - ekran dışına taşma yok
  - aşırı büyük/küçük media yok
  - source ratio bozulmadan geniş ekrana kontrollü ölçekleniyor
  - genişledikçe doğal siyah letterbox oluşuyor
  - video aspect ratio bozulmuyor

## 10. Desktop note

Desktop owner-smoke acceptable.

Desktop için ileride küçük polish gerekebilir; bu close-out blocker değildir.

Bu close-out desktop global polish kapanışı değildir.

## 11. Ended/unavailable note

Ended/unavailable redesign yapılmadı.

Ended/unavailable quick regression Codex tarafından verified PASS olarak yazılmayacak.

`ended/unavailable quick regression remains non-blocking unknown / recommended smoke`

Bu, active live media geometry parity close-out için blocker değildir.

## 12. Remaining risks / unknowns

Dürüst kalan risk/unknown listesi:

- ended/unavailable verified PASS değilse unknown
- farklı Android cihazlar unknown
- gerçek iOS/Safari device behavior future smoke olabilir
- future viewer chat/history/composer ayrı contract ister
- desktop future polish gerekebilir
- bu global Live Watch UI PASS değildir

## 13. Validation

- `npm run lint`: PASS
- `npm run build`: PASS
- `commit hash`: close-out commit metadata içinde kayıtlı
- `push sonucu`: close-out push adımı sonrası repository metadata içinde kayıtlı
- `final worktree status`: close-out git akışı sonrası doğrulanacak
