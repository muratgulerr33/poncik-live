# P1.3 Tur 4B — Studio Live Exit Confirm + Single Primary Lifecycle CTA Close-out

## 1. kısa hüküm

- PASS / KABUL
- P1.3 Tur 4B batch'i tek close-out altında kapatıldı.
- Bu batch yalnız `/studio` fullscreen scene içinde live-state exit confirm davranışını ekledi ve lifecycle action yüzeyini düşük riskle tek primary CTA çizgisine sadeleştirdi.

## 2. scope içinde ne kapandı

- `/studio` fullscreen scene içinde live-state exit confirm
- idle iken `X -> /`
- live iken `X -> Canlıyı durdur?` dialog
- `Hayır` ile sahnede kalma
- `Evet` ile mevcut stop hattına bağlanma
- stop success sonrası `/` çıkışı
- stop failure sonrası dialog kapanıp sahnede kalma ve mevcut error/lifecycle truth'unu koruma
- stop pending sırasında ikinci tetiklemeyi engelleme
- lifecycle actions yüzeyini düşük riskle tek primary CTA çizgisine sadeleştirme

## 3. exact changed files

- `docs/p1-3-tur-4b-studio-live-exit-confirm-single-primary-cta-closeout.md`
- `src/app/(studio)/studio/_components/studio-route-shell.tsx`
- `src/app/(studio)/studio/_components/StudioShell.tsx`
- `src/app/(studio)/studio/_components/StudioPrepSurface.tsx`
- `src/app/(studio)/studio/_components/StudioPreviewPanel.tsx`
- `src/app/(studio)/studio/_components/StudioLifecycleActions.tsx`
- `src/app/(studio)/studio/_components/studio.module.css`
- `src/app/(studio)/studio/_components/useStudioPublishFoundation.ts`
- `src/app/(studio)/studio/_components/studio-exit-confirm-dialog.tsx`
- `src/app/(studio)/studio/_lib/studio-copy.ts`

## 4. neden bu dosyalara dokunuldu

- `studio-route-shell.tsx` 4A'da yalnız düz `X -> /` taşıyordu; live state exit confirm için route-local close hook'u burada gerekiyordu.
- `StudioShell.tsx` approved prep ile gate sahnesini ayırıyordu; exit confirm yalnız approved prep/live yüzeyine bağlanacak şekilde burada yeniden dağıtıldı.
- `StudioPrepSurface.tsx` approved prep scene owner'ı olarak dialog state, close intent ve success sonrası `/` çıkışını taşıdı.
- `StudioPreviewPanel.tsx` publish foundation'ı doğrudan tüketiyordu; shell'e yalnız dar exit-control surface çıkarmak için açıldı.
- `StudioLifecycleActions.tsx` mevcut state matrisi büyümeden tek primary CTA'ya sadeleşebilecek kadar dardı.
- `useStudioPublishFoundation.ts` stop success/fail sonucunu shell'e güvenli taşımadığı için minimal result surface burada eklendi.
- `studio-exit-confirm-dialog.tsx` global modal açmadan route-local confirm yüzeyi tutmak için eklendi.
- `studio.module.css` dialog, disabled close ve tek CTA ritmi için dar stil alanını taşıdı.
- `studio-copy.ts` dialog copy'sini inline bırakmamak için açıldı.

## 5. ne değişti

- approved prep scene içinde `X`, live değilken doğrudan `/` çıkışına devam ediyor
- approved prep scene live durumdaysa `X` route-local confirm dialog açıyor
- dialog copy'si `studio-copy.ts` içinden geliyor:
  - `Canlıyı durdur?`
  - `Evet`
  - `Hayır`
- `Hayır` dialogu kapatıyor ve kullanıcıyı sahnede bırakıyor
- `Evet` mevcut `stopPublishing()` hattını kullanıyor
- stop pending başladıktan sonra:
  - dialog aksiyonları disabled oluyor
  - `X` tekrar tetiklenmiyor
  - ikinci `stopPublishing()` çağrısı engelleniyor
- stop başarılıysa route `/`e gidiyor
- stop başarısızsa dialog kapanıyor, kullanıcı sahnede kalıyor ve mevcut `lifecycleMessage` görünür kalıyor
- `StudioLifecycleActions` yüzeyi tek primary CTA çizgisine sadeleşti:
  - start tarafında `Başlat`
  - stop tarafında `Bitir`
  - pending label'ları korunuyor

## 6. manuel smoke özeti

- PASS
- idle durumda `X` doğrudan `/`e gidiyor
- live durumda `X` confirm dialog açıyor
- `Hayır` sahnede bırakıyor
- `Evet` sonrası discovery'ye çıkış gerçekleşiyor
- logout iken `/studio` doğru şekilde `/auth?next=/studio` redirect veriyor
- mobil cihazdan izleyici watch fullscreen overlay ve studio fullscreen overlay birlikte sağlıklı çalıştı
- tek CTA `Başlat / Bitir` akışı 3-4 tur test edildi
- `Başlat` sonrası yaklaşık 1-2 saniye içinde canlı state'e geçiliyor
- `Bitir` sonrası tekrar `Başlat` state'ine dönüyor
- diğer yüzeylerde regresyon gözlenmedi

Not:
- bu bölüm user-provided manual smoke truth'unu taşır
- `pagehide / live exit semantics çözüldü` denmiyor
- bu alan bu turda freeze edilmedi

## 7. command-verified sanity

- `npm run lint`: PASS
- `npm run build`: PASS
- hafif route sanity:
  - `/` -> `200`
  - `/auth` -> `200`
  - `/live/test-user` -> `200`
  - `/studio` -> `307`, hedef `/auth?next=/studio`

## 8. bilerek dışarıda bırakılanlar

- `pagehide / live exit` semantics redesign
- provider/token/api hattı değişikliği
- viewer count
- analytics
- V2/V3 alanları
- global modal/dialog sistemi
- studio genel redesign
- permission flow rewrite

## 9. remaining unknown

- approved prep/live state interactive doğrulama bu close-out turunda command-verified olarak alınmadı; mevcut ortamda `/studio` unauthenticated durumda `/auth?next=/studio` redirect verdi
- manual smoke ile doğrulanan live confirm ve tek CTA davranışları close-out'a işlendi, ancak bunlar command-verified acceptance değildir
- `pagehide / live exit` sözleşmesi bu turda yeniden tanımlanmadı ve freeze edilmedi
