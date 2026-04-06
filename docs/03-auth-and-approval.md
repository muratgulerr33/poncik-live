# 03-auth-and-approval.md

## 1) Amaç

Bu doküman, Poncik Live içindeki auth ve publisher approval omurgasını tek yerde tutar.

Amaç:
- auth route truth’unu korumak
- user ve publisher akışını ayırmak
- approval mantığını sade tutmak
- watch ile gate ayrımını karıştırmamak
- support ve reset fallback çizgisini scope büyütmeden tanımlamak

Bu doküman yalnız merge edilmiş canonical truth’u taşır.

---

## 2) Auth omurgası

### Auth route

- `/auth` tek auth route’tur
- auth alt route çoğaltılmaz

### Login

- shared login formu vardır
- `user`, `publisher`, `admin` aynı login giriş yüzeyini kullanır
- admin ayrı auth sistemi kullanmaz
- auth içinde ayrı `Admin giriş` CTA’sı yoktur

### Role modeli

V1/V2’de single-role modeli kullanılır.

Kurallar:
- her account yalnız tek role taşır
- `user`, `publisher`, `admin` birbirini dışlar
- multi-role yoktur
- role precedence yoktur
- role chooser yoktur

---

## 3) User akışı

### User register

User register alanları:
- e-posta
- kullanıcı adı
- şifre

### User login

User, shared login formu üzerinden giriş yapar.

### Neden sade tutulur

User tarafı en düşük sürtünmeli giriş kapısıdır.
Bu yüzden:
- ad soyad zorunlu değildir
- telefon istenmez
- ekstra profil tamamlama hop’u açılmaz

---

## 4) Publisher akışı

### Publisher register

Publisher register alanları:
- ad soyad
- kullanıcı adı
- telefon
- e-posta
- şifre

### Otomatik başvuru

Publisher register sonrası başvuru otomatik oluşur.
Ayrı ikinci başvuru formu veya ayrı hop açılmaz.

### Approval mantığı

Publisher approval matrisi:
- `pending_review`
- `approved`
- `rejected`

`Tümü` backend statüsü değildir; yalnız admin UI filtresidir.

### Publish yetkisi

Publisher account ile publish yetkisi aynı şey değildir.

Kurallar:
- publisher account register ile oluşur
- publish yetkisi yalnız `approved` ile açılır
- `pending_review` ve `rejected` publish açamaz

---

## 5) Approval durumları

### `pending_review`

Ürün anlamı:
- başvuru alınmıştır
- inceleme beklenmektedir
- publish yetkisi henüz açık değildir

Ana yön:
- bekle
- keşfe dön

Destek burada yalnız ikincil yardım yoludur.

### `approved`

Ürün anlamı:
- publisher approval tamamlanmıştır
- publish yetkisi açılmıştır
- publisher `/studio` akışına girebilir

### `rejected`

Ürün anlamı:
- başvuru kabul edilmemiştir
- publish yetkisi açılmaz
- self-edit ve self-resubmit yoktur

Bu durumda destek ana fallback olabilir.

---

## 6) Watch vs gate ayrımı

### V1 watch

- V1’de guest ve user canlı yayını izleyebilir
- V1 watch akışında auth duvarı yoktur
- izlemek için login zorunlu değildir

### V2 gate

- V2’de 1v1 için login zorunludur
- V2’de 1v1 için dakika / bakiye kontrolü zorunludur

### Neden ayrı tutulur

İzleme ile ücretli/kişisel etkileşim aynı gate altında düşünülmez.
Bu ayrım:
- V1’i dar tutar
- watch surface’i sade tutar
- ileride gate policy değişirse büyük refactor riskini azaltır

---

## 7) Support / password reset notu

### Support

Support çekirdek büyük feature değildir.
Çok hafif fallback yolu olarak düşünülür.

Kurallar:
- `pending_review` içinde ikincil yardım yolu olabilir
- `rejected` yüzeyinde ana fallback olabilir
- yanlış telefon / e-posta / kayıt bilgisi düzeltme yüzeylerinde ana fallback olabilir

### Password reset

Password reset kullanıcıya görünen self-service feature değildir.

Kurallar:
- auth ekranında görünür yüzey olarak açılmaz
- kullanıcıya `şifremi unuttum` ürünü sunulmaz
- yalnız manuel operasyon fallback’i olarak ilerler

### Tek cihaz policy

Ürün kuralı:
- `last login wins`

Aynı cihazdaki tab davranışı implementation detayıdır.

---

## 8) Kısa hüküm

Bu auth omurgası bilinçli olarak sade tutulur:
- tek `/auth`
- shared login
- single-role model
- user ve publisher için ayrı register alanları
- dar approval matrisi
- public watch ile gated interaction ayrımı
- hafif support fallback
- görünmeyen operasyonel reset çizgisi

Bu çizgi V1’i gereksiz büyütmeden auth ve approval tarafını kontrollü tutar.

Future note olarak, V3’te süreye bağlı auth wall düşünülebilir. Bu bugünkü V1/V2 feature’ı değildir.

