# Routes and Screens

## 1) Route omurgası

V1 route omurgası bilinçli olarak dardır.

Amaç:
- ana kullanıcı yollarını net tutmak
- gereksiz ikinci hop açmamak
- V2/V3 alanlarını V1’e sızdırmamak
- route başına tek ana kullanıcı amacı korumak

Canonical V1 route’ları:
- `/`
- `/auth`
- `/live/[username]`
- `/studio`

## 2) `/` — Discovery / home

Ana amacı:
- canlı yayıncıları göstermek
- kullanıcıyı tek tıkla public watch yüzeyine götürmek

Gösterir:
- discovery listesi
- discovery kartları
- loading / empty / error gibi discovery yüzeyleri

Göstermez:
- studio araçları
- publish kontrolü
- auth akışı
- payment / minute / 1v1 yüzeyleri
- ayrı profile route girişi

Kural:
- discovery kartı tek aksiyonludur
- discovery → live tek hop gider
- ayrı profile navigation yoktur

## 3) `/auth` — Auth / approval surface

Ana amacı:
- giriş / kayıt / session erişimi
- auth ve approval ile ilgili yüzeyleri çözmek

Gösterir:
- shared login
- user register
- publisher register
- publisher register sonrası approval ile ilgili status yüzeyleri
- `pending_review / approved / rejected` bağlamı
- gerekli hafif support fallback yüzeyleri

Göstermez:
- public watch deneyimi
- discovery listesi
- studio prep / publish yüzeyi
- admin için ayrı auth sistemi
- 1v1 / payment / minute yüzeyleri

Kural:
- `/auth` tek auth route’tur
- auth alt route çoğaltılmaz
- admin ayrı auth sistemi kullanmaz
- `/auth` sade auth/approval yüzeyi olarak kalır
- gerektiğinde minimal brand/help/access chrome taşıyabilir
- navigation-heavy yüzeye dönmez

## 4) `/live/[username]` — Public watch surface

Ana amacı:
- tek bir yayıncıyı izletmek

Gösterir:
- public watch yüzeyi
- minimum route chrome
- gerekli live / unavailable / ended bağlamı

Göstermez:
- discovery listesi
- studio araçları
- publish CTA’ları
- auth duvarı
- payment / minute / 1v1 yüzeyleri
- join / leave / room dili

Kural:
- V1 watch publictir
- guest ve user canlı yayını izleyebilir
- viewer yalnız izler ve geri döner
- ana route yüzeyi minimum route chrome taşıyabilir
- yalnız fullscreen overlay açık state'te close/back davranışı overlay tarafından taşınabilir
- bu, route'u navigation shell'e çevirmek anlamına gelmez

## 5) `/studio` — Publisher prep / publish surface

Ana amacı:
- publisher hazırlık ve yayın akışını taşımak

Gösterir:
- prep yüzeyi
- publish öncesi gerekli durum yüzeyleri
- approval gate sonucu
- `Başlat / Bitir` eksenli publish akışı

Göstermez:
- discovery listesi
- public watch yüzeyi mantığı
- admin approval yönetimi
- payment / minute / 1v1 yüzeyleri
- başlık / açıklama alanları

Kural:
- publisher yüzeyi `/studio`dur
- publish yetkisi yalnız `approved` ile açılır
- publisher approval olmadan publish açılmaz
- ana route yüzeyi minimum route chrome taşıyabilir
- yalnız fullscreen overlay açık state'te close/back davranışı overlay tarafından taşınabilir
- bu, route'u navigation shell'e çevirmek anlamına gelmez

## 6) Route/screen yapışma yasakları

Aşağıdaki karışımlar V1’de yapılmaz:

- discovery içine studio gömülmez
- auth içine watch / publish gömülmez
- live/watch içine discovery listesi gömülmez
- studio içine admin approval gömülmez
- V2/V3 yüzeyleri V1 route’larına sızmaz
- ayrı profile route açılmaz
- V1 için 1v1 route açılmaz
- V1 için payment / minute route’u açılmaz

## 7) Kısa hüküm

Bu route/screen omurgası güvenlidir çünkü her route tek bir ana kullanıcı amacı taşır. Böylece yüzeyler birbirine karışmaz, V1 dar kalır ve sonraki fazlar geldiğinde yeni alanlar mevcut route’ları şişirmeden ayrı katmanlarda büyütülebilir.
