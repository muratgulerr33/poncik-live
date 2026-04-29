# Poncik Live Radix Auth Surface Tur 1 Close-out

## 1. Kısa hüküm

PASS WITH NOTES.

- Android / Redmi Note 11 Pro gerçek cihaz smoke owner tarafından PASS gözlendi.
- Keyboard/focus/CTA erişilebilirliği Android’de PASS.
- Final native polish sonrası görünüm owner tarafından onaylandı.
- Tur 1 + layering fix + final native polish tamamlandı.
- iPhone Safari gerçek cihaz testi bu commit öncesi yapılmadı; deploy sonrası manuel Apple/iPhone test notu pending olarak kalır.
- Owner kabul notu: Apple/iPhone tarafında scroll gerekse bile input/CTA erişilebilirliği korunuyorsa kabul edilebilir; final gerçek iPhone doğrulaması ayrıca yapılacak.

## 2. Scope

- Direct `@radix-ui/react-dialog` dependency.
- Route-local full-screen/page-like guest auth surface.
- Existing login/register forms reuse.
- Guest CTA open/close seam.
- Auth surface açıkken guest CTA render edilmez.
- Layering bug fix.
- Final keyboard-safe native polish.
- Legacy drawer quarantine.

## 3. Changed files

- `package.json`
- mevcut lockfile: `package-lock.json`
- `src/app/(public)/live/[username]/_components/LiveWatchGuestAuthSurface.tsx`
- `src/app/(public)/live/[username]/_components/live-watch-guest-auth-surface.module.css`
- `src/app/(public)/live/[username]/_components/LiveWatchGuestLoginForm.tsx`
- `src/app/(public)/live/[username]/_components/LiveWatchGuestRegisterForm.tsx`
- `src/app/(public)/live/[username]/_components/LiveWatchChatSurface.tsx`
- `src/app/(public)/live/[username]/_controllers/LiveWatchChatController.tsx`
- `docs/live-watch-radix-auth-surface-tur-1-closeout.md`

Not:

- `git diff --name-only` yalnız tracked dosyaları listeler.
- `git status -sb` çıktısı ayrıca yeni auth surface dosyalarını untracked olarak göstermektedir.

## 4. Dependency

- `@radix-ui/react-dialog` eklendi.
- Forbidden dependency eklenmedi:
  - `vaul` yok
  - `clsx` yok
  - `tailwind-merge` yok
  - `class-variance-authority` yok
- shadcn generated `components/ui` yok.
- `shared/ui` yok.

## 5. New surface behavior

- Guest CTA yeni `LiveWatchGuestAuthSurface` açıyor.
- X close same route live yüzeye döndürüyor.
- Overlay, Escape ve close aynı seam’e bağlı.
- Mobile back/gesture bu tur scope dışı.
- Auth success seam mevcut davranışı koruyor; close sonrası mevcut refresh/notices hattı korunuyor.

## 6. Form reuse / CSS migration

- Form markup değişmedi.
- Action state değişmedi.
- `onSuccess` API değişmedi.
- `data-live-auth-field` ve `data-live-auth-submit` markerları korundu.
- Formlar yeni surface CSS module’a bağlandı.
- Legacy drawer birebir runnable visual garanti edilmez; bu bilinçli quarantine kabulüdür.
- Eski `LiveWatchGuestAuthDrawer` dosyaları silinmedi veya rename edilmedi.
- Guest CTA artık yeni surface active path’ine bağlıysa legacy drawer active production path’ten çıkmıştır; bu bilinçli legacy quarantine’dır.

## 7. Layering bug fix

- `isAuthSurfaceOpen` prop ile guest CTA auth surface açıkken render edilmiyor.
- Overlay/content `z-index` route-local olarak netleştirildi.
- CTA artık surface üstüne binmiyor.
- Android owner smoke gözlemine göre layering bug fix PASS.

## 8. No-touch verification

Aşağıdaki alanlarda diff yoktur ve bu turda dokunulmamıştır:

- `useLiveWatchPlayback`
- `LiveWatchPlaybackController` reconnect logic
- `viewerConnectionKey` logic
- token API
- `canPublishData` policy
- chat realtime transport
- notice provider
- DB/migrations
- `/auth` route
- publisher register
- admin
- V2/V3/topup/payment

