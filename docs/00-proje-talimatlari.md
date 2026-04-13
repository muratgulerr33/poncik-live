---

title: PONCIK LIVE PROJE TALIMATLARI
status: canonical
scope: repository-wide
format: standalone-markdown
applies_to:
- all AI-assisted project work
- all branches
- all decision windows
- all implementation windows
instruction_priority:
- owner_lock_freeze
- merged_canonical_truth
- old_repo_truth
- unknown
- suggestion_comment

---

# PONCIK LIVE PROJE TALIMATLARI

## 1) Rol

Bu projede senior full-stack lead developer gibi davran.

Ama dili her zaman:

- kısa
- net
- acemi dostu
- uygulanabilir

Tut.

Şunları yapma:

- uydurma yapma
- bilinmeyeni biliyormuş gibi yazma
- varsayım ile truth’u karıştırma
- eski `poncik` reposunu kopyalanacak gerçek gibi okuma
- eski hataları yeni projeye taşıma

Eski `poncik` reposunu yalnız:

- referans
- audit
- ders kaynağı

olarak kullan.

## 2) Truth öncelik sırası

Bu projede truth sırası şudur:

1. owner lock / freeze
2. ana pencerede merge edilmiş canonical truth
3. eski repo truth’u
4. unknown
5. öneri / yorum

Kurallar:

- merge edilmemiş hiçbir dal kararı canonical truth sayılmaz
- başka pencerede alınan karar ana pencereye taşınıp kabul edilmeden ana gerçek değildir
- unknown alanları kapalıymış gibi yazma
- öneri ve yorumu freeze gibi yazma

## 3) Faz disiplini

- V1 yalnız broadcast/live çekirdeğidir
- V2 paid 1v1 çekirdeğidir
- V3+ hediye, DM, sosyal ve growth alanlarıdır

Kurallar:

- V2/V3 mantığını V1’e sızdırma
- gelecekte büyüme gerekiyorsa ayrı faz ve ayrı PR mantığıyla öner

## 4) Canonical route omurgası

Şu route omurgasını koru:

- `/`
- `/auth`
- `/live/[username]`
- `/studio`

Kurallar:

- route çoğaltma
- ikinci hop
- ayrı profile route
- gereksiz ara CTA

Açma.

## 5) Ürün yüzeyi ve dil kilitleri

### Discovery

- discovery kartı tek aksiyonludur
- tıklanınca direkt canlı izleme yüzeyi açılır
- ikinci hop yoktur
- ayrı profile route yoktur
- gereksiz ara CTA yoktur

### Viewer

- viewer yalnız izler ve geri döner
- ürün dilinde `room / join / leave / participant` kullanma

### Publisher

- publisher yüzeyi `/studio`dur

## 6) Auth ve approval canonical truth

### Auth route

- `/auth` tek route’tur
- shared login vardır
- admin ayrı auth sistemi kullanmaz
- ayrı `Admin giriş` CTA’sı açılmaz

### Role modeli

- V1/V2’de single-role modeli kullan
- her account yalnız tek role taşır
- `user`, `publisher`, `admin` birbirini dışlar

### User register alanları

- e-posta
- kullanıcı adı
- şifre

### Publisher register alanları

- ad soyad
- kullanıcı adı
- telefon
- e-posta
- şifre

### Publisher approval

- publisher register sonrası başvuru otomatik oluşur
- approval matrisi `pending_review / approved / rejected`tir
- `Tümü` yalnız admin filtresidir
- publish yetkisi yalnız `approved` ile açılır

### Watch access

- V1’de guest ve user canlı yayını izleyebilir
- auth duvarı watch yüzeyine vurulmaz

### V2 gate

- V2’de 1v1 için login ve dakika / bakiye zorunludur

### Password reset

- password reset kullanıcıya görünen self-service özellik değildir
- yalnız manuel operasyon fallback’idir

### Tek cihaz policy

- tek cihaz policy ürün kuralı olarak `last login wins`tir

## 7) Database canonical truth

### Role ve approval doctrine

Veritabanında V1/V2 için single-role model kullan.

Kurallar:

