# PR-9 Final Hardening — Close-out

## 1) Kisa hukum

- PASS / KABUL
- PR-9, authenticated `/auth` ve authenticated `/studio` icin visible-idle freshness kapanisini route-local olarak tamamlar.

## 2) Scope denetimi

Bu turda kapananlar:
- authenticated `/auth` visible-idle freshness
- authenticated `/studio` visible-idle freshness
- same-tab admin queue davranisini bozmadan cross-tab visible-idle kapanisi
- visible-only kucuk interval fallback
- hidden-tab stop

Bilerek disarida kalanlar:
- orphan-live
- browser-close auto-stop
- discovery redesign veya discovery breadth
- provider / LiveKit
- remote playback
- viewer count persistence
- payment / minute / 1v1
- shared/ui
- generic abstraction

## 3) Dogrulanan teknik cikti

- `CurrentSessionPanel` icinde route-local `AuthFreshness` calisir; anonymous auth form yuzeyi bu fixin disinda kalir.
- `StudioShell` icinde route-local `StudioFreshness` calisir.
- Auth ve studio freshness:
  - `focus`
  - `visibilitychange`
  - `pageshow`
  eventlerini korur.
- Auth ve studio freshness icin visible-only `10s` interval fallback eklenir.
- Hidden tabda interval durur; visible donusunde refresh ve tek interval yeniden kurulur.
- `AdminApprovalRow` same-tab submit sonrasi mevcut current-route refresh davranisini korur.
- `approval-actions.ts` icindeki `/studio` invalidation korunur.
- Studio truth prep'e izin vermiyorsa refresh sonrasi prep branch unmount olur; mevcut preview cleanup zinciri stale preview'i acikta birakmaz.

## 4) Command-verified sanity ozeti

- `npm run lint`: PASS
- `npm run build`: PASS
- `/`: `200`
- `/auth`: `200`
- `/live/test-user`: `200`
- anonymous `/studio`: `307` -> `/auth?next=/studio`

## 5) Operator-verified manual smoke ozeti

- Auth / studio visible-idle smoke:
  - 1 PASS
  - 2 PASS
  - 3 PASS
  - 4 PASS
  - 5 PASS
  - 6 PASS
  - 7 PASS
  - 8 PASS / N.A. (V1 icinde approved -> reject akisi kurulmamisti)
  - 9 PASS
  - 10 PASS
- `last login wins` calisiyor.
- Auth ve studio visible-only `_rsc` refresh yaklasik `10s` seviyesinde gozlendi.
- Hidden tabda work duruyor.
- Discovery bu exact fix turunda yeniden genisletilmedi.

## 6) Changed files / diff ozeti

- `docs/pr-9-final-hardening-closeout.md`
- `src/app/(public)/auth/_actions/approval-actions.ts`
- `src/app/(public)/auth/_components/AdminApprovalRow.tsx`
- `src/app/(public)/auth/_components/CurrentSessionPanel.tsx`
- `src/app/(public)/auth/_components/AuthFreshness.tsx`
- `src/app/(studio)/studio/_components/StudioShell.tsx`
- `src/app/(studio)/studio/_components/StudioFreshness.tsx`

Not:
- Scope disi local discovery denemesi close-out oncesi worktree'den cikartildi; PR-9 commitine alinmadi.

## 7) Worktree ve teslim notu

- PR-9 close-out bu dokumanla repo icine kaydedildi.
- Final commit yalniz PR-9 authenticated auth/studio freshness kapsamindaki dosyalari tasir.
- Close-out sonunda worktree temiz birakilmalidir.

## 8) Acik kalan kucuk follow-up / risk

- Orphan-live bu PR icinde cozulmedi; ayri lifecycle hardening follow-up'i olarak kalir.
- Discovery bu exact fix turunda yeni kapsam olarak genisletilmedi.
- Browser event davranislari route-local freshness ile sertlestirildi; command-verified kisim route health ile, visible-idle davranis operator smoke ile ayrica dogrulandi.

## 9) Merge notu

- PR-9 merge notu: authenticated `/auth` ve `/studio` visible-idle freshness route-local event + visible-only interval fallback ile kapatildi; same-tab admin queue korunurken cross-tab drift yenilemesi tamamlandi. Discovery breadth ve orphan-live bu PR'in disinda tutuldu.
