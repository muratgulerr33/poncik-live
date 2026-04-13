# Poncik Live — Nihai Final V1 Yol Haritası

## 1) Dürüst güncelleme notu

Bu roadmap, iki ayrı sürümün birleştirilmiş nihai halidir.

Birleştirme kuralı:
- Fazlı ve sistematik omurga ilk sürümden alınır
- Güncel PASS / sıra / owner-rule kararları ikinci sürümden alınır

Bu final sürümde:
- P0 blockerlar artık açık iş gibi değil, kapanmış kabul edilen çekirdek işler olarak yazılır
- Hat A sırası güncellenir
- launch / ops hattı feature roadmap’e karıştırılmaz

---

## 2) Faz 0 — Sabit truth zemini

Bunlar artık tekrar tartışılmayacak sabitlerdir.

### Ürün ve route truth
- `/`
- `/auth`
- `/live/[username]`
- `/studio`

Kurallar:
- watch public
- `/auth` tek route
- `/studio` publisher yüzeyi
- `Başlat / Bitir` publish dili
- V2 / V3 alanları dışarıda

### Mimari truth
- default = route-local
- `shared/ui` ancak gerçekten ortak, stabil, kanıtlı ve dar primitive ihtiyaçta düşünülebilir
- generic abstraction yok
- shell / navigation / media için generic shared abstraction açılmaz
- god file yok
- güvenli değişiklik öncelikli

### Realtime / media truth
- provider = LiveKit Cloud
- token = own backend endpoint
- frontend tokenı backend’den alır
- sandbox kalıcı çözüm değildir
- acceptance gerçek publish + gerçek watch üstünden okunur

---

## 3) Faz 1 — P0 blockerlar

### Durum
- tamamlandı / PASS kabul edildi

### P0.1 — LiveKit foundation + token/backend hattı
- PASS

### P0.2 — Secure mobile acceptance
- final kabul: PASS
- dürüst teknik not:
  - full secure mobile publish acceptance temiz biçimde kapanmadı
  - ama owner-rule kararıyla V1 final acceptance içinde PASS sayıldı

### P0.3 — Gerçek publisher publish
- PASS

### P0.4 — Gerçek viewer playback
- PASS

### P0.5 — Lifecycle hardening
- PASS

### P0.6 — E2E acceptance matrix
- PASS kabul edildi

### Bunun anlamı
- V1 broadcast/live çekirdeği kapanmış kabul edilir
- LiveKit Cloud + backend token endpoint çizgisi oturmuş kabul edilir
- publish / watch / lifecycle / discovery freshness tarafı blocker seviyesinde tamam kabul edilir

---

## 4) Faz 2 — Hat A: V1 kalite / polish / kullanım tamamlama

### Yeni doğru sıra

### 1. sıradaki iş — P1.3 Design/native polish

Bu başlık ilk sıradadır.

Önce çözülecekler:
- mobil kullanım polish
- header düzeni
- Türkçe karakter / ASCII sorunu
- font fallback
- genel native his düzeltmeleri
- boşluk / tipografi / aksiyon boyutu / empty state polish
- `/auth` sade auth/approval yüzeyi olarak kalır; gerektiğinde minimal brand/help/access chrome taşıyabilir; navigation-heavy auth yüzeyi açılmaz
- `/live` ve `/studio` ana route yüzeyinde minimum route chrome taşıyabilir; yalnız fullscreen overlay açılırsa close/back davranışı overlay tarafından taşınabilir; bu route'u navigation shell'e çevirmez

### 2. sıradaki iş — P1.1 Mobile usability + media ratio

Bu başlık ikinci sıradadır.

Güncel not:
- `auth mobile role-tab bug` artık açık iş değildir
- bu konu allowed origin / dev-runtime koşulu olarak anlaşılmış ve PASS kabul edilmiştir

Bu başlık altında kalanlar:
- studio mobile layout düzeltmeleri
- viewer mobile layout düzeltmeleri
- medya oran / disiplin kuralı
- desktop/mobile ortak surface uyumu

### 3. sıradaki iş — P1.2 Public surface + cover tamamlayıcıları

Bu başlık üçüncü sıradadır.

Bu başlık altında:
- cover katalog mantığı
- publisher settings altında hazır cover seçimi
- discovery kartında selected cover gösterimi
- discovery kart polish
- public watch polish

---

## 5) Faz 3 — P2 şimdilik blocker olmayanlar

Bunlar bilinçli olarak dışarıda kalır:

- viewer count
- admin tabs/history breadth
- role-based hamburger
- auth’ı ayrı role ekranlarına bölmek
- timezone / language / currency işleri
- V2 / V3 alanları

---

## 6) Faz 4 — Ayrı launch / ops hattı

Bunlar feature roadmap’e karışmaz ama launch öncesi ayrıca kapanır:

- backup
- logs
- monitoring
- healthcheck
- security hardening
- runtime ops checklist

---

## 7) Final yanlış yola sapmama kuralları

### Yapılacak doğru şeyler
- `/auth` tek route kalacak
- route-local yapı korunacak
- LiveKit Cloud kullanılacak
- token backend’de üretilecek
- publish / watch ayrımı grant ile korunacak
- lifecycle truth dar ve dürüst tutulacak
- P1 polish işleri P0 blocker gibi karıştırılmayacak

### Yapılmayacak yanlış şeyler
- sandbox’ı kalıcı çözüm gibi kullanmak
- tokenı frontend’de üretmek
- API secret’ı frontend’e koymak
- separate admin/auth route açmak
- `shared/ui`yı shell / navigation / media veya generic abstraction çöplüğü olarak açmak
- ops/launch işlerini feature roadmap’e gömmek
- V2/V3 işlerini V1 kalite turuna sızdırmak

---

## 8) En güncel tek cümlelik sonuç

V1 çekirdek blockerlar PASS kabul edildi.
Sıradaki en doğru iş artık yeni feature değil;
önce `P1.3 — Design/native polish`,
sonra `P1.1 — Mobile usability + media ratio`,
sonra `P1.2 — Public surface + cover tamamlayıcıları`.
