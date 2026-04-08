# PR-5A Publisher Register Close-out

## Amaç

PR-5A, `/auth` altında tek route auth sistemini koruyarak şunları ekler:
- publisher register
- publisher account creation
- publisher application auto-create
- minimum schema align
- PR-4 auth/session continuity koruması
- dar logout sticky-notice UI fix

Public watch davranışı korunur. `/live/[username]` auth gate yemez.

## Scope denetimi

Bu PR yalnız `/auth` içindeki publisher register zincirini ve minimum approval-record temelini kapsar.

Bilerek dışarıda bırakılanlar:
- full `pending_review / approved / rejected` status surfaces
- support/Tawk slot
- admin approval UI
- `/studio` prep/publish behavior
- watch gating
- password reset
- yeni auth subroute
- PR-5B / PR-6 / PR-7 alanları

## Teknik çıktı

- `/auth` tek route olarak kaldı.
- shared login korundu.
- user register korundu.
- aynı auth shell içinde publisher register modu eklendi.
- publisher register exact alanları eklendi:
  - ad soyad
  - kullanıcı adı
  - telefon
  - e-posta
  - şifre
- başarılı publisher register sonrası:
  - `accounts.role_type = publisher`
  - `publisher_applications.status = pending_review`
  - publisher application auto-create
  - session create
- `publisher_applications` minimum schema align ile `full_name`, `phone` ve `account_id` unique doğrultusunda genişletildi.
- register orchestration, session adapter’ını büyütmeden route-local boundary dosyalarına ayrıldı.
- sticky `Çıkış tamamlanamadı` UI izi, sign-out action state’ini dar current-session component boundary’sine alarak kapatıldı.

## Sanity sonuçları

### command-verified now

- `npm run lint`: PASS
- `npm run build`: PASS
- HTTP 200:
  - `/`
  - `/auth`
  - `/live/test-user`
  - `/studio`
- `/auth` HTML kanıtı:
  - `Kullanıcı kaydı`
  - `Yayıncı kaydı`
  - ayrı `Admin giriş` CTA yok
  - `şifremi unuttum` yok

### runtime/manual evidence in this PR cycle

- user register DB truth:
  - en güncel user kayıt örneği: `usercheck1`
  - `role_type = user`
  - `account_status = active`
- publisher register DB truth:
  - en güncel publisher kayıt örneği: `aletta-test-publisher`
  - `role_type = publisher`
  - `status = pending_review`
  - `full_name` ve `phone` kaydı oluştu
- duplicate publisher protection manual sanity’de doğrulandı
- logout DB/session invalidation manual sanity’de doğrulandı
- sticky logout notice regression:
  - sign-out state isolate edildi
  - logout/login döngüsünde eski çıkış hata notu kalıcı görünmüyor

## Diff özeti

- PR-5A changed files count: `20`
- staged diff: `817 insertions`, `160 deletions`
- en çok büyüyen dosyalar:
  - `auth-publisher-register-boundary.ts`
  - `auth-user-register-boundary.ts`
  - `PublisherRegisterForm.tsx`
  - `CurrentSessionPanel.tsx`
- auth route-local sınır korundu
- shell/controller/component/adapter split çizgisi korundu
- mevcut boyutlarda kritik god file kalmadı

## Local runtime/env notu

- `.env.local` local runtime için kullanıldı ve commitlenmeyecek.
- local PostgreSQL host port: `5437`
- local smoke için Docker/PostgreSQL runtime bağımlılığı kullanıldı
- repo içine yalnız schema/code hizası yazıldı; local runtime state commit setine dahil değildir

## Commit / push / worktree notu

- exact commit hash ve push doğrusu final close-out raporunda verilir
- intended commit set yalnız PR-5A auth/schema/doc dosyalarından oluşur
- `.env.local`, Docker runtime state ve geçici smoke kalıntıları commitlenmez

## Bilerek yapılmayanlar

- PR-5B status surfaces
- minimal support slot
- admin approval
- `/studio` approval gate/publish behavior
- watch gating
- password reset

## Follow-up notları

- sıradaki canonical iş: `PR-5B — Status Surfaces + Minimal Support Slot cleanup`
- local runtime korunacaksa `.env.local` ve `5437` postgres çizgisi aynı kalmalı
