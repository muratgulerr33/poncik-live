# Studio Prelive + Live Mic Control Close-out

## Kısa Hüküm

- PASS

## Owner Rule Değişikliği

- Eski live-only mic davranışı superseded.
- Yeni canonical owner rule: prelive + going-live + live mic control.

## Ne Değişti

- prelive mic visible
- prelive toggle gerçek `MediaStreamTrack.enabled` truth’una bağlı
- start click snapshot gerçek preview audio track’ten okunuyor
- muted ve unmuted start provider publication doğrulamasıyla garanti ediliyor
- live truth LiveKit local microphone publication
- going-live disabled/pending: `KEEP FOR NOW`

## Changed Files

- `src/app/(studio)/studio/_adapters/studio-livekit-publisher-adapter.ts`
- `src/app/(studio)/studio/_adapters/studio-preview-adapter.ts`
- `src/app/(studio)/studio/_components/StudioPrepSurface.tsx`
- `src/app/(studio)/studio/_components/StudioPreviewPanel.tsx`
- `src/app/(studio)/studio/_components/StudioTopChrome.tsx`
- `src/app/(studio)/studio/_components/studio-route-shell.tsx`
- `src/app/(studio)/studio/_components/useStudioLiveMicUtilitySurface.ts` deleted/superseded
- `src/app/(studio)/studio/_components/useStudioMicUtilitySurface.ts`
- `src/app/(studio)/studio/_components/useStudioPublishFoundation.ts`
- `docs/studio-prelive-live-mic-control-closeout.md`
- `docs/studio-media-surface-contract-map.md`

## Validation Results

- `git diff --check`: PASS
- `npm run lint`: PASS
- `npm run build`: PASS
- source cleanup search: PASS

## Manual Smoke

- prelive mic visible: PASS
- prelive mute toggle: PASS
- prelive muted start viewer no audio: PASS
- prelive unmuted start viewer audio: PASS
- live mute/unmute: PASS
- stop sonrası state safe: PASS

## No-touch Doğrulaması

- `/live/[username]` untouched
- viewer audio toggle untouched
- DB/schema untouched
- auth untouched
- chat untouched
- camera switch untouched
- CSS/geometry/polish untouched

## Risk / Future Note

- going-live disabled/pending: `KEEP FOR NOW`
- Bu davranış snapshot lock ve start safety ile iç içe kaldığı için bu turda korunur.
- Future full-screen going-live overlay turunda global interaction blocking owner’ı yeniden değerlendirilecek.

## Commit Message

- `studio: support prelive mic control`