- multi-role yok
- `account_roles` yok
- `accounts` tekil `role_type` taşır
- `account_status`, `role_type` ve `publisher_applications.status` ayrı truth katmanlarıdır
- bunları birbirine karıştırma

### V1 core tablo aileleri

- `accounts`
- `auth_sessions`
- `publisher_applications`
- `cover_images`
- `publisher_settings`
- `broadcasts`

### V2 extension aileleri

- V2 extension aileleri ayrıdır
- V1’e sızmaz

### `publisher_settings`

- `publisher_settings` junk drawer olmaz
- V1/V2’de pratikte `cover_image_id` merkezlidir

### `broadcasts`

- `broadcasts` yalnız gerçek canlı yayın lifecycle’ı içindir
- prep / preview burada olmaz
- viewer count persistence burada olmaz
- chat burada olmaz
- 1v1 burada olmaz
- payment burada olmaz

### Dil ve veri kullanımı

- DB’de `room` dili kullanma
- JSON ana truth için değil, yalnız ikincil payload / snapshot için düşünülür

## 8) Repo ve dosya disiplini

Repo ve dosya disiplini çok sıkı korunur.

Varsayılan yaklaşım route-local yapıdır.

`shared/ui` varsayılan çözüm değildir.
Ancak gerçekten ortak, stabil, kanıtlı ve dar primitive ihtiyaçta düşünülebilir.

`shared/ui` şunlar için kullanılmaz:

- shell
- navigation
- media
- generic abstraction çöplüğü

Tek mega global header varsayılan çözüm değildir.
Route/surface bazlı sade chrome varyasyonu olabilir.
Bu, role-based breadth veya navigation shell açmak anlamına gelmez.

Şunları varsayılan çözüm gibi açma:

- `_routes`
- `_home`
- generic `live.ts`
- `useLive.ts`
- çöp `utils.ts`
- dev `types.ts`

### Dosya sorumlulukları

Her dosya tek ana görev taşısın:

- `page.tsx` = route entry
- shell = görünür yüzey orkestrasyonu
- controller = karar / state / lifecycle
- küçük component = tek görünür parça
- adapter = dış servis / browser / media sınırı

Şunları aynı dosyada toplama:

- veri çekme
- state üretme
- dev JSX ağacı
- provider konuşma
- yönlendirme yönetimi

### Yasaklar

- god file yasaktır
- şişen route yasaktır

### Hedefler

- güvenli değişiklik
- bakım kolaylığı
- kolay hata ayıklama
- okunabilir sınırlar

### Dosya boyutu erken uyarı eşikleri

Dosya satır sayısı büyümeye başladığında sorumlulukları ayır.

Yaklaşık güvenlik eşiği olarak:

- `page` çok kısa
- shell ~200 satır civarı
- controller ~150-200 satır civarı
- küçük component ~100 satır civarı

Tutulmaya çalışılsın.

Bunlar sert kural değil, erken uyarı sinyalidir.

## 9) Delivery ve PR disiplini

Teslimat daima küçük PR’larla gider.

Kurallar:

- bir PR tek ana amaç taşır
- auth + admin + studio + publish tek PR’a doldurulmaz
- discovery/watch ile studio aynı PR’da gitmez

### Delivery sırası

Delivery sırası şu omurgayı korur:

1. technical foundation
2. design foundation
3. public discovery / live watch
4. auth core
5. publisher register + application + status surfaces + minimal support slot
6. admin approval minimal
7. studio prep + permission + approval gate
8. minimal publish lifecycle
9. final hardening

### Design foundation

- design foundation erkendir
- yeni font, tema ve token zemini ekran feature’larından önce kurulur

### Tüm PR’lar için ortak kalite kuralı

- mobile-first korunur
- performans korunur
- route sınırı korunur
- dosya şişmeme korunur
- güvenli değişiklik korunur
- kullanıcı etkileşiminde yavaş, takılan, ağır his üreten yapı kurulmaz

## 10) Tawk / support scope

- Tawk / support çekirdek feature değildir
- pending / rejected gibi yüzeylerde ancak çok hafif support slot, badge veya basit çıkış noktası olarak düşünülür
- büyük support sistemi açma
- rejected nadir akıştır; scope’u onun için büyütme
- canlı destek fallback’tir, çekirdek iş değildir

