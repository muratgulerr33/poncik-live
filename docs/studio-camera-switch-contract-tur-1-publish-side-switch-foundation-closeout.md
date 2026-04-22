# Studio Camera Switch Contract Tur 1 / Publish-Side Switch Foundation Close-Out

## 1. kısa hüküm

Bu kapanış yalnız Studio Camera Switch Contract Tur 1 publish-side switch foundation close-out'udur; feature close-out değildir.

## 2. scope

Bu tur yalnız publish-side switch foundation yüzeyini, compile/scope doğrulamasını ve dar write-set kapanışını kapsar.

## 3. changed files

- `docs/studio-camera-switch-contract-tur-1-publish-side-switch-foundation-closeout.md`
- `src/app/(studio)/studio/_adapters/studio-livekit-publisher-adapter.ts`
- `src/app/(studio)/studio/_components/useStudioPublishFoundation.ts`
- `src/app/(studio)/studio/_components/useStudioLiveCameraSwitchSurface.ts`

## 4. exact ne kapandı

- Publish-side camera switch foundation için tagged object result contract eklendi.
- Exact `deviceId` ile candidate camera track acquire eden adapter seam eklendi.
- Current live camera owner üstünde publish-side mutate attempt foundation'ı eklendi.
- `useStudioPublishFoundation` içine dar delegasyon seam'i eklendi.
- `useStudioLiveCameraSwitchSurface` içinde single-flight pending guard eklendi.

## 5. neye özellikle dokunulmadı

- Preview commit / catch-up
- Rollback final behavior
- Visible UI wiring
- Preview owner hattı
- Lifecycle/liveness/refresh alanları
- Generic/shared abstraction

## 6. lint sonucu

- `npm run lint`: PASS

## 7. build sonucu

- `npm run build`: PASS

## 8. terminal sanity özeti

- Write-set dar kaldı.
- Locked file drift yok.
- `git diff --name-only` yalnız tracked write-set dosyalarını gösterdi.
- Yeni hook dosyası untracked olarak `git status -sb` içinde doğrulandı.
- Foundation surface compile-clean durumda.

## 9. manual sanity note

- Manual browser/device mutate smoke: NOT RUN in this tur

## 10. risk / unknown

- Gerçek publish-side mutate path browser/device ortamında henüz doğrulanmadı.
- Bu kapanış compile/scope/foundation close-out'udur.

## 11. final worktree durumu

- Commit ve push sonrası `git status -sb` ile temiz worktree doğrulanacaktır.
