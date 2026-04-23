# kısa hüküm

- kamera switch geometry-safe ve repeatable şekilde kapanmadı
- geometry regression üreten son checkpoint revert edildi
- alan technical debt olarak deferred bırakıldı

# neden revert edildi

- son checkpoint geometry regression üretti
- stable geometry / studio baseline daha kritik
- repeated front/back switch güvenilir biçimde kapanmadı

# mevcut dürüst baseline

- geometri bozulmayan baseline tercih edildi
- repeated front/back switching solved denmiyor
- capability sınırlı / unreliable / technical debt

# kronolojik deneme özeti

## `f3916a8` `studio: checkpoint reverse switch primitive correction`

- reverse switch primitive path’i facing intent ile daha doğru çalıştırılmaya çalışıldı
- umut edilen şey rear -> front geçişte yanlış primitive seçimini kapatmaktı
- request şekli ve facing intent tarafında ilerleme sağlandı
- fakat repeated switching güvenilir biçimde kapanmadı
- feature close-out olmadı çünkü aynı live session içinde problem tekrar üretilebildi

## `d900f8e` `studio: checkpoint reverse switch preview coordination`

- preview-owner tarafında reverse switch coordination denendi
- umut edilen şey preview-held holder kaynak contention’ına katkı veriyorsa bunu azaltmaktı
- preview-owner hypothesis test edildi
- bu çizgi geometry/preview davranışını da etkileyen bir aileye açıldı
- feature close-out olmadı çünkü preview-owner hypothesis yeterli olmadı

## `88edf0a` revert of preview coordination

- preview coordination ailesi geri alındı
- amaç geometry ve preview tarafındaki yan etkileri temizlemekti
- bu revert sonrasında geometry baseline toparlandı
- fakat repeated switch problemi çözülmüş sayılmadı

## `36f99a6` `studio: checkpoint camera owner handoff validation`

- publish-owner handoff doğrulama çizgisi açıldı
- umut edilen şey aynı owner üzerinde tekrar tekrar mutate etmek yerine fresh owner handoff ile repeated switch’i normalize etmekti
- publish-owner handoff line denendi
- fakat bu çizgi güvenilir feature close-out seviyesinde kapanmadı
- publish-owner handoff line güvenilir kapanmadı

## `a1dae4e` revert of camera owner handoff validation

- handoff validation checkpoint’i geri alındı
- amaç güvenilir kapanmayan publish-owner denemesini baseline’dan çıkarmaktı
- bu revert adapter tarafını daha sade bir baseline’a döndürdü
- repeated switch alanı yine unresolved kaldı

## `b9d5434` `studio: checkpoint geometry-safe release finalization v2`

- geometry-safe kalmaya çalışırken publish-side release/finalization v2 denendi
- umut edilen şey preview geometry ailesini açmadan repeated switch davranışını iyileştirmekti
- bu ailede release/finalization, bounded settle ve retry mantığı denenmiş oldu
- son checkpoint geometry regression ile ilişkilendirildi ve güvenli baseline önceliği nedeniyle kapatıldı
- feature close-out olmadı çünkü repeated switch yine güvenilir kabul edilemedi

## bu turdaki revert

- `b9d543416b655ec9e4964c1a276bcf47f2e651af` geri alındı
- amaç yeni fix yazmak değil, geometry-safe baseline’a dönmekti
- sonuç honest defer / technical-debt close-out olarak bırakıldı

# attempted directions / learned truths

## güçlü kanıtlar

- repeated camera switching aynı live session içinde güvenilir kapanmadı
- geometry-safe baseline ürün açısından switch denemelerinden daha kritik
- preview geometry ailesi açıldığında yan etki riski yükseliyor
- bare device probing ve runtime failures publish/live owner tarafında daha derin release/finalization sorusu olduğunu işaret etti

## başarısız / yetersiz hipotezler

- preview-owner hypothesis tek başına yeterli olmadı
- reverse switch primitive correction tek başına repeatable çözüm vermedi
- publish-owner handoff line güvenilir ve kabul edilebilir kapanış seviyesine gelmedi

## açık unknown’lar

- repeated switching failure’ın kesin root cause’u tek bir primitive ile izole edilmedi
- publish owner release/finalization zincirinin hangi runtime/device kombinasyonunda bozulduğu tam kapanmadı
- reliable fix için hangi minimum owner truth / release truth kombinasyonunun yeterli olduğu açık kaldı

# technical debt hükmü

- repeated front/back switching future technical debt’tir
- geometry-safe baseline korunmalıdır
- future fix geometry ailesiyle karıştırılmamalıdır

# future drift guard

- geometry / preview topology ile switch fix aynı turda karıştırılmamalı
- write-set dar tutulmalı
- runtime device validation zorunlu
- bu doc future restart point’tir

# exact reverted checkpoint

- SHA: `b9d543416b655ec9e4964c1a276bcf47f2e651af`
- message: `studio: checkpoint geometry-safe release finalization v2`

# changed files

- reverted adapter path: `src/app/(studio)/studio/_adapters/studio-livekit-publisher-adapter.ts`
- `docs/studio-camera-switch-technical-debt-closeout.md`
