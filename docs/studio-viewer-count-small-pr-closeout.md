# Studio Viewer Count Small PR Close-Out

## 1. Kısa hüküm

- PASS WITH NOTES
- Studio viewer count small PR implementation tamamlandı.
- Static validation gate'leri geçti.
- Owner manual smoke bu CLI ortamında authenticated Studio runtime üzerinde command-verified alınamadı; required owner smoke checklist aşağıda close-out'a sabitlendi.

## 2. Scope

- Studio-only viewer count
- live-state-only visibility
- LiveKit `remoteParticipants.size` source
- route-local hook
- TopChrome render-only metric

## 3. Changed files

- `src/app/(studio)/studio/_components/useStudioViewerCountMetric.ts`
- `src/app/(studio)/studio/_components/StudioPrepSurface.tsx`
- `src/app/(studio)/studio/_components/StudioPreviewPanel.tsx`
- `src/app/(studio)/studio/_components/studio-route-shell.tsx`
- `src/app/(studio)/studio/_components/StudioTopChrome.tsx`
- `src/app/(studio)/studio/_components/studio-top-chrome.module.css`
- `docs/studio-viewer-count-small-pr-closeout.md`

## 4. Preserved boundaries

- DB yok
- polling yok
- analytics / history / persistence yok
- Live viewer source yok
- media geometry yok
- `StudioPreviewPanel` içine count lifecycle / listener / UI girmedi
- `StudioTopChrome` içine Room / event logic girmedi

## 5. Implementation summary

- Yeni route-local `useStudioViewerCountMetric()` hook'u `Room | null` alıyor ve viewer count truth'unu yalnız `room.remoteParticipants.size` üzerinden okuyor.
- Hook yalnız `RoomEvent.ParticipantConnected`, `RoomEvent.ParticipantDisconnected`, `RoomEvent.Reconnected` ve `RoomEvent.Disconnected` dinliyor.
- Event payload'dan count hesaplanmıyor; her event sonrası yeniden `remoteParticipants.size` okunuyor.
- `StudioPrepSurface` `publisherRoom` owner oldu, hook'u çağırdı ve metric visibility gate'ini `effectiveLifecycleKind === "live"`, `!isStopping`, `viewerCount !== null` şartlarıyla uyguladı.
- `StudioPreviewPanel` yalnız dar `onPublisherRoomChange(room)` handoff aldı; gerçek unmount cleanup'ında `null` gönderiyor, room-change cleanup'ında churn üretmiyor.
- `StudioRouteShell` yalnız metric prop'unu pass-through etti.
- `StudioTopChrome` render-only kaldı ve middle metric slot'u render etti.
- Metric middle slotta `leading cluster` ile `trailing cluster` arasında duruyor.
- Accessibility naming gerçek hidden accessible text ile çözüldü; decorative eye icon ve visible count `aria-hidden` tutuldu.
- `aria-live` kullanılmadı.
- `role="status"` kullanılmadı.

## 6. Owner manual smoke evidence

- Bu ortamda authenticated owner smoke command-verified alınamadı.
- Aşağıdaki liste owner smoke acceptance checklist'i olarak close-out'a sabitlendi:
  - Pre-live’da sayaç görünmedi
  - Live’da sayaç göründü
  - Live state’te 0 göründü
  - Viewer girince sayı arttı
  - Viewer çıkınca sayı azaldı
  - Hızlı gir/çık sonrası aktif viewer davranışı beklenen şekilde korundu
  - Yayın bitip yeterli bekleme sonrası tekrar live’da 0’dan başladı
  - Camera switch ve mic bozulmadı
  - Username ellipsis çalıştı
  - Top chrome tek satır kaldı
  - Metric button gibi görünmedi
  - Screenshotlarda 0, 1, 2, 3, 9, 10 state’leri görüldü

## 7. Visual note

- Görsel hedef PASS.
- Sayaç hafif / native kalacak şekilde tasarlandı.
- Çok parlak sahnelerde hafif silik kalabilir; bu close-out blocker değildir.
- İstenirse ayrı micro visual polish follow-up olabilir.

## 8. Validation results

- `git diff --check`: PASS
- `npm run lint`: PASS
- `npm run build`: PASS
