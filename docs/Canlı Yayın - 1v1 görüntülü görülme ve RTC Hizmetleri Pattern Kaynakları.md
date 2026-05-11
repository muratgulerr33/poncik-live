---
title: "Canlı Yayın - 1v1 görüntülü görüşme ve RTC Hizmetleri Pattern Kaynakları"
status: "canonical-source-map"
project: "poncik-live"
scope: "Canlı yayın, 1v1 görüntülü görüşme ve RTC/WebRTC kaynak hiyerarşisi"
audience:
  - "AI agent"
  - "Senior engineer"
  - "Project maintainer"
last_updated: "2026-05-11"
---

# Canlı Yayın - 1v1 Görüntülü Görüşme ve RTC Hizmetleri Pattern Kaynakları

## 1. Amaç

Bu belge, `poncik-live` projesinde canlı yayın, 1v1 görüntülü görüşme ve gerçek zamanlı iletişim altyapısı tasarlanırken hangi WebRTC/RTC kaynaklarının hangi öncelikle dikkate alınacağını tanımlar.

Belgenin amacı, yapay zekâ sistemlerinin ve geliştiricilerin WebRTC hakkında çelişkili veya yüzeysel kaynaklara göre karar vermesini engellemek; kararları standartlara, protokol belgelerine, referans uygulamalara ve derin teknik kaynaklara dayandırmaktır.

## 2. Kapsam

Bu belge şu konuları kapsar:

- WebRTC API standardı
- IETF protokol ve codec RFC’leri
- libwebrtc referans uygulaması
- Tarayıcı WebRTC örnekleri
- Derin teknik WebRTC rehberleri
- WebRTC test ve debug kaynakları
- SFU ve sunucu tarafı WebRTC kütüphaneleri
- AI sistemleri için kaynak önceliklendirme kuralları

## 3. Kapsam Dışı

Bu belge şu konuları implementation truth olarak belirlemez:

- LiveKit proje mimarisi
- Poncik Live özel LiveKit token yapısı
- MDN temelli nihai teknik karar
- V2 1v1 ürün kararı
- Ödeme, billing, ledger veya earning mimarisi
- Frontend UI contract
- Database schema freeze
- API route freeze
- Production implementation planı

LiveKit, MDN veya türetilmiş kütüphaneler gerektiğinde yan referans olarak kullanılabilir; fakat WebRTC’nin temel çalışma mantığı doğrulanırken bu belgede listelenen standartlar ve kaynaklar önceliklidir.

## 4. Kaynak Öncelik Hiyerarşisi

AI ve geliştirici kararlarında önerilen doğruluk sırası:

1. W3C WebRTC standardı
2. IETF RFC belgeleri
3. libwebrtc referans uygulaması ve resmi WebRTC projesi
4. Resmî WebRTC örnekleri
5. WebRTC for the Curious gibi derin teknik kaynaklar
6. WebRTC Hacks, Sipfront gibi pratik debug ve analiz kaynakları
7. SFU / medya sunucusu dokümantasyonları
8. MDN, LiveKit veya framework dokümantasyonları
9. Blog, forum, eski örnek kod veya yorumlar
10. AI yorumu / tahmini

Kural: Daha düşük seviyedeki kaynak, daha üst seviyedeki standart veya protokol belgesiyle çelişirse üst kaynak esas alınır.

---

# 5. WebRTC Kaynak Hiyerarşisi

## 5.1 Resmî WebRTC Standardı

### W3C WebRTC API Recommendation

W3C WebRTC API Recommendation, WebRTC’nin tarayıcı JavaScript API’lerini tanımlar.

Bu kaynakta özellikle şu API ve nesneler doğrulanmalıdır:

- `RTCPeerConnection`
- `RTCDataChannel`
- `MediaStream`
- `MediaStreamTrack`
- SDP / ICE / track lifecycle davranışları
- Tarayıcı uyumluluk kuralları

Kaynak:

- https://www.w3.org/TR/webrtc/

Kullanım kuralı:

- Tarayıcı API davranışı hakkında nihai doğrulama yapılacaksa ilk bakılacak kaynak W3C WebRTC API Recommendation olmalıdır.

### W3C WebCodecs

WebCodecs, tarayıcıda düşük seviye medya kodlama ve çözme işlemlerini tanımlar.

