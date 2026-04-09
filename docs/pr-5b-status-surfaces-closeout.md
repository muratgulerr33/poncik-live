# PR-5B Status Surfaces Close-out

## Amaç

PR-5B, `/auth` tek route yapısını koruyarak authenticated publisher için approval status yüzeylerini ekler:
- `pending_review`
- `approved`
- `rejected`
- dar `missing/degraded` fallback

Bu PR ayrıca canonical dağılıma uygun minimal support slot cleanup’ını yapar.

## Scope denetimi

Bu PR yalnız `/auth` içindeki publisher status read/render işini kapsar.

Korunanlar:
- shared login
- user register
- publisher register
- current session read
- sign in / sign out
- public watch
- `/studio` davranışı

Bilerek dışarıda bırakılanlar:
- PR-6 admin approval
- PR-7 studio gate / prep / publish behavior
- support form / Tawk / ticket flow / support route
- self-edit / resubmit / correction UX
- password reset
- auth subroute

## Teknik çıktı

- Publisher status surface kararı artık `registered=publisher` query paramına değil, authenticated publisher session + `publisher_applications.status` truth’una dayanır.
- `registered=publisher` yalnız küçük continuity hint olarak kalır.
- `pending_review` yüzeyi bekle / keşfe dön ana yönünü korur; support secondary only.
- `approved` yüzeyi bilgi + `/studio` yönü verir; auto redirect, gate ve publish behavior eklemez.
- `rejected` yüzeyi no self-edit / no resubmit çizgisinde kalır; support tiny primary fallback olabilir.
- `missing/degraded` durumda dar fallback gösterilir; workflow derinleşmez.
- Publisher-specific render, generic session chrome’dan ayrılarak küçük route-local component’lere bölündü.

## Sanity sonuçları

### command-verified now

- `npm run lint`: PASS
- `npm run build`: PASS
- HTTP 200:
  - `/`
  - `/auth`
  - `/live/test-user`
  - `/studio`
- anonymous auth view korundu:
  - `Giriş yap`
  - `Kullanıcı kaydı`
  - `Yayıncı kaydı`
  - ayrı `Admin giriş` CTA yok
  - `şifremi unuttum` yok

### runtime/manual evidence in this close-out pass

- normal user session:
  - current session görünür
  - publisher status yüzeyi açılmaz
- authenticated publisher + `pending_review`:
  - `Başvurun alındı`
  - `Keşfe dön`
  - support görünür
- authenticated publisher + `approved`:
  - `Onay tamamlandı`
  - `Stüdyoya git`
  - support görünmez
- authenticated publisher + `rejected`:
  - `Başvurun kabul edilmedi`
  - support görünür
  - resubmit dili yok
- query param truth check:
  - `?registered=publisher` ile `approved` durumda pending yüzeyi zorlanmadı
- `missing` fallback bu close-out turunda tekrar doğrulandı:
  - dar fallback görünüyor
  - support görünmüyor

## Diff özeti

- changed files count: `13`
- staged diff: `388 insertions`, `47 deletions`
- intended PR-5B değişikliği auth route-local + tek close-out doc ile sınırlı
- schema değişikliği yok
- status surface/split ile file-size disiplini korundu

## Local runtime/env notu

- `.env.local` local runtime için kullanıldı ve commitlenmeyecek
- local PostgreSQL host port: `5437`
- runtime sanity aynı local DB üstünden doğrulandı

## Follow-up notları

- sıradaki canonical iş: `PR-6 — Admin approval minimal`
