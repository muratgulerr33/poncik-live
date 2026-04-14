# P1.3 Tur 4A — Studio Fullscreen Shell + Cleanup + Permission-in-scene Close-out

## 1. kısa hüküm

- PASS / KABUL
- P1.3 Tur 4A batch'i tek close-out altında kapatıldı.
- Bu batch yalnız `/studio` route'unu fullscreen-first creator scene çizgisine taşıdı ve prep-page gürültüsünü route-local düzeyde sadeleştirdi.

## 2. scope içinde ne kapandı

- `/studio` için fullscreen-first creator shell
- route-local `X -> /` görünür çıkış davranışı
- approved prep truth'unda varsa `@username`
- approved prep truth'unda dar status indicator
- büyük prep-page hero/gürültü cleanup
- preview / permission / lifecycle alanını aynı scene ailesinde sadeleştirme
- duplicate username / duplicate lifecycle bilgisini kaldırma
- permission notice/fallback'i scene içinde daha doğal yere alma

## 3. exact changed files

- `docs/p1-3-tur-4a-studio-fullscreen-shell-cleanup-permission-in-scene-closeout.md`
- `src/app/(studio)/studio/_components/StudioShell.tsx`
- `src/app/(studio)/studio/_components/StudioPrepSurface.tsx`
- `src/app/(studio)/studio/_components/StudioPreviewPanel.tsx`
- `src/app/(studio)/studio/_components/StudioPermissionNotice.tsx`
- `src/app/(studio)/studio/_components/studio.module.css`
- `src/app/(studio)/studio/_components/studio-route-shell.tsx`
- `src/app/(studio)/studio/_lib/studio-copy.ts`

## 4. neden bu turda bu dosyalara dokunuldu

- `StudioShell.tsx` mevcut hero-led prep page katmanını taşıyordu; fullscreen-first creator scene hissi burada bozuluyordu.
- `StudioPrepSurface.tsx` prep açıklaması ve meta yükünü stage'in üstünde taşıyordu.
- `StudioPreviewPanel.tsx` preview header içinde username ve lifecycle bilgisini ikinci kez gösteriyordu.
- `StudioPermissionNotice.tsx` scene içinde daha doğal konumlanacak hook'u taşımıyordu.
- `studio.module.css` prep page düzenini ve alt kart hissini taşıyordu; fullscreen-first shell için ana stil işi burada çözüldü.
- `studio-route-shell.tsx` route-local görünür chrome'u ayırmak için eklendi.
- `studio-copy.ts` yalnız stage'i aşağı iten prep/permission teknik açıklamalarını daraltmak için açıldı.

## 5. ne değişti

- büyük hero/title/description katmanı kaldırıldı
- yeni route-local studio shell eklendi
- görünür `X` eklendi ve `/` çıkışına bağlandı
- approved prep truth'unda `@username` ve dar status indicator üst chrome'a taşındı
- preview sahnesi stage merkezli hale getirildi
- permission notice / retry / lifecycle alanı aynı scene ailesinde toplandı
- preview içindeki duplicate username ve duplicate lifecycle bilgisi kaldırıldı
- prep teknik açıklamaları ve permission kopyası daraltıldı

## 6. manuel smoke özeti

- PASS
- yayında değilken `X` doğrudan discovery `/` çıkışını veriyor
- yayındayken `X` orphan live bırakıyor; bu 4A bug gibi değil, bilinçli olarak Tur 4B alanı olarak not edildi
- sıfır permission state ile açıldığında browser/native permission prompt studio scene üstünde görünür şekilde açılıyor
- fullscreen-first creator scene hissi alındı
- duplicate username / duplicate lifecycle görünümü kalktı
- diğer yüzeyler bozulmadı

Not:
- `X` canlı yayını durdurur diye yazılmıyor
- live exit semantics bu close-out'ta çözülmüş sayılmıyor
- live exit semantics Tur 4B alanıdır

## 7. command-verified sanity

- `npm run lint`: PASS
- `npm run build`: PASS
- hafif route sanity:
  - `/` -> `200`
  - `/auth` -> `200`
  - `/live/test-user` -> `200`
  - `/studio` -> `307`, hedef `/auth?next=/studio`

## 8. bilerek dışarıda bırakılanlar

- live state `X` confirm dialog
- canlıyı durdurup çıkma semantiği
- single primary CTA dönüşümü
- lifecycle semantics redesign
- viewer count
- V2/V3 alanları
- provider/token/hook hattı değişikliği
- `StudioGateSurface.tsx`

## 9. remaining unknown

- approved prep fullscreen scene bu close-out turunda command-verified runtime ile doğrulanmadı; mevcut ortamda `/studio` unauthenticated durumda `/auth?next=/studio` redirect verdi
- manuel smoke ile doğrulanan `X`, duplicate cleanup ve permission prompt hissi close-out'a işlendi, ancak bunlar command-verified acceptance değildir
- live exit semantics bu turda freeze edilmedi; Tur 4B alanı olarak açık bırakıldı