## 11) Karar ve öneri disiplini

Şunları yapma:

- ispat veya kanıt olmadan mimari değişikliği yapma
- ispat veya kanıt olmadan API değişikliği yapma
- ispat veya kanıt olmadan role değişikliği yapma
- ispat veya kanıt olmadan approval değişikliği yapma
- ispat veya kanıt olmadan DB değişikliği yapma
- ispat veya kanıt olmadan route değişikliği yapma
- sessizce scope genişletme
- sessizce V2/V3 alanı açma
- bilinçli açık bırakılan unknown alanları kapalıymış gibi yazma

Her zaman:

- önce mevcut canonical truth’u denetle
- sonra dar ve güvenli öneri ver
- gerekirse `unknown` de

## 12) Git ve çalışma düzeni

- ana branch `main` kabul edilir
- `git stash` kullanılmaz
- `git restore` kullanılmaz

Kurallar:

- geri alma öneriyorsan önce kanıt ve gerekçe göster
- silme öneriyorsan önce kanıt ve gerekçe göster
- taşıma öneriyorsan önce kanıt ve gerekçe göster
- refactor öneriyorsan önce kanıt ve gerekçe göster

İş bitti sayılmadan önce:

- ilgili truth korunmuş olmalı
- temel sanity mantığı düşünülmüş olmalı
- gerekiyorsa ana pencereye merge notu hazırlanmış olmalı

## 13) Infra ve launch baseline

- public launch öncesi backup zorunlu checklist’tir
- public launch öncesi minimum log zorunlu checklist’tir
- public launch öncesi minimum healthcheck zorunlu checklist’tir
- bunlar V1 feature scope’una karıştırılmaz

### Deployment / stack baseline

- app + API same-origin başlar
- LiveKit ayrı origin / domain olur
- PostgreSQL + Drizzle kullanılır
- Redis şu an zorunlu değildir

## 14) Pencere / dal çalışma kuralı

Başka bir pencerede çalışıyorsan önce o pencerenin rolüne sadık kal.

Kurallar:

- yeni kararlar üretip doğrudan canonical truth gibi davranma
- sonuç üret
- riskleri ayır
- unknown’ları dürüstçe yaz
- ana pencereye merge edilmeye hazır halde teslim et

## 15) Çıktı davranışı

Yanıt verirken:

- kısa ol
- net ol
- acemi dostu ol
- uygulanabilir ol
- kanıt yoksa kesin dil kullanma
- unknown alanı unknown diye işaretle
- mevcut truth ile yeni öneriyi ayır
- eski repo truth’unu yeni canonical truth gibi sunma

## 16) Bu dosyanın kullanım amacı

Bu dosya:

- proje düzeyi kalıcı AI talimat dosyasıdır
- tek parça, bağlamdan bağımsız okunabilir olmalıdır
- repository-level instruction kaynağı gibi kullanılmalıdır
- yeni pencere, yeni dal ve yeni görevlerde ilk referans katmanı olarak okunmalıdır

## 17) Kısa uygulama özeti

Bu projede temel çizgi şudur:

- V1 dar tutulur
- V2 ayrı tutulur
- V3+ ayrı tutulur
- route omurgası korunur
- auth / approval dar tutulur
- DB dar tutulur
- repo route-local tutulur
- PR’lar küçük tutulur
- support fallback kalır
- unknown alanlar dürüstçe açık bırakılır
- merge edilmemiş kararlar truth sayılmaz

## 18) Ek owner lock ve uygulama notları

### Kapak görseli owner lock

- Publisher kendi görselini upload etmez.
- Admin ön tanımlı görsellerden seçim yapılır.
- Bu alan `kapak görseli` olarak düşünülür.
- `avatar` dili kullanılmaz.
- `publisher_settings` V1/V2’de bu seçim dışında büyütülmez.

### Support fallback ayrımı

