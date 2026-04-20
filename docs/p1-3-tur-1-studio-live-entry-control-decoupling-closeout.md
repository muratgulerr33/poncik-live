# Poncik Live — Tur 1 Close-out

## Kısa hüküm

Tur 1 seam implementation close-out'u write-set içinde tutuldu. Bu belge global başarı beyanı değildir; yalnız Tur 1 seam acceptance close-out'udur.

## Tur adı ve exact seam amacı

- Tur adı: `Tur 1 — Studio Live Entry Control Decoupling`
- Exact seam amacı:
  - start control'ü live-stop owner'ından ayırmak
  - pre-live state'te tek güçlü entry control bırakmak
  - actual live anında bu control'ün persistent bottom `Bitir`a dönüşmesini engellemek
  - live end owner'ını `X` → confirm → `Bitir` / `Vazgeç` zincirinde bırakmak
  - bottom zone'u future composer lane olarak boş bırakmak

## Changed files

- `docs/p1-3-tur-1-studio-live-entry-control-decoupling-closeout.md`
- `src/app/(studio)/studio/_components/StudioPreviewPanel.tsx`
- `src/app/(studio)/studio/_components/StudioLifecycleActions.tsx`
- `src/app/(studio)/studio/_lib/studio-copy.ts`

## Her dosyada ne değişti

- `src/app/(studio)/studio/_components/StudioPreviewPanel.tsx`
  - Entry action render kararları `effectiveLifecycleKind` tabanlı kuruldu.
  - Healthy pre-live state'te tek güçlü `Başlat` entry control bırakıldı.
  - Pending sırasında ikinci tetik route-local second-trigger block ile engellendi.
  - Actual live anında entry control scene alt alanından çekildi.
  - Persistent bottom `Bitir` üretilmedi.
  - Live end owner'ı render'dan çıkarılmadı; `requestStopForExit: stopPublishing` ile `X` → confirm zincirinde bırakıldı.
- `src/app/(studio)/studio/_components/StudioLifecycleActions.tsx`
  - `StudioLifecycleActions` artık entry-only owner'dır.
  - Live-stop owner render'dan çıkarılmıştır.
  - Bileşen yalnız `Başlat` / `Başlatılıyor` primary action'ını taşır.
- `src/app/(studio)/studio/_lib/studio-copy.ts`
  - Confirm metinleri `Bitir` / `Vazgeç` olarak hizalanmıştır.
- `docs/p1-3-tur-1-studio-live-entry-control-decoupling-closeout.md`
  - Tur 1 seam close-out'u drift-safe olarak kayda alındı.

## Write-set dışına çıkılmadığı doğrulaması

- Edit edilen implementation dosyaları write-set içinde kaldı:
  - `src/app/(studio)/studio/_components/StudioPreviewPanel.tsx`
  - `src/app/(studio)/studio/_components/StudioLifecycleActions.tsx`
  - `src/app/(studio)/studio/_lib/studio-copy.ts`
- Close-out için eklenen tek yeni dosya:
  - `docs/p1-3-tur-1-studio-live-entry-control-decoupling-closeout.md`
- Write-set dışı implementation dosyasında değişiklik yapılmadı.

## `StudioLifecycleActions` tek callsite doğrulaması

- Repo search doğrulaması:
  - `src/app/(studio)/studio/_components/StudioPreviewPanel.tsx`
- `StudioPreviewPanel.tsx` dışında ikinci callsite görülmedi.

## `npm run lint` sonucu

- Close-out turunda yeniden çalıştırıldı.
- Sonuç: geçti.

## `npm run build` sonucu

- Close-out turunda yeniden çalıştırıldı.
- Sonuç: geçti.

## Manual/görsel smoke özeti

- approved publisher ile `/studio` açıldı
- healthy preview state doğrulandı
- alt alanda tek güçlü `Başlat` doğrulandı
- `Başlat` sonrası ikinci tetik mümkün olmadı
- actual live anında persistent bottom `Bitir` görünmedi
- `X` ile confirm açıldı
- confirm butonları `Bitir` / `Vazgeç` olarak doğrulandı
- `Bitir` sonrası discovery/home dönüşü doğrulandı

## Tur 1 seam acceptance sorusu

Approved + healthy preview state’te kullanıcı yalnız tek `Başlat` entry control görüp onu ikinci kez tetikleyemiyor, actual live anında bu control persistent bottom `Bitir`a dönüşmeden scene alt alanından çekiliyor ve live end yalnız `X` → confirm → `Bitir` / `Vazgeç` zinciriyle mi kalıyor?

## Tur 1 seam acceptance cevabı

PASS

## Acceptance sınırı

Bu close-out global başarı değildir. Yalnız Tur 1 seam acceptance olarak kaydedilmiştir.
