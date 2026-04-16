# V1 Admin Queue Minimal — Close-out

## 1. kısa hüküm

- PASS / KABUL
- Bu tur `/auth` içindeki mevcut admin approval foundation üzerinde dar status filtresi ve ordering polish ile kapatıldı.
- `pending_review` action-enabled kaldı; `approved`, `rejected` ve `all` görünümü read-only kaldı.
- Route, panel breadth, dashboard/history ve `/auth` dışı yüzeyler açılmadı.

## 2. scope denetimi

Bu turda kapanan iş:

- `/auth` admin approval queue için `status` search param tabanlı filtreleme
- filter fallback: missing / invalid `status` -> `pending_review`
- filtre seti:
  - `pending_review`
  - `approved`
  - `rejected`
  - `all`
- `pending_review` görünümünde approve / reject aksiyonlarının korunması
- `approved`, `rejected` ve `all` görünümünün read-only kalması
- `all` görünümünde mevcut canonical `status` alanı ile satır status bilgisinin gösterilmesi
- queue empty state metninin seçili filtreye göre ayrılması
- ordering polish:
  - `pending_review` -> `createdAt DESC`
  - `approved` -> `reviewedAt DESC NULLS LAST`, sonra `createdAt DESC`
  - `rejected` -> `reviewedAt DESC NULLS LAST`, sonra `createdAt DESC`
  - `all` -> `updatedAt DESC`, sonra `createdAt DESC`

Bu turda açıkça dışarıda bırakılanlar:

- yeni route
- ayrı admin layout/panel
- dashboard / history / detail drawer
- bulk action
- menu / IA genişletmesi
- `/auth` dışı davranış
- studio behavior değişikliği
- yeni shared/generic admin abstraction

## 3. exact changed files

- `docs/v1-admin-queue-minimal-closeout.md`
- `src/app/(public)/auth/page.tsx`
- `src/app/(public)/auth/_controllers/auth-core-controller.ts`
- `src/app/(public)/auth/_controllers/auth-surface-view.ts`
- `src/app/(public)/auth/_adapters/auth-publisher-application-boundary.ts`
- `src/app/(public)/auth/_components/AdminApprovalPanel.tsx`
- `src/app/(public)/auth/_components/AdminApprovalQueue.tsx`
- `src/app/(public)/auth/_components/AdminApprovalRow.tsx`
- `src/app/(public)/auth/_components/AdminApprovalEmptyState.tsx`
- `src/app/(public)/auth/_components/auth.module.css`
- `src/app/(public)/auth/_lib/auth-copy.ts`

## 4. neden bu dosyalara dokunuldu

- `page.tsx`: yalnız `status` search param wiring için dar seviyede genişletildi.
- `auth-core-controller.ts`: admin branch içinde normalize edilmiş filtre, read-only bilgisi ve filtrelenmiş queue view burada üretildi.
- `auth-surface-view.ts`: admin surface type dar biçimde selected filter + items + read-only + empty/degraded davranışını taşıyacak kadar genişletildi.
- `auth-publisher-application-boundary.ts`: filter-aware read query ve ordering polish burada toplandı; write boundary genişletilmedi.
- `AdminApprovalPanel.tsx`: küçük status filter satırı ve filter-aware render burada bağlandı.
- `AdminApprovalQueue.tsx`: selected filter / read-only bilgisi satırlara buradan taşındı.
- `AdminApprovalRow.tsx`: pending-only action görünürlüğü ve read-only satır davranışı burada ayrıldı; `all` görünümünde status badge bilgisi burada gösterildi.
- `AdminApprovalEmptyState.tsx`: empty copy seçili filtreye göre burada ayrıldı.
- `auth.module.css`: yalnız filter row/tab ve satır içi status badge için dar stiller eklendi.
- `auth-copy.ts`: filter etiketleri, filter-aware empty metinleri ve status label metinleri burada tutuldu.

## 5. ne değişti

- `/auth` admin queue artık `status` search paramı ile okunuyor.
- Missing / invalid `status` geldiğinde `pending_review` fallback çalışıyor.
- `pending_review` görünümünde queue action-enabled kalıyor.
- `approved` görünümünde yalnız onaylanan kayıtlar read-only listeleniyor.
- `rejected` görünümünde yalnız reddedilen kayıtlar read-only listeleniyor.
- `all` görünümünde canonical üç status birlikte read-only listeleniyor.
- `all` görünümünde her satırda küçük status bilgisi gösteriliyor.
- Ordering polish sonrası:
  - en yeni bekleyen kayıt bekleyen sekmesinde üstte görünüyor
  - en son onaylanan kayıt approved sekmesinde üstte görünüyor
  - en son reddedilen kayıt rejected sekmesinde üstte görünüyor
  - `reviewed_at = NULL` legacy kayıtlar `approved` / `rejected` listesinde üste yapışmıyor

## 6. command-verified sanity

- `npm run lint`: PASS
- `npm run build`: PASS
- App route summary:
  - `/` -> `ƒ`
  - `/auth` -> `ƒ`
  - `/live/[username]` -> `ƒ`
  - `/studio` -> `ƒ`

## 7. operator-verified manual smoke

- admin `/auth` görünümünde filter satırı açıldı
- `pending_review` görünümünde approve / reject butonları görünmeye devam etti
- `approved` görünümünde liste read-only kaldı
- `rejected` görünümünde liste read-only kaldı
- `all` görünümünde status badge göründü ve liste read-only kaldı
- invalid / missing `status` için `pending_review` fallback davranışı gözlendi
- `testmerve` ve `testnecla` approve akışı sonrası approved sekmesinde doğru göründü
- `testwetpolly` ve `testpoly` reject akışı sonrası rejected sekmesinde doğru göründü
- `reviewed_at NULL` legacy rejected kayıt ordering bug'ı mini follow-up ile düzeldi
- rejected publisher surface doğru kaldı
- approved publisher surface doğru kaldı
- mobile `/auth` ve mobile `all` görüntüsü layout kırmadan çalıştı

Not:
- bu bölüm operator/manual smoke truth'unu taşır
- command-verified acceptance değildir

## 8. diff özeti

- changed files count: `11`
- worktree code değişikliği: `10` auth-route-local dosya
- close-out doc ile birlikte toplam stage set: `11` dosya
- auth admin queue işi `/auth` route-local sınırda tutuldu; `/auth` dışı dosya açılmadı

## 9. risk / remaining unknown

- local database'te `reviewed_at NULL` legacy kayıtlar bulundu; query `NULLS LAST` ile güvenli hale getirildi
- bu tur mevcut local data ile doğrulandı; farklı legacy veri kombinasyonları için ayrıca geniş acceptance turu yapılmadı
- `all` görünümü read-only tutuldu; bu turda ayrıca reviewer/reviewed-at/history breadth'i açılmadı

## 10. bilerek açılmayan alanlar

- dashboard / history / detail drawer
- bulk action
- reviewed-at / reviewer görünümü
- notes / reason paneli
- yeni admin route veya ayrı admin layout
- menu / IA genişletmesi
- `/auth` dışı davranış değişikliği
- studio behavior değişikliği

## 11. commit message

- `auth: add minimal admin queue filters and ordering polish`

## 12. son karar

- PASS / KABUL
- V1 Admin Queue Minimal bu close-out ile tek parça kapatılabilir.