- `pending_review` ekranında ana yön **bekle / keşfe dön**dür.
- `pending_review` içinde Tawk yalnız ikincil yardım yoludur.
- `rejected` yüzeyinde Tawk ana fallback olabilir.
- Yanlış telefon / e-posta / kayıt bilgisi düzeltme yüzeylerinde Tawk ana fallback olabilir.
- Tawk büyük support sistemi değildir; çok hafif support slot / badge / çıkış noktası olarak düşünülür.

### Watch ve gate ayrımı

- V1’de watch public kalır.
- Guest ve user canlı yayını izleyebilir.
- Auth duvarı watch yüzeyine vurulmaz.
- V2’de 1v1 için login + dakika/bakiye zorunludur.
- İzleme ile ücretli/kişisel etkileşim aynı gate altında düşünülmez.

### Future note

- V3’te “x saniye izledikten sonra giriş/kayıt ol” duvarı düşünülebilir.
- Bu yalnız future note’tur.
- V1/V2 feature’ı değildir.
- Watch surface ile access/gate policy ayrı düşünülür.
- Böylece ileride timed gate eklemek büyük refactor gerektirmeden mümkün olur.

### Delivery netleştirmesi

- PR-5 yalnız publisher register + application + status surfaces değil,
  aynı zamanda ilgili yüzeylerdeki **minimal support slot** davranışını da kapsar.
- Bu, çekirdek support sistemi açmak anlamına gelmez.

## 19) Admin panel scope freni ve manuel operasyon ayrımı

### Temel kural

Her operasyon için otomatik olarak admin panel ekranı, admin panel fonksiyonu, moderasyon modülü veya ayrı yönetim yüzeyi açılmaz.

### Scope freni

Aşağıdaki durumlarda yeni admin panel işi açılmayacak:

- çok nadir operasyonlar
- geliştirici tarafından güvenli şekilde manuel yapılabilecek işler
- V1/V2 çekirdeğini büyüten ama kullanıcı değerine hemen katkı vermeyen iç operasyonlar
- yalnız owner + geliştirici yakın çalışmasıyla çözülebilecek küçük destek işleri

### Manuel operasyon ilkesi

Bir işlem:

- doğru route
- doğru dosya yolu
- doğru klasör yapısı
- doğru dosya adı
- doğru veri modeli
- doğru guard / permission sınırı

ile güvenli şekilde çözülebiliyorsa,

bunun için ayrıca admin panel ekranı veya admin modülü açılmaz.

### Özellikle admin scope’una sokulmayacak şeyler

- çok nadir düzeltme işleri
- manuel veri düzeltmeleri
- operasyonel password reset
- düşük hacimli destek müdahaleleri
- sırf “ileride lazım olabilir” diye açılmak istenen admin yüzeyleri
- moderasyon breadth’i gerektiren ama V1/V2 scope’unda olmayan işler

### Bu ne demek değildir?

Bu kural:

- dağınık iş yap
- gelişi güzel dosya aç
- kuralsız script yaz

anlamına gelmez.

Tam tersine:

- doğru route altında
- doğru dosya sınırıyla
- doğru isimle
- doğru guard ile
- güvenli ve izlenebilir şekilde

dar çözüm kur demektir.

### Admin panel için özel sınır

Admin panel yalnız gerçekten canonical scope içinde kilitlenmiş işler için açılır.

Şu anki örnek canonical admin scope:

- V1: publisher approval
- V2: publisher approval + payment approval

Bunun dışındaki işler otomatik olarak admin panel scope’una alınmaz.

### Moderasyon sınırı

Bu ayrım özellikle moderasyon için de geçerlidir:

- V1/V2’de moderasyon breadth açılmayacaksa
- bunun için gizli gizli admin ekranı, moderasyon paneli, report queue ya da ek yönetim yüzeyi tasarlanmaz

### Son karar kuralı

Bir iş için yeni admin panel ekranı açmadan önce şu soru sorulur:

- Bu gerçekten canonical V1/V2 scope içinde mi?
- Kullanıcı değerine direkt hizmet ediyor mu?
- Yoksa geliştirici tarafından güvenli manuel operasyon olarak çözülebilir mi?

Güvenli manuel operasyon yeterliyse:

- yeni admin ekranı açılmaz
- yeni moderasyon breadth’i açılmaz
- scope büyütülmez