Ek doğrulama:

- Yeni active implementation içinde `Sheet`, `Drawer`, `Vaul` veya shadcn generated global UI yok.
- Legacy drawer dosyalarındaki mevcut `Drawer` ismi bilinçli quarantine kapsamındadır.
- `/auth` redirect yok.
- full page reload yok.
- router refresh loop yok.
- local fake broadcast yok.
- chat submit hack yok.

## 9. Validation results

### `git diff --check`

- PASS

### `npm run lint`

- PASS
- Exit code `0`
- Diagnostic üretilmedi

### `npm run build`

- PASS
- `Compiled successfully`
- `Running TypeScript ... Finished TypeScript`
- `/live/[username]` route build içinde başarılı üretildi

### `git diff --name-only`

```text
package-lock.json
package.json
src/app/(public)/live/[username]/_components/LiveWatchChatSurface.tsx
src/app/(public)/live/[username]/_components/LiveWatchGuestLoginForm.tsx
src/app/(public)/live/[username]/_components/LiveWatchGuestRegisterForm.tsx
src/app/(public)/live/[username]/_controllers/LiveWatchChatController.tsx
```

### `git status -sb`

```text
## main...origin/main
 M package-lock.json
 M package.json
 M src/app/(public)/live/[username]/_components/LiveWatchChatSurface.tsx
 M src/app/(public)/live/[username]/_components/LiveWatchGuestLoginForm.tsx
 M src/app/(public)/live/[username]/_components/LiveWatchGuestRegisterForm.tsx
 M src/app/(public)/live/[username]/_controllers/LiveWatchChatController.tsx
?? docs/live-watch-radix-auth-surface-tur-1-closeout.md
?? src/app/(public)/live/[username]/_components/LiveWatchGuestAuthSurface.tsx
?? src/app/(public)/live/[username]/_components/live-watch-guest-auth-surface.module.css
```

## 10. Manual smoke

Android manual smoke final sonucu:

- surface open PASS
- X close PASS
- Login/Register tabs PASS
- Login form PASS
- Register form PASS
- Register e-posta focus + keyboard PASS
- Register kullanıcı adı focus + keyboard PASS
- Register şifre focus + keyboard + CTA PASS
- Login şifre focus + keyboard + CTA PASS
- password/autofill bar varken CTA erişilebilir PASS
- guest CTA layering bug fixed PASS
- auth success notice PASS
- auth success sonrası composer/live yüzey PASS

Additional notes:

- Browser manual smoke terminalde yapılmadı.
- iPhone gerçek cihaz smoke henüz yapılmadı.

## 11. Final polish note

- Card normal-flow/flex yaklaşımıyla daha native/premium hale getirildi.
- Keyboard davranışını bozan önceki probe yaklaşımları uygulanmadı.
- Input/CTA erişilebilirliği korunacak şekilde CSS-only polish yapıldı.
- Active tab / track double-edge hissi hafif yumuşatıldı.
- Surface drawer/bottom-sheet geometrisine döndürülmedi.

## 12. iPhone pending note

- iPhone Safari gerçek cihaz testi henüz yapılmadı.
- Push sonrası Vercel deploy üzerinden BrowserStack ve gerçek iPhone 14 Pro remote/manual test yapılacak.
- Bu commit iPhone testini bloklamaz; not `pending` olarak kalır.

## 13. Known remaining checks

- iPhone Safari gerçek cihaz.
- BrowserStack after deploy.
- Arkadaşın iPhone 14 Pro remote test.
- Final checkpoint commit/push/deploy sonrası yapılacak.

## 14. Legacy drawer quarantine

- Eski drawer dosyaları silinmedi.
- Guest CTA artık yeni Radix auth surface’e bağlı.
- Eski drawer active production guest auth path’ten çıkarılmışsa bu bilinçli legacy quarantine’dır.
- Legacy drawer cleanup/rename/removal ayrı tur kararıdır.

## 15. Commit/push status

- Commit yapılmadı.
- Push yapılmadı.
