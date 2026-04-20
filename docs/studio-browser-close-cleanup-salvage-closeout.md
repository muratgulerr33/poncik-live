# Studio Browser-Close Cleanup Salvage Close-out

## 1. kısa hüküm

Failed refresh continuity restore zinciri worktree'den çıkarıldı; browser-close stale-live cleanup hattı korunarak salvage yapıldı. Bu kapanış global başarı değildir; yalnız browser-close cleanup'in korunması ve çalışmayan refresh continuity restore denemelerinin strip-out edilmesi içindir.

## 2. close-out scope

Bu close-out yalnız şunları kapsar:

- browser-close close-candidate touch hattının korunması
- request-side stale-live reconcile hattının korunması
- failed refresh continuity restore zincirinin worktree'den çıkarılması
- refresh continuity restore işinin deferred teknik borç olarak bırakılması

Bu close-out şunları kapsamaz:

- same-route refresh sonrası otomatik continuity restore
- UI/CSS/copy değişikliği
- public/auth/discovery yüzey redesign
- generic reconnect framework
- zero-request client mutation

## 3. commit message

`studio: salvage browser close cleanup and strip failed refresh restore`

## 4. exact changed files

- `docs/studio-browser-close-cleanup-salvage-closeout.md`
- `src/app/(public)/_lib/public-live-read.ts`
- `src/app/(studio)/studio/_adapters/studio-broadcast-adapter.ts`
- `src/app/(studio)/studio/_adapters/studio-broadcast-liveness-adapter.ts`
- `src/app/(studio)/studio/_components/useStudioPublishFoundation.ts`
- `src/app/api/studio/lifecycle/stop/route.ts`
- `src/app/(studio)/studio/_adapters/studio-refresh-continuity-adapter.ts` _(deleted)_
- `src/app/(studio)/studio/_components/useStudioPublishContinuity.ts` _(deleted)_

## 5. what was intentionally preserved

Aşağıdaki hat korunmuştur:

- browser-close close-candidate touch
- request-side stale-live reconcile
- discovery re-read / refresh sonrası stale live cleanup
- `/live/[username]` re-read / refresh sonrası stale live cleanup
- studio re-entry stale live cleanup
- explicit `X -> confirm -> Bitir` hattı

## 6. what was intentionally stripped

Aşağıdaki başarısız restore denemeleri worktree'den çıkarılmıştır:

- refresh continuity auto-restore zinciri
- refresh claim acknowledgment state machine
- continuity restore için eklenmiş restore-specific handoff/bookkeeping katmanları
- refresh auto-restore'ı zorlayan ama başarı üretmeyen deneysel continuity katmanları

## 7. automated verification

- `npm run lint` PASS
- `npm run build` PASS

## 8. manual / görsel smoke summary

Bu pencere kapsamındaki doğrulanan truth:

- user doğrulamasıyla browser-close cleanup sağlıklı çalıştı
- publisher tarayıcısı kapatıldığında stale live zinciri bırakmayan davranış korundu
- refresh continuity auto-restore bu close-out kapsamında çözülmüş sayılmadı; deferred bırakıldı

## 9. remaining deferred note

Deferred teknik borç:

- same-route refresh sonrası otomatik continuity restore

Bu alan çalışır kabul edilmez.
Bu close-out'un dışında bırakılmıştır.
İleride ayrı audit/fix turu olarak ele alınabilir.

## 10. final repo hygiene target

Bu close-out tamamlandığında beklenen final durum:

- yalnız yukarıdaki exact file set commitlenmiş olmalı
- `npm run lint` geçmiş olmalı
- `npm run build` geçmiş olmalı
- `git push origin main` geçmiş olmalı
- `git status -sb` sonucu temiz worktree göstermeli
