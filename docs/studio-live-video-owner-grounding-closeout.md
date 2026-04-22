# Studio Live Video Owner Grounding Close-Out

## kısa hüküm

PASS. Current main publish-side root korunarak active live video path için publication-first read seam eklendi ve grounding işi close-out için merge-ready durumda.

## scope drift oldu mu olmadı mı

Olmadı.

## changed files

- `src/app/(studio)/studio/_components/useStudioPublishFoundation.ts`
- `src/app/(studio)/studio/_adapters/studio-livekit-publisher-adapter.ts`
- `docs/studio-live-video-owner-grounding-closeout.md`

## exact ne eklendi

- Adapter tarafına `readStudioPublisherCameraPublication(room: Room | null): LocalTrackPublication | null` eklendi.
- Helper, current root zincirinden `room -> local camera publication -> attached track` okuyup null-safe publication-first seam sağlıyor.
- Foundation tarafına `readActiveLiveVideoPublication: () => LocalTrackPublication | null` eklendi.
- Yeni seam yalnız `roomRef.current` üzerinden adapter helper'a dynamic delegasyon yapıyor.

## neye özellikle dokunulmadı

- `roomRef + getPublisherRoom` root truth'u
- `publishStudioPreviewTracks` boolean contract'ı
- lifecycle gating
- wrapper object / owner model
- preview/bootstrap dosyaları
- mic utility
- debug/log/temporary consumer wiring
- görünür UI

## lint sonucu

- `npm run lint`: PASS

## build sonucu

- `npm run build`: PASS

## manual sanity note

- approved publisher `/studio` flow PASS
- preview PASS
- `Başlat` PASS
- live state PASS
- mic PASS
- `Bitir` PASS
- görünür UI değişikliği yok

## risk / unknown

- Yeni seam için bu turda consumer bağlanmadı; doğrulama grounding ve mevcut cleanup semantics üzerinden yapıldı.

## merge-ready mi değil mi

Merge-ready.
