# Live Watch Surface Notice Foundation Close-out

## 1. Kısa hüküm

PASS.

Route-local surface notice foundation kuruldu.

Bu global/shared toast değildir.

Bu tur otomatik welcome notice tetiklemez.

## 2. Scope

- `/live/[username]` route-local notice provider/hook/host
- fixed route-local notice layer
- render-only notice pill
- CSS-only opacity/transform animation
- replace+restart lifecycle
- `idle` / `visible` / `exiting` phase
- timer cleanup
- invalid timing normalization

## 3. Non-scope

- drawer auth success seam
- login/register welcome trigger
- drawer visual/motion/lifecycle değişikliği
- ChatController wiring
- media/playback changes
- `/auth` route changes
- global/shared toast system
- real-device smoke

## 4. Changed files

- `src/app/(public)/live/[username]/_components/LiveWatchSurfaceNoticeProvider.tsx`
- `src/app/(public)/live/[username]/_components/LiveWatchSurfaceNotice.tsx`
- `src/app/(public)/live/[username]/_components/live-watch-surface-notice.module.css`
- `src/app/(public)/live/[username]/_components/live-watch-route-shell.tsx`
- `docs/live-watch-surface-notice-foundation-closeout.md`

## 5. No-touch verification

- `LiveWatchGuestAuthDrawer.tsx` untouched
- `LiveWatchGuestLoginForm.tsx` untouched
- `LiveWatchGuestRegisterForm.tsx` untouched
- `useLiveWatchGuestAuthViewport.ts` untouched
- `LiveWatchChatController.tsx` untouched
- media/playback files untouched
- `/auth` untouched

## 6. Behavior summary

- `useLiveWatchSurfaceNotice()` hook export edildi.
- Provider dışında hook çağrılırsa açık hata verir.
- `showNotice({ message, tone, durationMs, delayMs })` API kuruldu.
- `message.trim()` boşsa no-op.
- active notice varken yeni çağrı replace+restart yapar.
- `delayMs` görünmeden önce bekler.
- `durationMs` görünür olduktan sonra işler.
- duration bitince `exiting` phase’e geçer.
- transition/fallback cleanup sonrası `idle` / `null` olur.
- timers unmount’ta temizlenir.

## 7. Visual summary

- fixed üst-orta notice layer
- top chrome/media/drawer içine gömülü değil
- dark glass pill
- success indicator
- opacity + transform giriş/çıkış
- reduced-motion minimal

## 8. Validation

- `git diff --check`: PASS
- `npm run lint`: PASS
- `npm run build`: PASS
- forbidden file check: PASS
- `wc -l` sonucu:
  - `LiveWatchSurfaceNoticeProvider.tsx`: 253
  - `LiveWatchSurfaceNotice.tsx`: 51
  - `live-watch-surface-notice.module.css`: 105
  - `live-watch-route-shell.tsx`: 80
  - total: 489

## 9. Notes / risk

- Provider 253 satırla erken uyarı bölgesindedir ama şu an tek görev taşıdığı için kabul edildi.
- Tur 2’de provider şişirilmeyecek.
- Tur 2 yalnız drawer auth success seam + `showNotice` tüketimi olacak.

## 10. Next tur

- Tur 2 — Drawer Auth Success Seam
- Login/register success sonrası drawer kapanışından sonra `Poncik’e Hoşgeldiniz` gösterilecek.
