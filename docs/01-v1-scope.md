# V1 Scope

## 1) Amaç

Kısa not:

* Bu doküman V1 broadcast/live baseline scope dokümanıdır.
* V2 active 1v1 planning ayrı docs zincirinde ilerler.
* V2 `/call/[sessionId]`, `call_requests`, `call_sessions`, minute/payment/earning alanları V1 scope’a geri yazılmaz.
* Bu dosya V2 implementation onayı değildir; V1/V2 separation baseline’dır.

V1 bilinçli olarak dar tutulur. Amaç, Poncik Live’ın broadcast/live çekirdeğini gereksiz feature yükü olmadan güvenli şekilde kurmaktır. Bu fazda öncelik; discovery, public watch, auth/approval omurgası ve publisher’ın `/studio` üzerinden canlı yayın açabilmesidir. V2 ve V3+ alanları V1’e sızdırılmaz. 

## 2) V1 kapsamı

V1’in kesin kapsamı şudur:

* canlı yayıncıları gösteren discovery ana sayfası
* tek tıkla discovery → live geçişi
* public live/watch yüzeyi
* `/auth` altında auth girişi
* user register ve publisher register
* publisher başvurusu ve approval omurgası
* publisher için `/studio` hazırlık + yayın akışı
* `Başlat / Bitir` eksenli minimal publish lifecycle
* V1 admin tarafında yalnız publisher approval
* dar V1 core DB omurgası
* hafif support fallback yüzeyleri

Canonical route omurgası:

* `/`
* `/auth`
* `/live/[username]`
* `/studio` 

V1 ürün davranışı da nettir:

* discovery kartı tek aksiyonludur
* discovery → live tek hop gider
* viewer yalnız izler ve geri döner
* watch publictir
* guest ve user canlı yayını izleyebilir
* auth duvarı V1 watch yüzeyine vurulmaz
* publisher yüzeyi `/studio`dur
* publisher ana CTA’ları `Başlat / Bitir`dir 

V1 auth/approval omurgası:

* `/auth` tek route’tur
* shared login vardır
* single-role model kullanılır
* `user`, `publisher`, `admin` birbirini dışlar
* publisher register sonrası başvuru otomatik oluşur
* approval matrisi `pending_review / approved / rejected`tir
* publish yetkisi yalnız `approved` ile açılır
* password reset kullanıcıya görünen self-service feature değildir
* tek cihaz policy ürün kuralı olarak `last login wins`tir 

V1 veri ve admin omurgası da dar tutulur:

* V1 core DB dar tutulur
* multi-role yoktur
* `account_roles` yoktur
* V1 admin scope yalnız publisher approval’dır
* discovery kartında viewer count yoktur
* V1 core’da viewer count persistence yoktur 

## 3) V1’de bilinçli olarak dışarıda bırakılanlar

Aşağıdakiler V1 scope’unda değildir:

* 1v1 / call / request akışları
* dakika / bakiye / ödeme akışları
* wallet / ledger alanları
* payment approval
* gift / DM / sosyal / growth alanları
* geniş moderasyon breadth
* büyük support sistemi
* discovery kartında viewer count
* V1 core’da viewer count persistence
* timed auth wall
* watch yüzeyine auth gate vurulması 

V1 ayrıca şunları da açmaz:

* gereksiz auth alt route çoğaltma
* ayrı admin auth sistemi
* multi-role modeli
* büyük support entegrasyonu
* geniş admin/moderasyon yüzeyi
* V2/V3 mantığını V1 dosyalarına sızdıran feature’lar 

## 4) V2’ye kalanlar

V2, paid 1v1 çekirdeğidir. Bu faza kalan ana alanlar şunlardır:

* 1v1 / call / request akışları
* dakika paketleri
* dakika cüzdanı / ledger
* ödeme ve payment approval
* 1v1 için login + dakika/bakiye gate’i
* V2 extension tablo aileleri ve ilgili operasyonlar 

Kısa çizgi:
V1 izleme ve yayın açma çekirdeğidir. V2 ise ücretli kişisel etkileşim çekirdeğidir. Bu iki katman aynı gate altında düşünülmez. 

## 5) V3+ future note

V3+ alanları şunlardır:

* gift
* DM
* sosyal yüzeyler
* growth/gamification
* timed auth wall gibi ileri seviye access deneyleri 

Bunlar şu an yalnız future note seviyesindedir. V1/V2 canonical feature scope’una dahil değildir. 

## 6) Kısa hüküm

Bu scope güvenlidir çünkü yalnız çekirdek canlı yayın ürününü ayağa kaldıran dar alanları içerir. V1; discovery, public watch, auth/approval omurgası ve publisher publish çekirdeğiyle sınırlıdır. Ödeme, 1v1, sosyal ve growth alanları sonraki fazlara bırakılarak scope kontrolü korunur. 
