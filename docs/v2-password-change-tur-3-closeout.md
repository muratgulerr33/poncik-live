# V2 Password Change Tur 3 Close-out

## 1. Kısa hüküm
- PASS
- Tur 3 password change implementation owner manual smoke ile doğrulandı.
- Bu close-out implementation + doc kapanışı için yazıldı.
- Commit mesajı:
  - `feat: add password change settings flow`

## 2. Kapsam
- Password change capability `/auth?surface=settings` içine eklendi.
- Yeni route açılmadı.
- Settings sıralaması owner-final olarak korundu:
  1. username formu
  2. password formu
  3. e-posta sabit bilgisi
- Password form ayrı component olarak eklendi.
- Password action ayrı action dosyasında tutuldu.
- Password update orchestration ayrı boundary’de tutuldu.
- `auth-actions.ts` şişirilmedi.
- `auth-password-boundary.ts` sadece `hashPassword` / `verifyPassword` crypto primitive olarak kaldı.
- Username boundary zinciri bozulmadı.

## 3. Password policy
- min length: `8`
- max length: `72`
- complexity yok
- same-as-old password rejected
- password reset yok
- şifremi unuttum yok

Error copy:
- wrong current password:
  - `Eski şifre doğru değil.`
- mismatch:
  - `Yeni şifreler eşleşmiyor.`
- policy violation:
  - `Şifre 8 ile 72 karakter arasında olmalı.`
- same-as-old:
  - `Yeni şifre eski şifreyle aynı olamaz.`
- generic unavailable:
  - `Şifre şu anda güncellenemiyor. Lütfen daha sonra tekrar dene.`

Success:
- `Şifre güncellendi`

## 4. Session behavior
- Password update success sayılması için current password verify + new password validation + password hash update + session rotate birlikte tamamlanır.
- Password hash update tamamlanmadan session rotate yapılmaz.
- `replaceAccountSession(accountId)` ile session rotate yapılır.
- Session rotate başarıyla tamamlanmadan success redirect verilmez.
- Current device oturumda kalır.
- Eski sessionlar düşer.
- Owner smoke ile eski şifre login başarısız, yeni şifre login başarılı doğrulandı.

## 5. Settings UI sonucu
Default settings sırası:
1. username formu
2. password formu
3. e-posta

Password form default visible copy:
- `Eski şifre`
- `Yeni şifre`
- `Yeni şifre`
- `Güncelle`

Defaultta görünmeyenler:
- helper/kural metni
- açıklama
- password reset
- şifremi unuttum
- support fallback
- metadata kalabalığı

Success/error:
- password success yalnız `Şifre güncellendi`
- password error yalnız ilgili inline hata
- username success `Güncellendi` olarak kalır
- username success ve password success aynı anda görünmez

## 6. Korunan non-scope
- password reset yok
- şifremi unuttum yok
- email change yok
- admin settings yok
- username policy’ye dokunulmadı
- LiveKit yok
- call/payment/wallet yok
- DM/gift/social/growth yok
- DB migration yok
- new route yok
- shared/ui yok
- generic utils yok
- büyük auth split yok

## 7. Değişen dosyalar
- `src/app/(public)/auth/_components/AuthSettingsSurface.tsx`
- `src/app/(public)/auth/_components/UsernameChangeForm.tsx`
- `src/app/(public)/auth/_controllers/auth-core-controller.ts`
- `src/app/(public)/auth/_controllers/auth-surface-view.ts`
- `src/app/(public)/auth/_lib/auth-copy.ts`
- `src/app/(public)/auth/_actions/password-settings-actions.ts`
- `src/app/(public)/auth/_adapters/auth-settings-password-boundary.ts`
- `src/app/(public)/auth/_components/PasswordChangeForm.tsx`
- `docs/v2-password-change-tur-3-closeout.md`

## 8. Validation
- `git branch --show-current` -> `main`
- `git diff --check` -> PASS
- `npm run lint` -> PASS
- `npm run build` -> PASS

## 9. Playwright/headless smoke
- SKIPPED
- Sebep:
  - repo içinde Playwright setup yok
  - dependency/config/spec eklenmedi
  - owner manual smoke truth geçerli

## 10. Owner manual smoke
Owner manual smoke PASS:
- sıra doğru: kullanıcı adı -> şifre -> e-posta
- şifre formu sadece 3 input + CTA
- default helper/kural metni yok
- yanlış eski şifre doğru error
- mismatch doğru error
- kısa şifre doğru error
- same-as-old doğru error
- başarılı değişimde yalnız `Şifre güncellendi`
- eski şifre login çalışmadı
- yeni şifre login çalıştı
- username form bozulmadı
- user/publisher görebiliyor
- anonymous/admin göremiyor
- mobile keyboard davranışı temiz

## 11. Sonraki tur
- Account settings username/password temel işi kapanmıştır.
- Password reset hâlâ scope dışıdır ve self-service olarak açılmayacaktır.
- Sıradaki account settings işi ancak owner yeni scope verirse açılmalıdır.
