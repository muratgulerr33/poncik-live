# P1.3 M1 — Studio Media-Root Tightening Close-out

## kısa hüküm

- PASS / KABUL
- bu close-out yalnız M1 structural media-root tightening içindir
- M2 action owner contract açık kalır
- top owner/chrome alanı açılmadı

## scope içinde ne kapandı

- healthy `preview_ready` visible path'te media-root budget tightening
- media frame'in dikey/visible budget'inin güçlenmesi
- card/panel-alt-bölüm hissinin zayıflatılması
- yalnız structural reading iyileştirmesi

## scope disiplini korundu mu

- evet
- hard whitelist dışına çıkılmadı
- action owner alanı açılmadı
- top owner/chrome alanı açılmadı
- behavior/continuity/support/viewer breadth açılmadı

## exact changed files

- `docs/p1-3-m1-studio-media-root-tightening-closeout.md`
- `src/app/(studio)/studio/_components/studio.module.css`

## neden yalnız bu dosyalar değişti

- `studio.module.css` içinde healthy subtree için media-root budget sıkılaştırıldı
- başka dosyada markup split veya owner redistribution yapılmadı
- close-out dosyası kapanış kaydı için eklendi

## user-provided visual smoke özeti

- `Hazır` ve `Canlı` yüzeylerinde media önceye göre daha baskın/dominant okunuyor
- dikey budget yükselmiş görünüyor
- CTA hâlâ sibling owner gibi duruyor; bu bilinçli olarak M2'ye bırakıldı
- dialog regression gözlenmiyor
- bu bölüm command-verified acceptance değildir

## command-verified sanity

- `npm run lint`: PASS
- `npm run build`: PASS

## dürüst teknik sınır

- runtime acceptance iddiası yok
- behavior acceptance yok
- real mobile acceptance yok
- MacBook kare kamera nedeniyle üst/alt boşluklar tek başına blocker gibi yazılmayacak
- `media artık tam root oldu` denmeyecek
- doğru dil:
  - media önceye göre ana yüzeye daha yakın ve daha dominant okunuyor

## remaining open truth

- M2 action owner contract açık
- gerekirse sonra top owner/chrome re-bind ayrı tur olur

## commit message

- `studio: close out m1 media-root tightening`

## final worktree durumu

- selective add ile yalnız scope içi dosyalar taşındı
- push sonrası worktree temiz bırakıldı
