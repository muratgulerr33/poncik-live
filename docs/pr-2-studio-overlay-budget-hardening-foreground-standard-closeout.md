# PR-2 Studio Overlay Budget Hardening + Foreground Standard Close-Out

## Kısa Hüküm

PR-2 Studio overlay budget hardening ve Deneme 5S ile kilitlenen top chrome foreground standard bu close-out ile kapatıldı.

## Scope

- yalnız `/studio` approved scene overlay budget hardening
- top chrome foreground readability hardening
- top chrome ikonografi/tipografi exact value lock
- ileride medya üstü ikon/metin işleri için route-local kaynak standard yazımı

## Scope Dışında Bırakılanlar

- yeni tasarım denemesi
- yeni TSX implementation
- `/live/[username]`
- input / Gönder
- Başlat / CTA
- shared/global abstraction
- close-out dışında yeni scope açılması

## Repo Safety Sonucu

- `git branch --show-current`: `main`
- `git status -sb`: expected dirty PR-2 worktree state close-out öncesi doğrulandı
- `git diff --name-only`: yalnız PR-2 studio overlay batch dosyaları doğrulandı

## Diff Özeti

### Overlay budget hardening

- `src/app/(studio)/studio/_components/studio-preview-panel.module.css`
  - scene action surface bottom budget daraltıldı
  - action budget end alignment netleştirildi
  - mobile action budget vertical padding sıkılaştırıldı
- `src/app/(studio)/studio/_components/studio-lifecycle-actions.module.css`
  - scene-native action stack gap ve bottom padding sıkılaştırıldı
  - scene-native label line-height düzeltildi
  - label text-shadow eklendi

### Deneme 5S foreground lock

- `src/app/(studio)/studio/_components/studio-top-chrome.module.css`
  - top chrome root heavy blur / bar hissinden arındırıldı
  - close + mic carrier 44px düşük görünürlük shell olarak kilitlendi
  - glyph 27px / 2.42 stroke exact contract local CSS authority ile bağlandı
  - username typography exact contract ile kilitlendi
  - muted mic aynı optik sistemde tutuldu
  - selectorlar top-chrome-only route-local boundary içinde kaldı

## Changed Files

- `src/app/(studio)/studio/_components/studio-preview-panel.module.css`
- `src/app/(studio)/studio/_components/studio-lifecycle-actions.module.css`
- `src/app/(studio)/studio/_components/studio-top-chrome.module.css`
- `docs/pr-2-studio-overlay-budget-hardening-foreground-standard-closeout.md`

## Studio Media-Overlaid Foreground Standard

Bu bölüm, ileride medya üstü ikon/metin tasarımları için kaynak standard olarak referans alınabilir.

- 44px touch target
- 27px SVG glyph
- `stroke-width: 2.42`
- saf beyaz foreground
- çok hafif edge support
- carrier / circle düşük görünürlük
- username `16.9px / 650 / 1.04`
- username minimal `text-shadow` ve minimal `-webkit-text-stroke`
- ağır blur yok
- header bar hissi yok
- selectorlar route-local ve top-chrome-only

### Exact Foreground Contract

#### Root

```css
background:
  linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.052) 0%,
    rgba(0, 0, 0, 0.022) 24%,
    rgba(0, 0, 0, 0.006) 54%,
    rgba(0, 0, 0, 0) 82%
  );
box-shadow: none;
backdrop-filter: none;
-webkit-backdrop-filter: none;
```

#### Carrier

```css
width: 44px;
height: 44px;
min-width: 44px;
min-height: 44px;
padding: 0;
display: flex;
align-items: center;
justify-content: center;
border: none;
border-radius: 999px;
background: rgba(255, 255, 255, 0.006);
box-shadow: none;
backdrop-filter: none;
-webkit-backdrop-filter: none;
color: #ffffff;
opacity: 1;
overflow: visible;
```

#### SVG

```css
width: 27px;
height: 27px;
min-width: 27px;
min-height: 27px;
display: block;
overflow: visible;
color: #ffffff;
stroke: #ffffff;
opacity: 1;
filter: drop-shadow(0 0.42px 0.32px rgba(0, 0, 0, 0.095));
```

#### SVG Child

```css
stroke: #ffffff;
stroke-width: 2.42;
stroke-linecap: round;
stroke-linejoin: round;
vector-effect: non-scaling-stroke;
```

#### Username

```css
color: #ffffff;
opacity: 1;
font-size: 16.9px;
font-weight: 650;
line-height: 1.04;
letter-spacing: -0.01em;
text-shadow: 0 0.48px 0.38px rgba(0, 0, 0, 0.085);
-webkit-text-stroke: 0.18px rgba(0, 0, 0, 0.075);
filter: none;
-webkit-font-smoothing: antialiased;
text-rendering: geometricPrecision;
paint-order: stroke fill;
```

## Selector Safety

- whitelist yalnız:
  - `.chrome[data-layout="scene"][data-surface="approved"]`
  - `.closeButton`
  - `.utilityButton`
  - `.utilityButton[data-state="muted"]`
  - `.usernameLabel`
  - `.closeButton :global(svg)`
  - `.utilityButton :global(svg)`
  - `.closeButton :global(svg *)`
  - `.utilityButton :global(svg *)`
- blacklist:
  - genel `button`
  - `[data-layout="scene"][data-surface="approved"] button`
  - `header button`
  - preview panel selectorları
  - lifecycle/action selectorları
  - composer/input selectorları

## Validation

- `git diff --check`: PASS
- `npm run lint`: PASS
- `npm run build`: PASS

## Manual Smoke Gate

- owner gerçek cihaz smoke gate bu close-out turuna giriş sinyali olarak PASS kabul edildi
- Redmi
- `/studio` `preview_ready`
- açık/parlak zemin
- orta/koyu zemin
- zoom üst bölge
- tam ekran
- mic active
- mic muted/slashed
- Gönder/input etkilenmedi
- Başlat/CTA etkilenmedi
- circle ana görünür katman olmadı
- `X`, username ve mic ilk bakışta okunuyor

## Commit Message

- `studio: close out overlay budget hardening foreground standard`

## Push Sonucu

- source doc canonical truth'u changed scope ve validation sonucudur
- close-out execution turn'ünde `git push origin main` çalıştırılır
- gerçek push sonucu terminal kaydıyla doğrulanır

## Final Worktree Durumu

- close-out execution turn'ü sonunda `git status -sb` clean olmalıdır
- gerçek clean status terminal kaydıyla doğrulanır
