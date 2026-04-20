# Studio CSS Ownership Split / Tur 2 Active Scene Contract Flattening Close-out

## Kısa Hüküm

Tur 2 active scene contract flattening kapandı. Approved scene path'te aktif selector aileleri local explicit contract'a çekildi. Page approved selectorları untouched bırakıldı. Bu kapanış extraction değildir; yalnız Tur 2 close-out'udur.

## Close-out Scope

Güncellenen dosyalar:

- `src/app/(studio)/studio/_components/studio-route-shell.tsx`
- `src/app/(studio)/studio/_components/StudioPrepSurface.tsx`
- `src/app/(studio)/studio/_components/StudioPreviewPanel.tsx`
- `src/app/(studio)/studio/_components/studio.module.css`

## Bu Turda Eklenen Explicit Contract Özeti

### `StudioRouteShell`

- `surface?: "default" | "approved"`
- `section.shell` üstüne `data-surface`
- `header.chrome` üstüne `data-surface`

### `StudioPrepSurface`

- `StudioRouteShell` çağrısına `surface="approved"`
- `section.prepScene` üstüne `data-surface="approved"`

### `StudioPreviewPanel`

- `section.previewScene` üstüne `data-surface="approved"`
- `div.previewStageStack` üstüne `data-surface="approved"`

## Bu Turda Özellikle Ne Korunarak Bırakıldı

- `StudioShell.tsx`
- safe island olarak ayrılmış 4 yeni CSS module
- `StudioGateSurface.tsx`
- `StudioPermissionNotice.tsx`
- `StudioStartFeedback.tsx`
- `studio-exit-confirm-dialog.tsx`
- `StudioLifecycleActions.tsx` JSX yapısı
- page approved selectorları
- extraction
- cleanup
- stale selector avı
- visual polish

## Implementation Disiplini

- JSX shape freeze korundu
- yeni wrapper açılmadı
- yeni extraction yapılmadı
- active scene runtime path'e odaklanıldı
- page approved selectorları bilinçli olarak leave-as-is bırakıldı

## Doğrulama

- `npm run lint` PASS
- `npm run build` PASS
- manuel smoke PASS

Manuel smoke'ta özellikle doğrulananlar:

- approved publisher ile `/studio`
- preview panel modu görünümü
- preview_ready scene modu
- live state'te top chrome ve action CTA
- success feedback görünümü
- exit dialog görünümü
- mobile portrait
- mobile landscape
- desktop landscape
- mevcut davranış ve görünümün korunması

## Remaining Scope

- page/root ownership split sonraki turda
- shell/chrome/preview ailelerinin gerçek module extraction'ı sonraki turda
- page approved selectorları sonraki tur/stale audit alanında
- bu close-out full studio CSS split kapanışı değildir
