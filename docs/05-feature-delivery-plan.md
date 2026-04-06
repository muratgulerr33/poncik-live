# Feature Delivery Plan

## 1) Amaç

Bu planın amacı, Poncik Live V1 için güvenli ve dar bir teslim sırası vermektir.

Hedef:
- küçük PR’larla ilerlemek
- V1 scope’unu korumak
- foundation → read path → auth/approval → write path sırasını net tutmak
- solo developer için bakım ve hata ayıklamayı kolay tutmak

Bu doküman implementation detayı değil, canonical delivery truth’tur.

## 2) Delivery ilkeleri

- Her PR tek ana amaç taşır.
- Önce foundation, sonra read path, sonra auth/approval, sonra write path gelir.
- Public read path, publish/write path’ten önce açılır.
- Design foundation ekran feature’larından önce kurulur.
- Discovery/watch ile studio aynı PR’da gitmez.
- Auth/approval zinciri tek PR’a doldurulmaz.
- PR-1 yalnız ince technical foundation’dır.
- Final hardening PR çöp kutusu değildir.
- Mobile-first korunur.
- Performans korunur.
- Route sınırı korunur.
- Dosya şişmesi ve god file oluşumu kabul edilmez.
- Tek dosya çoklu sorumluluk taşımaz.
- Güvenli değişiklik ve kolay bakım tüm PR’ların ortak kalite kuralıdır.
- V2/V3 mantığı V1 PR’larına sızmaz.
- Support fallback minimaldir; çekirdek feature gibi büyütülmez.

## 3) Canonical PR sırası

### PR-1 — Technical foundation
Temel route tree, dosya sınırı, tek root layout zemini, minimal app bootstrapping ve minimum DB/bootstrap zemini.

### PR-2 — Design foundation
Yeni font altyapısı, tema/token omurgası ve temel shell yüzeylerinin ortak görsel zemini.

### PR-3 — Public discovery + public live/watch
Home/discovery ve tek tıkla `/live/[username]` izleme akışı.

### PR-4 — Auth core
`/auth` tek route, shared login ve temel auth/session omurgası.

### PR-5 — Publisher register + application + status surfaces + minimal support slot
Publisher register, otomatik başvuru, status yüzeyleri ve ilgili yüzeylerde çok hafif support çıkışı.

### PR-6 — Admin approval minimal
V1 admin için yalnız publisher approval akışı.

### PR-7 — Studio prep + permission + approval gate
`/studio` hazırlık yüzeyi, permission akışı ve approval gate.

### PR-8 — Minimal publish lifecycle
`Başlat / Bitir` ile gerçek publish lifecycle.

### PR-9 — Final hardening
Küçük akış düzeltmeleri, küçük fallback eksikleri ve küçük bug/hardening kapanışları.

## 4) PR sırasının kısa yorumu

- **Read path önce gelir** çünkü V1 watch public’tir ve ürünün en dar çalışan çekirdeği en hızlı burada doğrulanır.
- **Design foundation erken gelir** çünkü yeni font ve tema/token zemini ekran feature’larından önce oturursa sonraki PR’lar aynı temel üzerinde ilerler.
- **Auth/approval write path’ten önce gelir** çünkü publish yetkisi approval’a bağlıdır; studio ve publish zinciri bundan önce tamamlanmış sayılmaz.
- **Support minimal kalır**; özellikle `pending_review` ve `rejected` yüzeylerinde çekirdek olan şey ekranların kendisidir. Support burada yalnız küçük bir çıkış noktasıdır.
- **Final hardening çöp kutusu değildir**; büyük feature ya da gecikmiş çekirdek işler sona yığılmaz.

## 5) Bilerek sonraya bırakılanlar

### V2’ye kalanlar
- paid 1v1 akışları
- dakika / bakiye / ödeme yüzeyleri
- V2 extension tablo aileleri
- V2 admin payment approval genişlemesi
- V2 realtime/app transport kararları

### Public launch checklist’e kalanlar
- backup
- minimum log
- minimum healthcheck
- launch öncesi operasyonel sertleştirme

### Implementation mikro detayları
- exact dosya listeleri
- exact test adımları
- exact coding prompts
- exact UI microcopy
- exact support slot yerleşimi
- exact query/refetch tuning

## 6) Kısa hüküm

Bu delivery planı güvenlidir çünkü V1’i dar tutar, PR’ları küçük tutar, read path ile write path’i karıştırmaz ve route-local dosya disiplinini korur. Solo developer için daha yönetilebilir bir sıra verir: önce zemin, sonra public çekirdek, sonra auth/approval, sonra studio/publish. Böylece scope sızması azalır, hata ayıklama kolaylaşır ve değişiklikler daha güvenli ilerler.