Özellikle şu konular için referans alınır:

- `VideoEncoder`
- `VideoDecoder`
- `AudioEncoder`
- `AudioDecoder`
- Frame seviyesinde medya işleme
- WebRTC dışı veya WebRTC’ye yardımcı medya pipeline tasarımları

Kaynak:

- https://www.w3.org/TR/webcodecs/

### W3C WebRTC Encoded Transform

WebRTC Encoded Transform, WebRTC bağlantısı içindeki kodlanmış medya kareleri üzerinde işlem yapmayı tanımlar.

Özellikle şu ihtiyaçlarda incelenmelidir:

- Encoded frame filtreleme
- Uçtan uca şifreleme patternleri
- Medya pipeline üzerinde ileri seviye transform işlemleri
- Tarayıcı tarafında encoded medya müdahalesi

Kaynak:

- https://www.w3.org/TR/webrtc-encoded-transform/

Not: WebCodecs ile Encoded Transform aynı şey değildir. WebCodecs genel medya encode/decode API’sidir; Encoded Transform ise WebRTC bağlantısı üzerindeki encoded frame akışına odaklanır.

---

## 5.2 IETF RFC’leri: Protokol ve Codec Kuralları

WebRTC sadece JavaScript API’sinden ibaret değildir. Gerçek zamanlı medya ve veri aktarımı; ICE, STUN, TURN, DTLS-SRTP, RTP/RTCP ve codec kuralları gibi protokol katmanlarına dayanır.

### RFC 8835 — Transports for WebRTC

WebRTC uç noktalarının kullanması gereken temel taşıma ve güvenlik protokollerini açıklar.

Kapsadığı başlıklar:

- UDP / TCP taşıma davranışı
- ICE
- STUN
- TURN
- DTLS-SRTP
- NAT arkasındaki bağlantı kurulumu
- Güvenli medya aktarımı

Kaynak:

- https://www.rfc-editor.org/rfc/rfc8835.html

Kullanım kuralı:

- Bağlantı kurulumu, NAT traversal, TURN/STUN, transport ve güvenlik kararları için temel RFC olarak okunmalıdır.

### RFC 7742 — WebRTC Video Codec Requirements

WebRTC tabanlı uygulamaların desteklemesi gereken video codec gereksinimlerini tanımlar.

Öne çıkan başlıklar:

- VP8
- H.264 Constrained Baseline
- Video codec uyumluluğu
- Tarayıcılar arası minimum codec beklentileri

Kaynak:

- https://www.rfc-editor.org/rfc/rfc7742.html

### RFC 7874 — WebRTC Audio Codec and Processing Requirements

WebRTC ses codec ve ses işleme gereksinimlerini açıklar.

Öne çıkan başlıklar:

- Opus
- G.711 PCMA / PCMU
- Echo cancellation
- Noise suppression
- Audio processing gereksinimleri

Kaynak:

- https://www.rfc-editor.org/rfc/rfc7874.html

### Diğer IETF Belgeleri

WebRTC’de kullanılabilecek ek protokoller için ilgili RFC ve IETF belgeleri ayrıca incelenmelidir.

Örnek alanlar:

- RTP / RTCP
- JSEP
- DSCP
- SCTP
- ICE extension belgeleri
- SDP offer/answer detayları

Kural: Codec, transport veya protokol davranışı hakkında karar verilecekse blog veya framework dokümanı değil, ilgili RFC esas alınır.

---

## 5.3 Açık Kaynak WebRTC Kodu ve Resmî Proje

### webrtc.org ve libwebrtc

`libwebrtc`, WebRTC’nin en önemli referans uygulamalarından biridir. Google tarafından yönetilen açık kaynak WebRTC projesinin temel kodlarını içerir ve birçok tarayıcı davranışının anlaşılmasında ana kaynaklardan biri olarak kabul edilir.

Kullanım alanları:

- Gerçek tarayıcı davranışlarını anlamak
- Codec negotiation detaylarını incelemek
- Jitter buffer, bandwidth estimation ve congestion control gibi karmaşık parçaları takip etmek
- Tarayıcılar arası farkların kökenini araştırmak

Kaynaklar:

- https://webrtc.org/
- https://webrtc.googlesource.com/src

Kullanım kuralı:

