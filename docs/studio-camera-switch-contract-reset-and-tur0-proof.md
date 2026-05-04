# Studio Camera Switch Contract Reset and Tur 0 Proof

## Kısa hüküm

- Old camera switch contract reset edildi.
- Camera switch şu an user-facing olarak disabled.
- Future work clean browser-native release-first exact deviceId contract ile başlayacak.
- Bu tur ilk implementation değildir; Tur 0 proof sonuçları foundation olarak kaydedilmiştir.

## Current repo truth

- Eski camera switch contract söküldü.
- `SwitchCamera`, `preferredFacingMode`, `switchStudioPublisherLiveVideo`, `useStudioLiveCameraSwitchSurface` gibi eski zincirler canonical değildir.
- Studio polish korunmuştur.
- Geometry artık camera switch proof'tan ayrı tutulacaktır.

## Tur 0 proof results

- acquire-first FAIL
  - aktif kamera açıkken hedef kamerayı exact deviceId ile açmak Redmi + Chrome'da `NotReadableError` üretti
- release-first PASS
  - aktif video track stop edildi
  - 150ms settle beklendi
  - hedef `videoinput` exact deviceId ile `getUserMedia` açıldı
- ön -> arka PASS
- arka -> ön PASS
- prelive 4-loop PASS
- refresh sonrası prelive 4-loop PASS
- live browser-layer proof PASS
- stop/start permission popup: hayır
- stuck state permission bug değil
- owner cleanup sonrası default front reacquire PASS
- sadece video elemente stream attach etmek yeterli değil; React preview state success commit şart

## New contract

- `videoinput` device listesi `enumerateDevices()` ile okunur.
- Aktif video `deviceId` truth'u mevcut video track settings içinden okunur.
- Hedef kamera `exact deviceId` ile seçilir.
- Device/browser release-first gerektiriyorsa current video owner önce stop edilir.
- Reacquire öncesi 150ms settle beklenir.
- Yeni stream `getUserMedia({ video: { deviceId: { exact } } })` ile istenir.
- Yeni stream attach edilir ve commit edilir.
- Preview state success commit edilir.
- Live end sonrası studio camera selection default front'a resetlenir.

## Drift guards

- `restartTrack` main path olarak geri dönmemeli.
- `setDeviceId` main path olarak geri dönmemeli.
- `facingMode` main truth olarak kullanılmamalı.
- Geometry / preview topology / LiveKit publish handoff / top chrome icon aynı turda karıştırılmamalı.
- Live implementation sonrası viewer acceptance zorunludur.
- UI icon ancak prelive/live contract pass olduktan sonra gelmelidir.

## Future tur map

- Tur B: prelive switch wiring
- Tur C: live publish switch
- Tur D: live end cleanup + default front reset
- Tur E: top chrome camera icon
- Tur F: runtime acceptance + viewer validation
