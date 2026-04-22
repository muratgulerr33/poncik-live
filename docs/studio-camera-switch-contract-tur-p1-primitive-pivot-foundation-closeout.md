1. kısa hüküm

PASS. Bu kapanış yalnız foundation/compile/scope close-out’udur; feature acceptance close-out’u değildir. Tur P1’de wrong switch primitive switch path’ten çıkarıldı ve same-owner publish-side path’e dönüldü.

2. close-out doc path

`docs/studio-camera-switch-contract-tur-p1-primitive-pivot-foundation-closeout.md`

3. changed files

- `docs/studio-camera-switch-contract-tur-p1-primitive-pivot-foundation-closeout.md`
- `src/app/(studio)/studio/_adapters/studio-livekit-publisher-adapter.ts`

4. exact primitive neye pivot edildi

- Old second-camera acquire-first mainline switch path’ten çıkarıldı.
- Separate candidate `getUserMedia({ video: { deviceId: { exact }}})` + `replaceTrack(...)` switch mainline’ı kaldırıldı.
- Switch same-owner active live video owner üstüne taşındı.
- Practical main path dürüstçe `setDeviceId(deviceId)` kaldı.
- `restartTrack({ facingMode })` helper yalnız dar deterministic durumda devreye giriyor; primary runtime path olarak genelleştirilmedi.

5. neye özellikle dokunulmadı

- `src/app/(studio)/studio/_components/useStudioPublishFoundation.ts`
- `src/app/(studio)/studio/_components/useStudioLiveCameraSwitchSurface.ts`
- preview/bootstrap alanı
- visible control wiring
- preview commit
- rollback behavior
- device-manager / hidden mapping sistemi

6. lint sonucu

PASS. `npm run lint`

7. build sonucu

PASS. `npm run build`

8. terminal sanity check özeti

- Write-set tek implementation dosyasında kaldı: `src/app/(studio)/studio/_adapters/studio-livekit-publisher-adapter.ts`
- Locked file drift grep boş döndü.
- `git diff --name-only` yalnız adapter dosyasını gösterdi.
- Switch path grep sonucu publisher adapter içinde `restartTrack` ve `setDeviceId` gördü; switch path’te publisher adapter içinde artık candidate `getUserMedia` yok.
- `git status -sb` close-out öncesi yalnız adapter modified idi; close-out sonrası adapter + close-out doc stage edildi.

9. manual sanity note

Manual browser/device smoke: NOT RUN in this tur.

10. risk / unknown

- Runtime/device validation bu turda yapılmamıştır.
- Practical main path `setDeviceId(deviceId)` olduğu için gerçek browser/device davranışı manuel smoke olmadan doğrulanmış sayılmaz.
- `restartTrack({ facingMode })` helper yalnız dar deterministic durumda devreye girdiği için feature-ready yorumu yapılmaz.
- Bu kapanış feature ready değil; foundation/scope close-out PASS’tir.

11. merge-ready mi değil mi

Foundation/scope close-out açısından PASS. Feature acceptance ve runtime/device validation yapılmadığı için feature-ready denmez.
