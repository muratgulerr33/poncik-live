# Studio CSS Ownership Split / Tur 3 Active Preview Family Extraction Close-out

## Kısa Hüküm

Tur 3 active preview family extraction kapandı. Active prep/preview/lifecycle ailesi yeni route-local module'lere taşındı. `studio.module.css` içinde route shell/root/page ve leave-as-is alanlar bırakıldı. Bu kapanış full studio CSS split değildir; yalnız Tur 3 close-out'udur.

## Close-out Scope

Yeni açılan CSS module dosyaları:

- `src/app/(studio)/studio/_components/studio-prep-surface.module.css`
- `src/app/(studio)/studio/_components/studio-preview-panel.module.css`

Güncellenen component dosyaları:

- `src/app/(studio)/studio/_components/StudioPrepSurface.tsx`
- `src/app/(studio)/studio/_components/StudioPreviewPanel.tsx`
- `src/app/(studio)/studio/_components/StudioLifecycleActions.tsx`
- `src/app/(studio)/studio/_components/studio.module.css`

## Bu Turda Özellikle Ne Taşındı

- `prepScene`
- active preview family
- lifecycle class ailesi
- preview mobile/orientation kuralları
- grouped-rule split ile `actionRow` ve `previewBody` ayrımı

## Bu Turda Özellikle Ne Korunarak Bırakıldı

- `studio-route-shell.tsx`
- route shell extraction
- root/page split
- Tur 1 safe island module’leri
- `StudioShell.tsx`
- page approved selectorları
- `prepIntro`
- `previewMetaRow`
- `sceneCaption`
- `previewLifecycleHint`
- `sceneStage`
- close button hover kuralı

## Implementation Disiplini

- JSX shape freeze korundu
- yeni wrapper açılmadı
- yeni prop açılmadı
- yeni data-attribute açılmadı
- route-local sınır korundu
- shared/generic abstraction açılmadı
- stale selector cleanup yapılmadı

## Doğrulama

- `npm run lint` PASS
- `npm run build` PASS
- manuel smoke PASS

Manuel smoke'ta özellikle doğrulananlar:

- approved publisher ile `/studio`
- preview henüz ready değilken panel görünümü
- preview_ready scene görünümü
- live state’te top chrome + action CTA
- success feedback görünümü
- exit dialog görünümü
- mobile portrait
- mobile landscape
- desktop landscape
- mevcut davranış ve görünümün korunması

## Remaining Scope

- route shell/chrome ownership split sonraki turda
- root/page ownership split sonraki turda
- page approved selectorları sonraki tur/stale audit alanında
- bu close-out full studio CSS split kapanışı değildir
