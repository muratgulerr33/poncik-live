# P1.3 — Studio Scene Cleanup + Mobile Native Layout Correction Close-out

## 1. kısa hüküm

- PASS / KABUL
- Bu tur presentation/composition cleanup turu olarak kapatıldı.
- `/studio` approved prep sahnesinde intro/copy gürültüsü azaltıldı, preview/stage baskını artırıldı ve CTA stage'e daha yakın hale getirildi.

## 2. scope

Bu turda kapanan iş:

- `/studio` approved prep sahnesinde intro/copy gürültüsünün azaltılması
- preview/stage'in daha baskın hale getirilmesi
- CTA'nın stage'e daha yakın ve görünür hale gelmesi
- healthy state'te gereksiz preview/prep yardımcı metinlerinin azaltılması
- çözümün route-local ve dar write sette kalması

Bu turda yeniden açılmadı:

- 4A fullscreen shell işi
- 4B exit confirm + single CTA işi
- provider/token/foundation hattı
- stabilization/flicker çözümü
- preview persistence rewrite
- permission timing rewrite
- discovery/live/auth yeni işi

## 3. changed files

- `docs/p1-3-studio-scene-cleanup-mobile-native-layout-correction-closeout.md`
- `src/app/(studio)/studio/_components/StudioPrepSurface.tsx`
- `src/app/(studio)/studio/_components/StudioPreviewPanel.tsx`
- `src/app/(studio)/studio/_components/StudioLifecycleActions.tsx`
- `src/app/(studio)/studio/_components/studio.module.css`
- `src/app/(studio)/studio/_lib/studio-copy.ts`

## 4. command-verified sanity

- `npm run lint`: PASS
- `npm run build`: PASS
- route sanity:
  - `curl -I http://localhost:3006/` -> `200`
  - `curl -I http://localhost:3006/auth` -> `200`
  - `curl -I http://localhost:3006/live/test-user` -> `200`
  - `curl -I http://localhost:3006/studio` -> `307`, hedef `/auth?next=/studio`

## 5. manual smoke özeti

- user-provided/manual smoke PASS
- approved prep sağlıklı durumda preview daha baskın ve sahne daha sade hissediliyor
- healthy state'te gereksiz yardımcı metin yükü azaldı
- CTA stage'e daha yakın ve daha görünür hissediliyor
- exit confirm doğru çalışmaya devam ediyor
- `/`, `/auth`, `/live/[username]` tarafında belirgin regresyon görülmedi

Not:
- bu bölüm command-verified değildir
- user/device tarafında gözlenen gerçek kullanım notlarını taşır

## 6. bu turda bilerek çözülmeyen alanlar

- scene continuity / flicker / hop eksikleri
- preview persistence
- state transition stabilization
- auth -> studio -> permission -> ready continuity
- studio -> discovery dönüş continuity
- provider/token/foundation hattı değişikliği
- permission timing rewrite

Bu alanlar bu turun scope'una gizlice alınmadı ve çözülmüş gibi yazılmıyor.

## 7. remaining unknown

- approved prep sahnesinin tam mobile/desktop kullanım kalitesi bu close-out turunda command-verified alınmadı
- scene continuity eksiklerinin tam sınırı manual kullanımda görülmüş olsa da bu batch içinde teknik olarak çözülmedi
- “native premium his tamamlandı” gibi bir hüküm bu tur için kanıtlı değil

## 8. next separate work item

- ayrı stabilization turu
- odak:
  - preview persistence
  - state hop/flicker azaltma
  - auth -> studio -> permission -> ready continuity
  - studio -> discovery dönüş continuity

Bu next item cleanup turundan ayrıdır; aynı close-out içine karıştırılmadı.
