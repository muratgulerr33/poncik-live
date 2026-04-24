
````md
---
title: Studio Media Surface Contract Map
status: evidence-map
scope: /studio approved publisher media surface
owner: Poncik Live
last_updated: 2026-04-25
---

# Studio Media Surface Contract Map

## 1. Purpose

Bu doküman, Poncik Live `/studio` approved publisher media surface alanının çalışma mantığını, katman ownership’ini, kanıt zincirini, no-touch alanlarını, açık borçlarını ve future drift guard’larını tanımlar.

Bu doküman bir implementation planı değildir.

Bu doküman şunlar için kullanılmalıdır:

- `Poncik Live — Studio Media Surface Engineer` penceresinin ana contract/evidence kaynağı
- `/studio` media surface işleri için drift guard
- Codex promptları öncesi scope kalibrasyonu
- desktop geometry/scaling audit öncesi baseline
- future drawer / overlay / chat / top chrome işleri öncesi layer ownership referansı
- `/studio` ile ileride `/live/[username]` alignment yapılmadan önce Studio tarafının kilitli kaynak dokümanı

Bu doküman şunları iddia etmez:

- global Studio visual PASS
- desktop scaling root cause bulundu
- `/live/[username]` alignment tamamlandı
- camera switcher feature tamamlandı
- chat history readability final kabul edildi
- iOS/Safari mobile acceptance tamamlandı

---

## 2. Scope

Bu dokümanın kapsamı yalnız `/studio` approved publisher media surface alanıdır.

Kapsama girenler:

- approved publisher `/studio` scene
- camera preview surface
- media root
- preview frame
- video element
- contain policy
- scene geometry
- top chrome lane
- action zone
- transient notice lane
- owner-side chat / overlay layer
- composer dock
- live exit confirm dialog layer
- safe-area / viewport / layer order
- mobile no-touch baseline
- desktop scaling debt location map
- future drawer placement guard

---

## 3. Non-scope

Bu dokümanın kapsamı değildir:

- `/live/[username]` alignment
- public viewer watch surface implementation
- viewer chat
- realtime chat
- DB chat persistence
- LiveKit transport changes
- WebRTC transport redesign
- auth / approval redesign
- V2 / V3 features
- payment / 1v1 / gift / DM / social scope
- camera switcher implementation
- camera switcher UI
- desktop scaling fix planı
- CSS / TSX değişiklik planı
- generic shared media abstraction
- global modal/dialog sistemi

Camera switcher bu dokümanda yalnız exclusion / drift guard olarak yer alır.

---

## 4. Truth hierarchy

Bu dokümanda truth sırası:

1. owner lock / freeze
2. current `main` repo + canonical docs
3. Studio close-out docs
4. current `/studio` source files
5. screenshot / viewport / real-device evidence
6. official standards when needed
7. LiveKit docs only for provider / SDK / cloud behavior
8. MDN only for helper explanation / examples / compatibility
9. suggestion / interpretation

Rules:

- Screenshot yoksa visual PASS yazılmaz.
- Close-out PASS global başarı gibi okunmaz.
- Technical debt kapanmış gibi yazılmaz.
- Owner truth ile repo evidence ayrılır.
- Unknown alanlar kapalıymış gibi yazılmaz.
- Merge edilmemiş karar canonical truth sayılmaz.
- LiveKit provider truth’tur; WebRTC’nin yerine geçen standard değildir.
- MDN yardımcı kaynaktır; ana standard truth değildir.

---

## 5. Current layer map

Current `/studio` approved scene layer chain:

```text
StudioShell
  → approved prep ise StudioPrepSurface
    → StudioRouteShell(layout="scene", surface="approved")
      → shellScene
        → StudioPreviewPanel
          → previewScene
            → previewStageStack
              → sceneMediaRoot
                → previewFrame
                  → video element
              → sceneSuccessFeedbackLane
              → StudioChatOwners
                → StudioChatOwnersSurface
                  → chat/overlay layer
                  → composer layer
              → sceneActionSurface
                → sceneActionBudget
                  → StudioLifecycleActions
      → StudioTopChrome
        → top chrome lane
````

Important correction:

`StudioTopChrome`, `StudioPreviewPanel` içinde değildir. `StudioRouteShell` tarafından approved scene chrome olarak render edilir.

---

## 6. Owner files

### Route / shell owner

* `src/app/(studio)/studio/_components/StudioShell.tsx`

  * approved/gate branch kararını taşır.
  * approved prep ise `StudioPrepSurface` zincirine geçer.

* `src/app/(studio)/studio/_components/studio.module.css`

  * page/scene shell root, `100dvh/svh/vh`, approved scene theme ve scene shell geometry alanını taşır.

### Approved prep surface owner

* `src/app/(studio)/studio/_components/StudioPrepSurface.tsx`

  * approved scene wrapper’dır.
  * exit dialog state’ini taşır.
  * live mic control state’ini route shell’e geçirir.
  * `StudioPreviewPanel` handoff’unu yapar.

* `src/app/(studio)/studio/_components/studio-prep-surface.module.css`

  * approved prep scene full width / height wrapper’ını taşır.

### Route scene shell / chrome mount owner

* `src/app/(studio)/studio/_components/studio-route-shell.tsx`

  * `layout="scene"` ve `surface="approved"` için scene shell kurar.
  * approved scene durumunda `StudioTopChrome` mount eder.

### Preview / media owner

* `src/app/(studio)/studio/_components/StudioPreviewPanel.tsx`

  * preview state
  * media root
  * video element
  * lifecycle action zone
  * success feedback lane
  * chat owner slot
  * permission support stack
    alanlarını route-local olarak orkestre eder.

* `src/app/(studio)/studio/_components/studio-preview-panel.module.css`

  * media root
  * preview frame
  * video contain policy
  * success lane
  * action surface
  * desktop/mobile/landscape geometry
    alanlarını taşır.

### Top chrome owner

* `src/app/(studio)/studio/_components/StudioTopChrome.tsx`

  * `X`
  * username
  * live mic utility
    alanlarını taşır.

* `src/app/(studio)/studio/_components/studio-top-chrome.module.css`

  * absolute top chrome lane
  * safe-area padding
  * z-index 3
  * touch targets
    alanlarını taşır.

### Chat / overlay owner

* `src/app/(studio)/studio/_components/StudioChatOwners.tsx`

  * owner-side chat phase/state/controller alanını taşır.

* `src/app/(studio)/studio/_components/StudioChatOwnersSurface.tsx`

  * render-only chat surface’tir.
  * message overlay ve composer dock DOM’unu taşır.

* `src/app/(studio)/studio/_components/studio-chat-owners.module.css`

  * chat overlay layer
  * composer dock
  * safe-area padding
  * z-index 2
  * readability / fade / scroll alanlarını taşır.

### Exit dialog owner

* `src/app/(studio)/studio/_components/studio-exit-confirm-dialog.tsx`

  * live state `X` sonrası confirm dialog render eder.
  * `role="dialog"`, `aria-modal="true"`, `aria-labelledby` kullanır.

* `src/app/(studio)/studio/_components/studio-exit-confirm-dialog.module.css`

  * fixed modal backdrop
  * z-index 20
  * dialog card
  * mobile button layout
    alanlarını taşır.

---

## 7. Source ratio / frame ratio / contain / geometry ayrımı

### Source ratio

Kameradan gelen gerçek incoming media oranıdır.

Örnek:

* 1/1 kare source
* 9/16 dikey source
* 16/9 yatay source

Bu doküman source acquisition root cause analizi yapmaz.

### Frame ratio

Video’nun yerleştiği visible box oranı/ölçüsüdür.

Poncik Studio’da bu alan `previewFrame` / media frame katmanında aranır.

### Contain policy

Görüntüyü bozmadan frame içine sığdırma davranışıdır.

Current repo evidence:

* `previewVideo`
* `previewVideoInactive`

şu policy ile çalışır:

```css
object-fit: contain;
object-position: center;
```

Bu policy mobile no-touch contract açısından korunmalıdır.

### Scene geometry

Frame, media root, top chrome, action zone, transient notice, chat/overlay ve dialog gibi parçaların sahnedeki yerleşimidir.

### Desktop scaling

Geniş viewportta frame/media surface’in ne kadar büyüyüp küçüleceğidir.

Bu doküman desktop scaling root cause’u kapatmaz.

---

## 8. Mobile no-touch contract

Owner truth:

* Studio mobile media ratio contract owner-approved ve no-touch kabul edilir.
* Mobil contract yeniden açılmaz.
* Desktop debt mobil baseline bozularak çözülmez.
* Mobilde kamera kaynağı ne olursa olsun görüntü contain policy ile ayarlanmış alanda görünür.
* Mobil portrait / safe-area / touch baseline korunur.

Repo / close-out support:

* mobile/native layout correction close-out mobil kullanım/presentation desteği taşır.
* chat native interaction close-out mobile owner-side chat readability/composer support taşır.
* current repo’da mobile-specific preview/action/safe-area CSS kuralları vardır.
* current video render policy `object-fit: contain` kullanır.

Caveat:

* Exact mobile media ratio freeze commit bu dokümanda izole edilmedi.
* Bu nedenle mobile no-touch contract, owner truth + repo/close-out support olarak işaretlenir.

---

## 9. Mobile screenshot evidence

Owner-provided screenshot evidence.

Evidence set:

* Route: `/studio`
* Device: Redmi Note 11 Pro
* Browser: Android Chrome
* Orientation: `portrait-primary`
* Camera source: mobile camera

Viewport evidence:

* `window.innerWidth x innerHeight`: `392 x 783`
* `visualViewport`: `393 x 783`
* `outer`: `393 x 873`
* `screen`: `393 x 873`
* DPR: `2.75`

Captured files / states:

* `studio-mobile-prelive-redmi-note11-pro.jpeg`

  * pre-live / preview_ready / `Başlat`

* `studio-mobile-going-live-redmi-note11-pro.jpeg`

  * going-live / `Canlı başlıyor`

* `studio-mobile-live-transient-notice-redmi-note11-pro.jpeg`

  * live transient notice / `Canlı yayındasın`

* `studio-mobile-live-steady-redmi-note11-pro.jpeg`

  * live steady / notice closed / composer visible

Evidence-supported claims:

* Mobile media frame remains visible across captured pre-live, going-live and live states.
* Top chrome remains separated from the media frame.
* Bottom action/composer lane remains scene-local.
* Live state adds mic control to the top chrome.
* `Canlı yayındasın` behaves as transient notice lane.
* Live steady state shows composer placement at the bottom of the scene.
* The viewport remains stable across captured state transitions.

Caveats:

* This evidence does not prove desktop scaling.
* This evidence does not prove iOS/Safari behavior.
* This evidence does not prove chat history readability.
* This evidence does not prove keyboard-open composer behavior.
* This evidence does not prove all Android devices.
* This evidence must not be generalized as global Studio visual PASS.

---

## 10. Mobile live exit dialog evidence

Owner-provided screenshot evidence.

File:

* `studio-mobile-live-exit-dialog-redmi-note11-pro.jpeg`

Metadata:

* Route: `/studio`
* State: live / exit dialog open
* Trigger: live state sırasında `X` ikonuna basıldı
* Viewport: `392 x 783`
* Device: Redmi Note 11 Pro
* Browser: Android Chrome
* Camera source: mobile camera

Source evidence:

* `StudioPrepSurface.tsx` live state close request’te dialog state’i açar.
* `StudioExitConfirmDialog` route-local component olarak render edilir.
* Dialog source:

  * `role="dialog"`
  * `aria-modal="true"`
  * `aria-labelledby="studio-exit-confirm-title"`
* Dialog CSS:

  * fixed backdrop
  * `z-index: 20`
  * safe-area aware padding
  * mobile buttons full width

Copy source:

* `exitConfirmTitle`: `Canlıyı durdur?`
* `exitConfirmConfirmLabel`: `Bitir`
* `exitConfirmCancelLabel`: `Vazgeç`

Evidence-supported claims:

* Live state içinde `X` doğrudan çıkış yapmaz; exit confirmation modal layer açar.
* Dialog text: `Canlıyı durdur?`
* Actions:

  * `Vazgeç`
  * `Bitir`
* Dialog scene üzerinde modal overlay olarak okunur.
* Dialog mobile viewport içinde taşmadan görünür.

Caveats:

* This is not media ratio evidence.
* This is not desktop scaling evidence.
* This is not camera switcher evidence.
* This does not prove stop technical success.
* This does not prove redirect/discovery success after stop.
* This does not prove desktop dialog behavior.
* This does not prove iOS/Safari dialog behavior.

---

## 11. Desktop scaling debt map

Known owner truth:

* Desktop Studio preview frame scaling / desktop geometry açık technical debt’tir.
* Bu borç mobil no-touch baseline bozularak çözülmeyecek.
* Bu doküman desktop root cause kapatmaz.

Likely later inspection layers:

* `src/app/(studio)/studio/_components/studio.module.css`

  * scene root
  * viewport / `dvh` / shell height
  * `pageScene`
  * `shell[data-layout="scene"]`
  * `shellScene`

* `src/app/(studio)/studio/_components/studio-prep-surface.module.css`

  * approved prep full-size wrapper
  * `prepScene[data-surface="approved"]`

* `src/app/(studio)/studio/_components/studio-preview-panel.module.css`

  * `previewScene`
  * `previewStageStack`
  * `sceneMediaRoot`
  * `previewFrame`
  * `previewVideo`
  * desktop / landscape media queries
  * width / height / max-width / max-height behavior

* `src/app/(studio)/studio/_components/studio-top-chrome.module.css`

  * top chrome overlay budget

* `src/app/(studio)/studio/_components/studio-chat-owners.module.css`

  * chat overlay safe-area and z-index

* action zone CSS

  * bottom action budget
  * overlay lane
  * scene action surface

Important:

* No desktop root cause is claimed in this document.
* Desktop screenshot + viewport evidence is required before desktop visual conclusions.
* Desktop evidence should be collected separately after this contract map is committed.

---

## 12. Top chrome / action zone / chat overlay layer order

Current source-backed layer reading:

### Media base

* `sceneMediaRoot`
* `previewFrame`
* video element

### Action / success / chat overlay

* `sceneActionSurface`
* `sceneSuccessFeedbackLane`
* `chatLayer`
* generally z-index `2`

### Top chrome

* `StudioTopChrome`
* absolute top lane
* z-index `3`

### Exit dialog

* route-local modal overlay
* fixed backdrop
* z-index `20`
* opens after live-state `X`

Layer guard:

* Top chrome remains the highest regular scene chrome lane.
* Exit dialog is above scene chrome as modal overlay.
* Action zone remains scene-local bottom budget.
* Chat overlay remains owner-side live layer.
* New overlay/drawer must not casually override these layers.

Caveat:

* Actual visual overlap must be validated with screenshot / viewport evidence for each state/device.

---

## 13. Chat / overlay evidence and limits

Current source-backed chat owner contract:

* `StudioChatOwners` returns `null` when phase is hidden or username is not renderable.
* `StudioChatOwnersSurface` renders:

  * message overlay owner
  * message stack
  * composer dock
  * input
  * send button
* Chat layer uses `grid-area: 1 / 1`.
* Chat layer uses z-index `2`.
* Composer is route-local and owner-side.

Mobile screenshot evidence supports:

* live steady state has bottom composer visible
* composer sits as scene-local bottom layer
* chat/composer layer does not visually replace media frame in captured state

Current unknown:

* chat history message readability with visible messages
* long-message readability in current screenshot set
* keyboard-open composer behavior
* low device performance with masks/backdrop/text shadow
* viewer `/live/[username]` chat alignment

These remain future evidence areas.

---

## 14. Camera switcher exclusion / future separate contract

Camera switcher is excluded from this active visible Studio media surface contract.

Known truth:

* Historical camera switch work did not close reliable repeated front/back switching.
* Geometry regression was observed in camera switch attempts.
* Reverted checkpoint returned the app to geometry-safe baseline.
* Repeated front/back switching is future technical debt.
* Geometry-safe Studio baseline is more important than mixing switch fixes into media geometry work.

Rules:

* Current contract map does not establish a visible camera switcher UI owner.
* Camera switch technical debt and desktop frame scaling debt are different issues.
* Do not ask for camera switch screenshots in Studio media surface geometry audits.
* Do not mix camera switch work with desktop geometry/scaling work.
* Future camera switch work requires:

  * separate contract
  * separate validation
  * separate implementation tour
  * runtime device validation

Camera switcher is only included here as exclusion / drift guard evidence.

---

## 15. Future drawer placement guard

Future drawer placement is not decided here.

Guardrails:

* Drawer must not be added casually into `StudioPreviewPanel.tsx` if it creates god-file pressure.
* Drawer must respect:

  * top chrome
  * action zone
  * chat overlay
  * transient notice lane
  * exit dialog
  * safe-area
  * mobile no-touch baseline
* Drawer likely needs a separate route-local owner/layer contract before implementation.
* Drawer placement must be decided with screenshot evidence and current layer map.
* Drawer must not become generic shared media abstraction.

Current state:

* no drawer owner exists in this contract
* no drawer implementation plan is provided
* no drawer placement decision is frozen

---

## 16. No-touch areas

No-touch:

* mobile media ratio baseline
* mobile safe-area / touch baseline
* current contain policy
* `/live/[username]`
* LiveKit / WebRTC transport
* DB / auth / payment / V2 / V3 scope
* realtime chat / DB chat / viewer chat
* camera switcher technical debt
* generic shared media abstraction
* global modal system
* public watch route
* discovery route
* admin / approval route

---

## 17. Unknowns

Known unknowns:

* desktop scaling root cause
* desktop viewport/screenshot behavior
* `/live/[username]` alignment
* iOS/Safari mobile behavior
* chat history message readability
* keyboard-open composer behavior
* stop + discovery redirect technical success evidence
* exact mobile freeze commit / close-out isolation
* future drawer placement owner
* whether desktop debt is:

  * frame sizing
  * parent geometry
  * media query
  * max-width / max-height
  * top chrome/action reserved area
  * viewport unit behavior
  * visual perception
* exact source ratio behavior on each device/camera source
* browser-specific desktop Chrome behavior for MacBook camera
* Safari/iOS behavior

Unknowns must stay unknown until evidence exists.

---

## 18. Next audit inputs needed

### Desktop evidence needed

Before desktop visual conclusions:

* route
* state
* device
* browser
* viewport width x height
* camera source
* screenshot
* observed issue

Recommended later desktop evidence set:

* `/studio`, preview_ready, desktop Chrome, built-in webcam, viewport around 1024 width
* `/studio`, preview_ready, desktop Chrome, built-in webcam, viewport around 1280 width
* `/studio`, preview_ready, desktop Chrome, built-in webcam, viewport around 1440 width
* `/studio`, preview_ready, desktop Chrome, built-in webcam, wide/full viewport
* `/studio`, live, desktop Chrome, built-in webcam, wide/full viewport

### Mobile evidence still useful later

Optional later mobile evidence:

* `/studio`, live, mobile real device, chat history visible
* `/studio`, mobile keyboard-open composer state
* `/studio`, iOS/Safari mobile baseline
* `/studio`, exit dialog on iOS/Safari

---

## 19. Next recommended work

Recommended order:

1. Commit this doc-only contract map.
2. Studio Desktop Screenshot Evidence Collection.
3. Studio Desktop Geometry Evidence Audit.
4. Only after evidence: narrow implementation plan.
5. Codex implementation in separate turn.
6. Close-out in separate turn.

Rules for next turns:

* Desktop screenshot evidence is not needed to write this contract map.
* Desktop screenshot evidence is required before desktop root cause claims.
* `/live/[username]` alignment must wait until Studio desktop contract is stable.
* Camera switcher remains excluded until a separate camera switch contract is opened.

---

## 20. Final summary

This document is a Studio media surface contract/evidence map.

It establishes:

* current `/studio` layer ownership
* source ratio / frame ratio / contain / geometry separation
* mobile no-touch owner truth
* Android Chrome mobile screenshot evidence
* mobile exit dialog evidence
* desktop scaling as open debt
* camera switcher as excluded future technical debt
* future drawer placement guard
* explicit unknowns and next evidence requirements

It does not establish:

* global visual PASS
* desktop scaling root cause
* `/live/[username]` alignment
* camera switcher readiness
* final chat history readability
* keyboard-open composer acceptance

```
```
