---
title: Poncik Live — Studio Publisher Outbound Quality Contract
status: draft-contract
scope: /studio publisher outbound quality
phase: PR-0 doc-only
implementation: false
migration: false
route_change: false
db_change: false
---

# Poncik Live — Studio Publisher Outbound Quality Contract

## 1) Amaç

Bu dokümanın amacı `/studio` publisher outbound medya kalitesi için dar, ölçülebilir ve güvenli bir kalite kontratı tanımlamaktır.

Bu doküman implementation değildir.

Bu doküman şunları yapmaz:

- production kod yazmaz
- migration yazmaz
- route açmaz
- DB modeli değiştirmez
- viewer `/live/[username]` yüzeyini yeniden tasarlamaz
- camera switcher kontratına dokunmaz
- WebCodecs implementation kararı vermez
- H264 veya VP8 için final codec freeze yapmaz

Bu doküman yalnız kalite karar alanını netleştirir.

## 2) Canonical kaynak hiyerarşisi

Bu kontrat için canonical kaynak hiyerarşisi:

1. owner measurement evidence
2. current `main` repo evidence
3. `Canlı Yayın - 1v1 görüntülü görülme ve RTC Hizmetleri Pattern Kaynakları.pdf`
4. W3C WebRTC / WebRTC Stats / Media Capture
5. IETF WebRTC RFC kaynakları
6. webrtc.org / libwebrtc
7. WebRTC Hacks / Sipfront gibi derin pratik WebRTC kaynakları
8. provider docs yalnız uygulama seviyesinde yardımcı kaynak

Provider dokümanları bu kontratta ana truth değildir.

## 3) Problem tanımı

Ölçümlerde görülen ana problem:

- `/studio` source ve prelive sağlam.
- Publish/connect kuruluyor.
- Outbound ilk anda high layer görebiliyor.
- Sonra kalite CPU / bandwidth adaptation etkisiyle düşüyor.

Bu yüzden ana sorun şunlar değildir:

- kamera çalışmıyor
- prelive bozuk
- viewer bozuk
- Vercel tek başına sebep
- LiveKit provider bug kesin

Ana sorun:

- mobil Chrome publisher outbound kalite politikası 720x1280 @30fps için fazla agresif.

## 4) Current repo reading

Current repo’da mobil portrait capture tarafı 30fps hedefli yüksek kaynak ister.

Current repo evidence path:

- `src/app/(studio)/studio/_adapters/studio-camera-capture-contract.ts`

Current behavior:

- mobile portrait capture width ideal: 1280
- mobile portrait capture height ideal: 720
- frameRate ideal/max: 30

Telefonda bu pratikte dikey kaynak olarak yaklaşık şu davranışı üretir:

- 720x1280 @30fps

Preview tarafı stream’i alır ve aynı stream publish hattına gider.

Current repo evidence path:

- `src/app/(studio)/studio/_adapters/studio-preview-adapter.ts`

Publish tarafında `Room` options’sız açılır ve `publishTrack` sırasında yalnız source bilgisi verilir.

Current repo evidence path:

- `src/app/(studio)/studio/_adapters/studio-livekit-publisher-adapter.ts`

Bu nedenle şu alanlar current repo’da açık kalite kontratı olarak kilitli değildir:

- codec
- bitrate
- framerate
- simulcast layer policy
- degradation policy
- mobile/desktop quality profile

## 5) Ölçümden çıkan teknik hüküm

Ölçüm sonucu:

- source/prelive sağlam
- publish/connect sağlam
- ilk kalite kırılımı publisher outbound tarafında
- ana baskı CPU/encoder
- ikincil baskı bandwidth/adaptation
- ışık/hareket/auto exposure sahne karmaşıklığı kalite kararını etkiliyor

Ters ışık ve hareket testinde kamera şu işleri yapabilir:

- auto exposure
- white balance
- focus / face exposure
- noise reduction
- image processing

Bu işler piksel değişimini artırır.

Piksel değişimi artınca:
- encoder yükü artar
- bitrate ihtiyacı oynar
- WebRTC bandwidth estimation dalgalanabilir
- qualityLimitationReason bandwidth görünebilir

Önemli ayrım:

- CPU fiziksel internet hızını düşürmez.
- Ama encoder yükü WebRTC adaptation / bandwidth kararını etkileyebilir.

## 6) Kalite önceliği

Bu kontratta kalite önceliği:

- stabil FPS > yüksek çözünürlük

Kullanıcı için tercih edilen davranış:

- 540p stabil 24fps

Tercih edilmeyen davranış:

- 720p ama 2-15fps arası takılan, sonra layer düşen yayın

Bu yüzden bu kontratın çalışma ilkesi:

- smooth-first mobile publisher outbound contract

## 7) Mobile web default contract

V1 mobile web default hedef:

- resolution: 540x960
- fps: 24
- priority: smooth first
- reason: mobile browser encoder yükünü azaltmak

Mobile low fallback:

- resolution: 360x640
- fps: 20
- trigger: CPU veya bandwidth baskısı

Mobile high candidate:

- resolution: 720x1280
- fps: 24
- condition: yalnız ölçüm PASS ise

Rejected default:

- resolution: 720x1280
- fps: 30
- reason: orta seviye mobile Chrome için encoder açısından yüksek risk taşır

## 8) Neden 540x960 @24fps?

Piksel yükü farkı:

- 720x1280 = 921,600 piksel
- 540x960 = 518,400 piksel

Bu yaklaşık yüzde 44 daha az piksel demektir.

30fps yerine 24fps seçmek de encoder’a daha fazla zaman bırakır.

Bu yüzden ilk güvenli mobile web baseline:

- 540x960 @24fps

## 9) Codec policy

Bu kontrat codec’i final freeze etmez.

Baseline aday:

- VP8 tuned baseline

Ölçüm adayı:

- H264 compare spike

Hüküm:

- VP8 ve H264 ölçülmeden final codec freeze yapılmaz.

Neden:

- WebRTC dünyasında VP8 ve H264 temel codec çizgisindedir.
- Ama gerçek cihazdaki CPU/encoder maliyeti ölçümle anlaşılır.

## 10) WebCodecs hükmü

WebCodecs bu kontratta immediate implementation değildir.

Bu projedeki anlamı:

- normal WebRTC publish ayarları yetmezse,
- gelecekte daha alt seviye encoder kontrolü için araştırılacak derin spike alanı.

Bugünkü V1 kalite işi için WebCodecs no-scope kabul edilir.

Gerekçe:

- custom encoder pipeline karmaşıktır
- browser support riski vardır
- LiveKit publish hattıyla entegrasyon riski vardır
- V1 small PR disiplinini büyütür

## 11) Acceptance kriteri

Bir kalite profili PASS sayılmak için ölçümle kanıtlanmalıdır.

Minimum ölçüm:

- duration: 180s
- primary device: RedMi Android Chrome
- secondary device: Samsung Android Chrome
- optional device: iPhone Safari / Desktop Chrome

Senaryolar:

- iyi ışık sabit
- düşük ışık sabit
- ters ışık + hareket

Başarı kriterleri:

- median FPS >= 22
- p5 FPS >= 18
- encode median <= 30ms
- encode p95 <= 45ms
- black screen = 0
- disconnect = 0
- dominant quality limitation cpu/bandwidth olmamalı
- layer flap minimum olmalı

720p high yalnız şu durumda açılır:

- 180s stabil
- p5 FPS >= 18
- encode p95 <= 45ms
- quality limitation cpu/bandwidth dominant değil

Bu koşul geçilmezse mobile default şu kalır:

- 540x960 @24fps

## 12) Ölçüm matrix’i

PR-0 sonrası önerilen ölçüm matrix’i:

- A: mevcut 720x1280 @30 VP8/default
- B: 540x960 @24 VP8 tuned
- C: 540x960 @24 H264 compare

Her profil şu sahnelerde ölçülür:

1. iyi ışık sabit
2. düşük ışık sabit
3. ters ışık + hareket

Toplam:

- 3 profil x 3 sahne = 9 ölçüm

Her ölçüm 60s olabilir.

Kazanan profil için final doğrulama:

- 180s acceptance run

## 13) Implementation scope guard

Bu kontrat implementation başlatmaz.

Implementation zamanı geldiğinde dokunulabilecek dar dosya adayları:

- `src/app/(studio)/studio/_adapters/studio-camera-capture-contract.ts`
- `src/app/(studio)/studio/_adapters/studio-preview-adapter.ts`
- `src/app/(studio)/studio/_adapters/studio-livekit-publisher-adapter.ts`

No-touch alanlar:

- `/live/[username]`
- `/`
- `/auth`
- admin
- database
- payment
- 1v1
- camera switcher
- generic shared media abstraction
- global media utils

## 14) Route / DB / product guard

Bu iş route değiştirmez.

Canonical route omurgası korunur:

- `/`
- `/auth`
- `/live/[username]`
- `/studio`

Bu iş DB değiştirmez.

Bu iş V2/V3 alanı açmaz.

Bu iş viewer yüzeyini yeniden tasarlamaz.

Bu iş yalnız `/studio` publisher outbound kalite kontratıdır.

## 15) Final hüküm

Status:

- draft-contract

Problem:

- mobile browser publisher outbound quality policy eksikliği

Root:

- 720x1280@30 encoder/adaptation baskısı

Trigger:

- ışık, hareket, auto exposure ve sahne karmaşıklığı

Mobile default:

- 540x960@24

Mobile low:

- 360x640@20

Mobile high:

- 720x1280@24 only after evidence

Forbidden default:

- 720x1280@30

Codec:

- VP8 baseline + H264 measured compare

WebCodecs:

- future deep spike

Next step:

- ölçüm matrix ve sonra dar implementation PR

## 16) Bir cümlelik özet

Poncik Live mobile web publisher tarafında kalıcı çözüm, 720p30’u zorlamak değil; smooth-first, ölçümlü, fallback’li outbound kalite kontratı kurmaktır.