- Standartta tanımlı olup pratikte farklı davranan bir durum varsa, libwebrtc kodu ve tarayıcı implementasyonları incelenmelidir.

### Official WebRTC Samples

Official WebRTC Samples, tarayıcı WebRTC API’lerini öğrenmek ve küçük izole senaryoları test etmek için kullanılır.

Kullanım alanları:

- `getUserMedia` testleri
- `RTCPeerConnection` örnekleri
- Data channel örnekleri
- Screen sharing örnekleri
- Tarayıcı API davranışını minimal örnekle doğrulama

Kaynak:

- https://webrtc.github.io/samples/

Kullanım kuralı:

- Bir davranış Poncik Live içinde karmaşık görünüyorsa, önce minimal WebRTC sample mantığıyla izole edilerek doğrulanmalıdır.

---

## 5.4 Derinlemesine Rehberler ve Öğrenme Kaynakları

### WebRTC for the Curious

WebRTC for the Curious, WebRTC’nin protokol setini, tarihini ve çalışma felsefesini açıklayan açık kaynaklı kapsamlı bir e-kitaptır.

Kullanım alanları:

- WebRTC’nin tarihsel gelişimini anlamak
- RTCWeb çalışma grubunun yaklaşımını öğrenmek
- Protokol katmanlarını kavramak
- ICE, DTLS, SRTP, RTP, SCTP gibi kavramları bütünsel görmek

Kaynaklar:

- https://webrtcforthecurious.com/
- https://webrtcforthecurious.com/docs/10-history-of-webrtc/

Not:

- WebRTC’nin Google’ın GIPS ve On2 satın alımları sonrası nasıl geliştiğini ve farklı şirketlerden mühendislerin katkısıyla nasıl standartlaştığını anlamak için iyi bir arka plan kaynağıdır.

### WebRTC Hacks

WebRTC Hacks, deneyimli WebRTC geliştiricileri tarafından yazılan teknik analiz blogudur.

Kullanım alanları:

- Jitter buffer / NetEQ analizleri
- Google Congestion Control
- Bitrate probing
- Browser behavior farkları
- libwebrtc iç detayları
- Gerçek dünya debug senaryoları

Kaynak:

- https://webrtchacks.com/

Örnek kaynak:

- https://webrtchacks.com/probing-webrtc-bandwidth-probing-why-and-how-in-gcc/

Kullanım kuralı:

- Standartların soyut kaldığı pratik performans, bitrate, network adaptation ve tarayıcı farkları için WebRTC Hacks değerli yan kaynaktır.

### Sipfront Blog

Sipfront Blog, WebRTC bağlantı testleri ve kalite ölçümü konusunda pratik rehberler sunar.

Kullanım alanları:

- `chrome://webrtc-internals` kullanımı
- `about:webrtc` ile Firefox debug
- Bitrate, packet loss, jitter, round-trip time ölçümü
- STUN/TURN testleri
- Dar bant ve kötü ağ koşulu simülasyonları
- Saha testi senaryoları

Kaynak:

- https://sipfront.com/blog/2026/04/how-to-test-a-webrtc-connection-effectively-in-2026/

Kullanım kuralı:

- Üretim öncesi veya canlı yayın kalitesi debug edilirken, browser internals ve network metrikleri bu tarz kaynaklarla birlikte okunmalıdır.

### Ant Media WebRTC Browser Support Guide

Ant Media WebRTC Browser Support Guide, tarayıcı desteği, codec tercihleri, düşük gecikmeli yayın ve büyük ölçekli kullanımda medya sunucusu ihtiyacı gibi konuları pratik seviyede tartışır.

Kaynak:

- https://antmedia.io/webrtc-browser-support/

Kullanım kuralı:

- Tarayıcı desteği ve medya sunucusu ihtiyacı için yan kaynak olarak kullanılabilir. Standart veya protokol truth yerine geçmez.

---

## 5.5 SFU ve Sunucu Tarafı WebRTC Kütüphaneleri

WebRTC, tarayıcılar arasında doğrudan iletişimi mümkün kılar; fakat çoklu katılımcılı oda, kayıt, simulcast, SVC, forwarding veya transcoding gibi ihtiyaçlarda sunucu tarafı bileşenlere ihtiyaç duyulur.

