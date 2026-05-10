# 04-database-canonical.md

## 1) Amaç

Bu doküman, Poncik Live için kanonik veritabanı omurgasını tanımlar.

Amaç:
- V1 core veritabanı modelini dar ve net tutmak
- V2 extension ailelerini V1’den temiz ayırmak
- role, account status ve approval truth’unu birbirine karıştırmamak
- implementation detayını kanonik truth gibi yazmamak

Bu doküman:
- migration dosyası değildir
- SQL dokümanı değildir
- Drizzle schema çıktısı değildir
- implementation detay rehberi değildir

Ama V1/V2 database yönü için ana referanstır.

V2 active 1v1 note:
- Current repo schema bugün hâlâ V1 core aileleriyle sınırlı olabilir.
- Bu dokümandaki V2 extension aileleri conceptual/canonical direction’dır.
- Exact Drizzle fields, migrations, enum names, constraints ve API karşılıkları hâlâ freeze değildir.
- V2 active 1v1 planning zinciri `call_requests` / `call_sessions`, minute ledger ve publisher earning’i ayrı aileler olarak tutar.
- `broadcasts` dar public lifecycle kalır; içine 1v1/payment/chat/earning state girmez.

---

## 2) Single-role doctrine

Poncik Live V1/V2’de single-role modeli kullanır.

Kurallar:
- her account yalnız tek role taşır
- `user`, `publisher`, `admin` birbirini dışlar
- multi-role canonical model yoktur
- `account_roles` canonical modelde yoktur

### Neden single-role?

Çünkü bu proje V1/V2’de dar, sade ve güvenli kalmalıdır.

Multi-role model:
- gereksiz join mantığı açar
- role precedence yorumları üretir
- approval ile role’ü karıştırma riskini büyütür
- bugünkü scope için gereksiz karmaşıklık getirir

### Ayrı truth katmanları

Aşağıdaki üç alan ayrı truth olarak korunur:
- `account_status`
- `role_type`
- `publisher_applications.status`

Bunlar aynı şey değildir.

### Ayrımın anlamı

- `role_type` = account’ın tekil kategori/rol bilgisi
- `account_status` = account’ın sistemsel erişim/durum katmanı
- `publisher_applications.status` = publisher approval/review katmanı

Önemli ayrım:
- `accounts.role_type = publisher` başka şeydir
- `publisher_applications.status = approved` başka şeydir

Yani publisher account rejected olabilir ve yayın açamaz.
Publish yetkisi yalnız `approved` ile açılır.

---

## 3) V1 core tablo aileleri

### `accounts`

**Amaç:**
Tek account omurgasını taşır.

**Tutar:**
- e-posta
- kullanıcı adı
- şifre hash’i
- `account_status`
- `role_type`
- temel zaman damgaları
- opsiyonel son giriş zamanı

**Özellikle tutmaz:**
- approval state
- cover image seçimi
- canlı yayın lifecycle’ı
- payment/minute alanları
- geniş profil blob’ları

---

### `auth_sessions`

**Amaç:**
Server-side session ailesini taşır.

**Tutar:**
- `account_id`
- session token/hash referansı
- session durumu
- son görülme zamanı
- expire zamanı
- temel zaman damgaları

**Özellikle tutmaz:**
- approval truth
- canlı yayın truth’u
- publisher settings
- geniş device analytics

Not:
Bu tablo ailesi canonical modelin parçasıdır.
Ama exact session policy ayrıca netleşir.

---

### `publisher_applications`

**Amaç:**
Publisher register sonrası otomatik oluşan review kaydını taşır.

**Tutar:**
- `account_id`
- ad soyad
- telefon
- `status`
- `reviewed_by_account_id`
- `reviewed_at`
- opsiyonel review notu
- temel zaman damgaları

**Status seti:**
- `pending_review`
- `approved`
- `rejected`

**Özellikle tutmaz:**
- `Tümü`
- self-edit
- self-resubmit
- ikinci başvuru akışı
- generic JSON onboarding kovası

Not:
`Tümü` yalnız admin filtresidir.
Publish yetkisi yalnız `approved` ile açılır.

---

### `cover_images`

**Amaç:**
Admin tarafından ön tanımlanmış kapak görseli kataloğunu taşır.

