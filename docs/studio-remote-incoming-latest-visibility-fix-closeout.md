# Studio Remote Incoming Latest Visibility Fix Close-out

## 1. kısa hüküm

Studio mobile remote incoming latest visibility bug fix tamamlandı.

Bu global chat completion değildir. Yalnız `/studio` owner chat history/latest visibility fix’idir.

## 2. bug

Gerçek mobil cihaz testinde, `/live/[username]` izleyici yüzeyinden gelen realtime remote mesaj Studio tarafına düşüyordu.

History scroll edilecek kadar doluyken gelen son remote mesaj Studio composer altında / alt sınırda yarım görünüyordu. Yayıncı mesajı tam görmek için minicik manuel scroll yapmak zorunda kalıyordu.

Aynı sorun `/live/[username]` viewer yüzeyinde görülmedi.

## 3. root cause

Remote incoming append sonrası eski scroll davranışı render/layout tamamlanmadan `setTimeout(0) + smooth scroll` ile alta inmeye çalışıyordu.

Mobile Studio’da history doluyken bu davranış son mesajın composer üstünde tam görünmesini gsini yalnız `messages.length`e bağlamak güvenli değildi; çünkü history 100 mesaj cap’ine ulaştığında yeni mesaj append edilse bile length sabit kalabilir.

## 4. changed files

- `src/app/(studio)/studio/_components/StudioChatOwners.tsx`
- `src/app/(studio)/studio/_components/studio-chat-owners.module.css`
- `docs/studio-remote-incoming-latest-visibility-fix-closeout.md`

## 5. yapılan iş

- Remote incoming path own-send path’ten ayrıldı.
- Duplicate guard sonrası append öncesi canlı `bottomGap` ölçümü yapıldı.
- `bottomGap <= 32` ise remote latest correction işaretlendi.
- 100 message cap altında güvenli olması için `remoteLatestCorrectionSequence` kullanıldı.
- Render/layout sonrası direct path’te smooth scroll kullanılmadı.
- Gerekirse tek final direct correction daha yapılacak şekilde dar güvenlik eklendi.
- Parked/manual scroll davranışı korundu.
- Own-send path redesign edilmedi.
- Studio chat owner CSS’inde dar row / min-height / overflow / bottom visibility reserve düzeltmesi yapıldı.

## 6. özellikle yapılmayanlar

- `/live/[username]` dosyalarına dokunulmadı.
- LiveKit transport helper’larına dokunulmadı.
- Packet protocol helper’a dokunulmadı.
- Token/grant dosyalarına dokunulmadı.
- DB/schema/migration yok.
- Top chrome yok.
- Media geometry/video ratio yok.
- Shared/global abstraction yok.
- Generic hook/util yok.
- Composer redesign yok.
- Yeni feature yok.

## 7. validation

- `npm run lint`: PASS
- `npm run build`: PASS

## 8. manual smoke

Owner gerçek cihazda PASS bildirdi.

Kontrol edilenler:

- Studio mobile’da history doluyken viewer remote mesaj gönderdi.
- Son remote mesaj tam göründü.
- Mesaj composer altında yarım kalmadı.
- Yayıncı minı.
- Own-send davranışı bozulmadı.
- Parked/manual scroll davranışı bozulmadı.
- Vertical scroll çalışmaya devam etti.
- Composer görünüm/konum bozulmadı.
- Realtime seam bozulmadı.
- `/live/[username]` etkilenmedi.

## 9. commit

Commit message:

`studio: fix incoming chat latest visibility`

## 10. tek cümlelik karar

Studio mobile remote incoming latest visibility bug dar route-local scope’ta kapatıldı; transport, DB, Live Watch ve composer redesign alanlarına dokunulmadı.