Bu kütüphaneler WebRTC standardını icat etmez. WebRTC üzerine kurulu altyapı sağlar.

### mediasoup

mediasoup, Node.js ve Rust tabanlı bir Selective Forwarding Unit’dir.

Kullanım alanları:

- Çoklu katılımcılı oda
- Simulcast
- SVC
- Bandwidth estimation
- Server-side media forwarding
- Sinyalleşmeden bağımsız WebRTC medya altyapısı

Kaynak:

- https://mediasoup.org/documentation/overview/

### Janus WebRTC Server

Janus, C ile yazılmış genel amaçlı bir WebRTC sunucusudur. Plugin mimarisiyle farklı WebRTC senaryoları kurulabilir.

Kullanım alanları:

- WebRTC gateway
- Plugin tabanlı medya işleme
- Video room
- SIP gateway
- Streaming
- Recording ve forwarding senaryoları

Kaynak:

- https://janus.conf.meetecho.com/

### Pion WebRTC

Pion WebRTC, Go dilinde yazılmış saf WebRTC uygulamasıdır.

Kullanım alanları:

- Go tabanlı medya servisleri
- Server-side WebRTC
- Gömülü cihazlar
- libwebrtc’ye alternatif lightweight implementasyonlar
- Eğitim ve protokol seviyesi deneyler

Kaynak:

- https://github.com/pion/webrtc

---

# 6. Poncik Live İçin Kullanım Kuralları

## 6.1 AI İçin Doğrulama Kuralı

AI sistemi WebRTC, RTC, canlı yayın veya 1v1 medya altyapısı hakkında öneri üretirken şu sırayı takip etmelidir:

1. Önce ilgili konunun API mi, protokol mü, codec mi, medya sunucusu mu, ürün mimarisi mi olduğunu belirle.
2. API davranışıysa W3C WebRTC / WebCodecs kaynaklarına bak.
3. Transport, NAT, TURN/STUN, codec veya RTP davranışıysa IETF RFC’lerine bak.
4. Tarayıcı implementasyon detayı gerekiyorsa libwebrtc ve resmi sample’lara bak.
5. Debug ve performans için WebRTC Hacks / Sipfront gibi pratik kaynakları kullan.
6. SFU seçimi gerekiyorsa mediasoup, Janus, Pion gibi altyapıların kendi dokümanlarını karşılaştır.
7. LiveKit veya MDN bilgisini yan kaynak olarak kullan; temel WebRTC truth yerine koyma.

## 6.2 Drift Önleme Kuralları

- WebRTC ile LiveKit aynı şey değildir.
- LiveKit bir WebRTC altyapı/servis katmanıdır; WebRTC standardının yerine geçmez.
- MDN öğretici ve referans olarak yararlıdır; standart truth değildir.
- Blog yazıları pratik içgörü sağlar; RFC veya W3C standardının üstünde değildir.
- SFU kütüphaneleri WebRTC standardını tanımlamaz; WebRTC üzerine çözüm sunar.
- Projede LiveKit kullanılıyor diye WebRTC protokol gerçekleri LiveKit dokümanından türetilmemelidir.
- 1v1 billing, ödeme, ledger ve earning kararları WebRTC kaynaklarından çıkarılmamalıdır; bunlar ayrı ürün/backend mimarisi konusudur.
- Tarayıcı farkları iddia edilecekse tarih, tarayıcı, sürüm ve test kanıtı belirtilmelidir.
- Mobil kamera/mikrofon davranışı için gerçek cihaz testi gereklidir.
- Production canlı yayın davranışı için sadece statik kaynak değil, runtime evidence gerekir.

## 6.3 Poncik Live Kararlarında Kullanım Örnekleri

### Canlı yayın bağlantı problemi

Öncelik sırası:

1. Runtime log ve browser internals
2. LiveKit room / participant durumu
3. WebRTC transport ve ICE/TURN kaynakları
4. libwebrtc davranışı
5. Sipfront / WebRTC Hacks debug yazıları

### Kamera veya mikrofon davranışı

Öncelik sırası:

1. W3C Media Capture / WebRTC API davranışı
2. Tarayıcı gerçek cihaz testi
3. libwebrtc / browser issue davranışları
4. MDN yardımcı açıklama

### Codec veya kalite problemi

Öncelik sırası:

1. RFC 7742 / RFC 7874
2. Browser codec support evidence
3. LiveKit runtime stats
4. WebRTC Hacks / browser internals analizi

### Çoklu izleyici, room veya SFU kararı

Öncelik sırası:

1. Ürün ihtiyacı
2. WebRTC mimari kısıtları
3. SFU dokümantasyonları
4. LiveKit / mediasoup / Janus / Pion karşılaştırması
5. Runtime load test evidence

---

# 7. Tavsiyeler

1. Standart belgelerden başlayın.
   - API seviyesinde W3C belgelerini inceleyin.
   - Protokol seviyesinde IETF RFC’lerini inceleyin.
   - Codec zorunluluklarını RFC belgelerinden doğrulayın.

2. Açık kaynak kodu analiz edin.
   - `webrtc.googlesource.com/src` üzerindeki libwebrtc kodu, tarayıcıların gerçek davranışını anlamak için en güçlü kaynaklardan biridir.

3. Deneyimli geliştirici bloglarını takip edin.
   - WebRTC Hacks ve Sipfront gibi kaynaklar pratik debug ve performans sorunlarını anlamada yararlıdır.

4. SFU’ları öğrenin.
   - Çoklu yayın, kayıt, simulcast veya forwarding gerekiyorsa mediasoup, Janus, Pion ve kullanılan managed servislerin sınırları incelenmelidir.

5. MDN ve LiveKit belgelerini yan referans olarak kullanın.
   - Basit örnek, tarayıcı API açıklaması veya provider-specific kullanım için faydalıdır.
   - Derin protokol kararı için tek kaynak yapılmamalıdır.

---

# 8. Canonical Kaynak Listesi

## W3C

- WebRTC API Recommendation: https://www.w3.org/TR/webrtc/
- WebCodecs: https://www.w3.org/TR/webcodecs/
- WebRTC Encoded Transform: https://www.w3.org/TR/webrtc-encoded-transform/

## IETF RFC

- RFC 8835 — Transports for WebRTC: https://www.rfc-editor.org/rfc/rfc8835.html
- RFC 7742 — WebRTC Video Codec Requirements: https://www.rfc-editor.org/rfc/rfc7742.html
- RFC 7874 — WebRTC Audio Codec and Processing Requirements: https://www.rfc-editor.org/rfc/rfc7874.html

## Resmî WebRTC Projesi

- WebRTC Project: https://webrtc.org/
- libwebrtc Source: https://webrtc.googlesource.com/src
- Official WebRTC Samples: https://webrtc.github.io/samples/

## Derin Teknik Kaynaklar

- WebRTC for the Curious: https://webrtcforthecurious.com/
- WebRTC History: https://webrtcforthecurious.com/docs/10-history-of-webrtc/
- WebRTC Hacks: https://webrtchacks.com/
- WebRTC Bandwidth Probing: https://webrtchacks.com/probing-webrtc-bandwidth-probing-why-and-how-in-gcc/
- Sipfront WebRTC Testing Guide: https://sipfront.com/blog/2026/04/how-to-test-a-webrtc-connection-effectively-in-2026/
- Ant Media WebRTC Browser Support Guide: https://antmedia.io/webrtc-browser-support/

## SFU ve Server-side WebRTC

- mediasoup Overview: https://mediasoup.org/documentation/overview/
- Janus WebRTC Server: https://janus.conf.meetecho.com/
- Pion WebRTC: https://github.com/pion/webrtc

---

# 9. AI İçin Kısa Özet

Bu belge, Poncik Live projesinde canlı yayın, 1v1 görüntülü görüşme ve RTC/WebRTC konularında kaynak önceliğini tanımlar.

AI sistemi şu kurala uymalıdır:

- WebRTC API için W3C.
- Transport, codec ve protokol için IETF RFC.
- Gerçek tarayıcı davranışı için libwebrtc ve browser evidence.
- Debug ve performans için WebRTC Hacks / Sipfront.
- SFU mimarisi için mediasoup / Janus / Pion / kullanılan provider dokümanları.
- LiveKit ve MDN, temel standardın yerine değil, yan referans olarak kullanılmalıdır.

Bu belge production implementation planı değildir. Kod, migration, API route, LiveKit grant veya product decision freeze üretmez. Sadece kaynak hiyerarşisi ve drift guard sağlar.