**Tutar:**
- teknik anahtar/slug
- başlık
- asset referansı
- aktif/pasif bilgisi
- sıralama
- temel zaman damgaları

**Özellikle tutmaz:**
- user upload
- avatar mantığı
- approval state
- geniş metadata kalabalığı

Not:
Publisher kendi görselini upload etmez.
Kapak görseli admin tarafından ön tanımlanır ve seçilir.

---

### `publisher_settings`

**Amaç:**
Publisher’a ait çok dar ayar yüzeyini taşır.

**Tutar:**
- `account_id`
- `cover_image_id`
- temel zaman damgaları

**Özellikle tutmaz:**
- bio
- links
- description
- preferences blob
- random JSON
- random flags
- sosyal/growth alanları
- provider/media payload’ları

Not:
`publisher_settings` junk drawer olmaz.
V1/V2’de pratikte `cover_image_id` merkezlidir.

---

### `broadcasts`

**Amaç:**
Gerçek canlı yayın lifecycle kaydını taşır.

**Tutar:**
- `publisher_account_id`
- broadcast status
- `started_at`
- `ended_at`
- temel zaman damgaları

**Özellikle tutmaz:**
- prep/preview UI state
- viewer count persistence
- join/leave izi
- katılımcı listesi
- chat
- 1v1
- payment
- moderation breadth
- sosyal alanlar

Not:
Gerçek broadcast kaydı start sonrası oluşur.
Prep/preview UI state’i DB truth’u değildir.
Current repo schema implementation truth’tur.
Conceptual direction ayrı olabilir; exact schema freeze değildir.

---

## 4) V2 extension aileleri

Aşağıdaki aileler V2’ye aittir.
V1 core’a dahil değildir.
V1’e sızmaz.

### Payment / minute ailesi

- `minute_packages`
- `minute_orders`
- `bank_transfer_orders`
- `minute_wallets`
- `minute_ledger_entries`

Bu aile:
- paket
- sipariş
- ödeme alt kaydı
- bakiye özeti
- ledger geçmişi
alanlarını taşır.

V1 broadcast çekirdeğine gömülmez.

### Paid 1v1 / call ailesi

- `call_requests`
- `call_sessions`

Bu aile paid 1v1 çekirdeğini taşır.
V1 `broadcasts` modeli hibritleşmez.
V2 geldiğinde yeni aile olarak eklenir.

### V1’i bozmadan nasıl eklenir?

Çünkü V1 core yalnız şunları bilir:
- account
- session
- publisher approval
- cover image
- broadcast

V2 geldiğinde bunun üstüne yalnız yeni aileler eklenir:
- payment/minute
- call/request/session

Bu yüzden V2 tabloları V1 core’un anlamını değiştirmez.

---

## 5) Hard rules

- multi-role yoktur
- `account_roles` yoktur
- DB’de `room` dili yoktur
- `publisher_settings` junk drawer olmaz
- `broadcasts` dar lifecycle tablosudur
- prep/preview DB’ye yazılmaz
- viewer count persistence yoktur
- discovery kartında viewer count yoktur
- JSON ana truth değildir
- V2 tabloları V1 core’a sızmaz

Ek notlar:
- `publisher_settings` V1/V2’de pratikte `cover_image_id` merkezlidir
- `broadcasts` içinde chat, 1v1, payment, join/leave, katılımcı listesi tutulmaz
- `media_session_ref` gibi nötr teknik entegrasyon alanı olabilir

---

## 6) Açık ama blocker olmayan implementation alanları

Aşağıdakiler implementation seviyesidir:
- exact migration
- exact Drizzle field isimleri
- exact enum detayları
- exact constraint detayları
- exact auth/session policy

Bunlar daha sonra netleşir.
Bugünkü canonical DB yönünü bozmaz.

---

## 7) Kısa hüküm

Bu database omurgası dar, güvenli ve genişlemeye uygundur.

Çünkü:
- V1 core küçük tutulur
- V2 extension aileleri ayrı kalır
- role, account status ve approval birbirine karışmaz
- gereksiz multi-role ve `room` dili geri sokulmaz
- `publisher_settings` ve `broadcasts` scope’u dar tutulur

Bu da bakım kolaylığı, güvenli değişiklik ve sonraki genişleme için temiz bir temel sağlar.
