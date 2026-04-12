# PR-5 Publisher Register + Application + Status Surfaces + Minimal Support Slot — Close-out

## 1) Kısa hüküm

- PASS / KABUL
- PR-5 historical close-out zinciri, PR-5A ve PR-5B truth'unu tek dokümanda toplar.

## 2) Scope denetimi

PR-5 birleşik scope'u şu iki dar alt turda kapanmıştır:

### PR-5A

- `/auth` tek route korunarak publisher register açıldı
- publisher account creation açıldı
- publisher application auto-create açıldı
- `publisher_applications.status = pending_review` çizgisi kuruldu
- dar logout sticky-notice fix kapatıldı

### PR-5B

- authenticated publisher için status surfaces açıldı:
  - `pending_review`
  - `approved`
  - `rejected`
  - dar `missing/degraded` fallback
- minimal support slot canonical çizgide eklendi

Bilerek dışarıda bırakılanlar:
- PR-6 admin approval UI / approval actions
- PR-7 studio gate / prep / publish behavior
- support form
- Tawk
- support route
- ticket flow
- correction / resubmit / self-edit UX
- password reset
- auth subroute
- `/live/[username]` auth gating
- V2 / V3 alanları

## 3) Doğrulanan teknik çıktı

### PR-5A

- `/auth` içinde publisher register açıldı
- publisher register exact alanları eklendi:
  - ad soyad
  - kullanıcı adı
  - telefon
  - e-posta
  - şifre
- publisher account create çalıştı
- publisher application auto-create çalıştı
- `status = pending_review` yazıldı
- session create çalıştı
- duplicate publisher protection doğrulandı
- user register yanlışlıkla publisher'a dönmedi
- sticky sign-out notice bug'ı dar component boundary fix'i ile kapatıldı

### PR-5B

- publisher status truth artık `registered=publisher` query paramından değil:
  - authenticated publisher session
  - `publisher_applications.status`
  üzerinden çözülüyor
- `pending_review` yüzeyi bekle / keşfe dön ana yönünü koruyor; support secondary only
- `approved` yüzeyi bilgi + `/studio` yönü veriyor; auto redirect, gate ve publish behavior açmıyor
- `rejected` yüzeyi no self-edit / no resubmit çizgisinde kalıyor; support tiny primary fallback olabilir
- `missing/degraded` durumda dar fallback gösteriliyor; workflow derinleşmiyor
- publisher-specific render generic session panelden ayrılarak route-local küçük component'lere bölündü

## 4) Sanity sonuçları

### command-verified

- `npm run lint`: PASS
- `npm run build`: PASS
- `/`: `200`
- `/auth`: `200`
- `/live/test-user`: `200`
- `/studio`: `200`

### operator-verified / local manual smoke

- user register DB truth doğru
- publisher register DB truth doğru
- `role_type = publisher`
- `status = pending_review`
- duplicate publisher protection çalıştı
- logout DB/session invalidation çalıştı
- sticky logout notice regression kapandı
- anonymous auth view korundu
- normal user session generic current session panelde kaldı
- `pending_review` doğrulandı
- `approved` doğrulandı
- `rejected` doğrulandı
- `?registered=publisher` approved durumu bozmadı
- `missing` fallback doğrulandı
- `degraded` fallback ayrıca manuel üretilmedi; küçük unknown olarak kaldı

## 5) Diff özeti

### PR-5A

- changed files count: `20`
- shortstat yaklaşık: `823 insertions`, `160 deletions`

### PR-5B

- changed files count: `13`
- shortstat yaklaşık: `390 insertions`, `47 deletions`
- schema değişikliği yok
- file-size disiplini korundu

## 6) Risk / unknown

- `degraded` fallback final close-out pass içinde ayrıca manuel üretilmedi
- support slot intentionally tiny kaldı; concrete external contact target eklenmedi
- bloklayıcı kalan risk raporlanmadı

## 7) Son karar

- PR-5 birleşik close-out kararı: PASS
- `/auth` tek route çizgisi korundu
- shared login, user register ve publisher register korundu
- publisher application auto-create açıldı
- publisher approval truth `/auth` içinde status surfaces olarak çözüldü
- status truth query paramdan değil session + application status üzerinden okunur hale geldi
- support minimal ve canonical dağılımda kaldı
- `/live/[username]` public kaldı
- `/studio` behavior bu close-out içinde açılmadı
