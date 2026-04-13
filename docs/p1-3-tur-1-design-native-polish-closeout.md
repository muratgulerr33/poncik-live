# P1.3 Tur 1 — Design/Native Polish Batch Close-out

## 1) Kısa hüküm

- PASS / KABUL
- P1.3 Tur 1 batch'i tek parça close-out ile kapanışa alındı.
- Bu batch yeni feature açmadan global substrate, font root cause, görünür Türkçe karakter düzeltmeleri, auth/studio action language standardization, `/auth` mobile segmented toggle polish ve `test-results/` cleanup prep alanlarını kapattı.

## 2) Kapanan scope

Bu batch içinde birlikte kapanan işler:

- global substrate polish:
  - typography/control sizing/focus-visible dar iyileştirmeleri
  - `--surface-3` tokenı
- Geist font root cause fix
- public discovery + live görünür Türkçe karakter / ASCII düzeltmeleri
- `/auth` + `/studio` current route-surface CTA action language standardization
- `/auth` mobile segmented toggle polish
- `test-results/` commit dışı bırakma hazırlığı

Etkilenen route'lar:

- `/`
- `/auth`
- `/live/[username]`
- `/studio`

## 3) Root cause ve design-level önemli düzeltmeler

### Geist font

- Sorun `Geist` asset'inin gelmemesi değildi.
- Root cause, `geist.variable` bağının `body` üzerinde kalması ve `:root` üzerindeki `--font-sans` / `--font-display` zincirinin bu yüzden invalid resolve olmasıydı.
- Dar fix ile font variable scope doğru elemana taşındı ve gerçek render `Times` fallback'ine düşmez hale geldi.

### Global substrate

- Global token/typography zemini dar biçimde güçlendirildi.
- Control sizing, focus-visible ve base text rendering substrate seviyesinde toparlandı.
- `live-watch.module.css` tarafında kullanılan `--surface-3` tokenı global truth'a eklendi.

### Public görünür copy düzeltmeleri

- Türkçe karakter / ASCII bozulmaları yalnız kanıtlı public discovery/live görünür metinlerle sınırlı düzeltildi.
- Auth/studio dışı ek copy sweep yapılmadı.

### Auth/studio action language

- Bu iş named bug-fix olarak değil, `/auth` + `/studio` small-surface action language standardization olarak ele alındı.
- Link ve button aynı global recipe'de toplandı:
  - `.ui-action`
  - `.ui-action-primary`
  - `.ui-action-secondary`
- `--primary-foreground` körlemesine değiştirilmedi.
- Action foreground için ayrı action tokenları kullanıldı; böylece dark surface üstünde violet primary aksiyonda koyu/siyah metin sorunu dar ve güvenli biçimde kapandı.
- `AdminApprovalRow` içindeki `reject` aksiyonu bilinçli scope freniyle destructive varyanta çıkarılmadı; secondary recipe içinde kaldı.

### `/auth` mobile segmented toggle

- Root cause toggle mantığı değil, mobil dar genişlikte `inline-flex + flex-wrap` dağılımının intrinsic text width ile kırılmasıydı.
- `390x844` ve `360x800` smoke'ta ikinci satıra düşme kanıtlandı.
- Dar route-local CSS fix ile:
  - kapsül iç padding/gap azaltıldı
  - item yatay padding daraltıldı
  - font-size/line-height hafif sıkılaştırıldı
  - son adımda mobilde 3 kolonlu eşit dağılım verildi
- Sonuçta segmented toggle tek kapsül içinde tek satıra toplandı.
- `360` genişlikte görünüm kabul edilebilir seviyede kaldı; `390` kadar ferah değil, ama kırık değil.

## 4) Bilerek dışarıda bırakılan alanlar

Bu close-out batch'inde açılmayanlar:

- navigation-heavy header/shell breadth turu
- discovery redesign breadth
- public watch redesign breadth
- media ratio / `P1.1`
- public surface/cover breadth / `P1.2`
- `shared/ui` açılımı
- shell / navigation / media için generic abstraction
- yeni button component
- yeni typography expansion turu
- studio/publish lifecycle redesign
- approval/permission mantığı değişikliği
- DB/schema

## 5) Command-verified sanity

- `npm run lint`: PASS
- `npm run build`: PASS

Bu close-out turunda yeni Playwright testi koşturulmadı.

## 6) Manuel smoke / gerçek cihaz notu

- Batch boyunca gerçek browser smoke ve gerçek cihaz odaklı mobil doğrulama alındı.
- `/auth` mobile segmented toggle kırığı kapatıldı.
- `/auth` + `/studio` CTA standardization görsel olarak doğrulandı; `/studio` canlı browser smoke'u auth gate nedeniyle sınırlı kaldığında code-truth ile desteklendi.
- Public discovery/live görünür copy ve font/render tarafı batch bağlamında doğrulandı.

## 7) Git / worktree / push notu

- `test-results/` commit dışı bırakıldı.
- Close-out için tek markdown dokümanı üretildi.
- Batch'e ait gerçek değişiklikler tek commit altında toplanır.
- Push hedefi `origin/main`dir.
- Kapanış hedefi temiz worktree'dir.

## 8) Unknown / dürüst not

- Bu doküman batch close-out'tur; yeni polish turu açmaz.
- Playwright close-out koşusu bu turda özellikle yapılmadı.
- `360` genişlikte segmented toggle daha sıkı görünür; mevcut kabul çizgisi kırık olmayan, okunabilir ve tek satırlı segmented görünüm düzeyidir.
