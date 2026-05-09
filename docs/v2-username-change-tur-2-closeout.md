# V2 Username Change Tur 2 Close-out

## 1. Kısa hüküm
- PASS
- Implementation commit:
  - `3cf0caa05599a780a59fe36a2503eb45c7333b41`
  - `feat: add username change settings flow`
- Bu doküman doc-only close-out’tur.

## 2. Kapsam
- Username change capability eklendi.
- Final username policy üç write path’te uygulandı:
  - user register
  - publisher register
  - settings username change
- Settings surface username formu gerçek capability oldu.
- Authenticated `user|publisher` için `Ayarlar` menü item’ı görünür oldu.
- Anonymous/admin için `Ayarlar` görünmez kaldı.
- Public live path helper eklendi/kullanıldı.
- Publisher live guard korundu.
- Minimal settings UI cleanup yapıldı.

## 3. Final username policy
- length 3-24
- allowed: `a-z`, `0-9`, `.`, `-`, `_`
- uppercase yok
- Türkçe/non-ASCII yok
- boşluk yok
- `/ % & + ? # @` yok
- başta/sonda `.`, `-`, `_` yok
- `..` yok
- reserved:
  - `auth`
  - `api`
  - `studio`
  - `live`
  - `admin`
  - `settings`
  - `account`
  - `profile`
  - `support`
- cooldown yok
- silent trim yok
- silent lowercase yok
- silent transliteration yok
- DB migration yok
- existing username normalize yok

## 4. Settings UI sonucu
Default settings ekranında kalan metinler:
- `Kullanıcı adı`
- `Yeni kullanıcı adı`
- input value olarak mevcut username
- `Güncelle`
- `E-posta`
- e-posta değeri

Kaldırılan default metinler:
- `Yayıncı hesabı`
- `Yayıncı hesabın`
- `Hesap ayarları`
- `Hesabındaki bilgiler`
- `Kullanıcı adını güncelle`
- `Kullanıcı adını buradan güncelleyebilirsin.`
- `Mevcut kullanıcı adı:`
- default helper/kural metinleri
- `E-posta ve şifre bu turda değiştirilemez.`
- `Kayıtlı bilgiler`
- `Rol`
- `Hesap durumu`
- `Hesabıma dön`
- uzun success mesajları

Success:
- yalnız `Güncellendi`

Error:
- yalnız ilgili inline error mesajı

## 5. Public live path / legacy username davranışı
- Existing raw username display korunur.
- Existing DB username’leri migrate/normalize edilmedi.
- Public live href/revalidate path üretimi domain-specific helper üzerinden güvenli hale getirildi.
- LiveKit transport redesign yapılmadı.
- LiveKit room/identity truth accountId bazlı kalır.

## 6. Publisher live guard
- Publisher public live broadcast varken username change bloklanır.
- Degraded state fail-closed kabul edilir.
- Idle state username change’e izin verir.
- V2 active private session guard bu turda eklenmedi; future guard olarak kalır.

## 7. Korunan non-scope
- password change yok
- password reset yok
- email change yok
- admin settings yok
- DB migration yok
- existing username normalize yok
- legacy auto-fix yok
- 1v1/call/payment/wallet yok
- DM/gift/social/growth yok
- LiveKit transport redesign yok
- shared/ui yok
- generic utils yok
- büyük auth split yok

## 8. Değişen implementation dosyaları
- `src/app/(public)/_lib/public-live-path.ts`
- `src/app/(public)/_lib/public-live-read.ts`
- `src/app/(public)/auth/_actions/settings-actions.ts`
- `src/app/(public)/auth/_adapters/auth-account-boundary.ts`
- `src/app/(public)/auth/_adapters/auth-settings-account-boundary.ts`
- `src/app/(public)/auth/_adapters/auth-publisher-register-boundary.ts`
- `src/app/(public)/auth/_adapters/auth-user-register-boundary.ts`
- `src/app/(public)/auth/_components/AuthSettingsSurface.tsx`
- `src/app/(public)/auth/_components/AuthShell.tsx`
- `src/app/(public)/auth/_components/PublisherRegisterForm.tsx`
- `src/app/(public)/auth/_components/UserRegisterForm.tsx`
- `src/app/(public)/auth/_components/UsernameChangeForm.tsx`
- `src/app/(public)/auth/_components/auth-settings.module.css`
- `src/app/(public)/auth/_controllers/auth-core-controller.ts`
- `src/app/(public)/auth/_controllers/auth-surface-view.ts`
- `src/app/(public)/auth/_lib/auth-copy.ts`
- `src/app/(public)/auth/_lib/auth-username-policy.ts`
- `src/app/(public)/auth/page.tsx`
- `src/app/(studio)/studio/_actions/studio-lifecycle-actions.ts`
- `src/app/(studio)/studio/_adapters/studio-broadcast-liveness-adapter.ts`
- `src/app/(studio)/studio/_adapters/studio-broadcast-stop-adapter.ts`

## 9. Validation
- implementation turunda:
  - `git diff --check` PASS
  - `npm run lint` PASS
  - `npm run build` PASS
- doc-only turunda tekrar:
  - `git diff --check`
  - `npm run lint`
  - `npm run build`

## 10. Manual smoke notları
Owner manual smoke ile doğrulananlar:
- minimal settings UI PASS
- success message yalnız `Güncellendi` PASS
- Türkçe/non-ASCII invalid username reject PASS
- örnek `ö` içeren username doğru reddedildi
- hata mesajı doğru:
  - `Kullanıcı adı yalnız küçük harf, rakam, nokta, tire ve alt tire içerebilir.`

## 11. Sonraki tur
- Sıradaki account settings işi password change audit/calibration olabilir.
- Password reset / şifremi unuttum scope dışı kalır.
- Önce audit, sonra plan-only, sonra implementation yapılmalı.
