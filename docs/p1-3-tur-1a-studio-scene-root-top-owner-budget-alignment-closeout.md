# P1.3 Tur 1A — Studio Scene Root + Top Owner Budget Alignment Close-out

## kısa hüküm

- PASS / KABUL
- Bu close-out yalnız approved publisher `/studio` visible surface içindeki üst owner budget blocker'ını kapatır.
- `X + @username + Hazır/Canlı` üst okuması daha birleşik bir scene-overlay owner budget çizgisine taşındı.

## bu turda ne kapandı

- approved prep truth'unda lifecycle status'u preview içinden çıkarılıp üst chrome ailesinde okutuldu
- preview içindeki ikinci top-edge status adası kaldırıldı
- pre-live ve live durumda üst owner budget skeleton'u ortak kaldı
- üst owner budget'in iki ayrı top band gibi okunması azaltıldı
- media alanının yukarıdan iki ayrı üst referans tarafından yeniyor hissi zayıflatıldı

## scope disiplini korundu mu

- Evet
- Tur 1A dışına çıkılmadı
- Tur 1B alt `Başlat / Bitir` zone'u bu close-out'a alınmadı
- CTA/footer structural blocker kapanmış gibi yazılmadı
- viewer tarafı, behavior/state/continuity ve feature breadth alanları açılmadı

## manual smoke sonucu

- User-provided / manual smoke PASS olarak işlendi; bu sonuç command-verified acceptance değildir
- `Hazır / Canlı` badge üst chrome'da doğru değişiyor
- preview içindeki ikinci top-edge status işareti görünmüyor
- pre-live ve live durumda üst owner budget ortak okunuyor
- pre-live'de `X` ana sayfaya gidiyor
- live'da `X` sonlandırma dialogu açıyor

## command-verified sanity sonucu

- `npm run lint`: PASS
- `npm run build`: PASS

## dürüst kalan açık iş

- Tur 1B açık kalır
- alt `Başlat / Bitir` zone'unun footer CTA gibi okunması bu close-out'ta kapanmadı
- behavior, continuity ve broader publish/read flow alanları bu close-out kapsamında çözülmüş sayılmaz

## changed files

- `docs/p1-3-tur-1a-studio-scene-root-top-owner-budget-alignment-closeout.md`
- `src/app/(studio)/studio/_components/StudioPrepSurface.tsx`
- `src/app/(studio)/studio/_components/StudioPreviewPanel.tsx`
- `src/app/(studio)/studio/_components/studio.module.css`

## commit mesajı

- `studio: close out scene root and top owner budget alignment`

## final worktree durumu

- Selective add ile yalnız Tur 1A dosyaları taşındı
- Scope dışı kirli dosya commit'e alınmadı
- Close-out commit sonrası worktree clean olmalıdır
