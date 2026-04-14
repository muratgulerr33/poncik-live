# P1.3 Tur 2A — Discovery Header + Navigation Shell Close-out

## 1) Kısa hüküm

- PASS / KABUL
- P1.3 Tur 2A batch'i tek parça close-out ile kapanışa alındı.
- Bu batch yalnız `/` discovery route'u için route-local header + navigation shell kurdu ve follow-up'larla drawer modeli, icon-only access control ve interaction/centering drift'lerini kapattı.

## 2) Bu turda kapanan batch'ler

### İlk batch

- `/` route-local header/chrome eklendi
- solda text brand `Poncik`
- sağda account/access slot + hamburger
- mobile drawer zemini
- desktop navigation shell ilk kurulum
- discovery hero ile shell chrome arası spacing polish
- loading / empty / error state spacing ve typography zemini

### Follow-up 1

- desktop rail/sidebar modeli iptal edildi
- mobil ve desktop için tek drawer modeline geçildi
- `lucide-react` dar icon istisnası eklendi
- account/access slot icon-only kontrole çevrildi
- drawer içine görünür `X` close affordance ve minimum dialog semantics eklendi

### Follow-up 2

- hamburger press/active artifact'i CSS-first dar fix ile temizlendi
- discovery shell outer centering auth yüzeyiyle aynı merkez ailesine yaklaştırıldı
- drawer motion/performance polish transform + opacity çizgisinde sadeleştirildi

## 3) Final scope özeti

Final ürün davranışı:

- `/` üstünde solda text brand `Poncik` görünür
- sağda icon-only access control ve hamburger trigger vardır
- drawer mobil ve desktopta aynı overlay modelini kullanır
- drawer close disiplinleri:
  - `X`
  - backdrop click
  - nav item click
  - `Esc`
- drawer açıkken body scroll lock çalışır
- discovery hero, description ve state card aynı merkez ritminde akar
- desktop'ta rail/sidebar kalmaz

## 4) Changed files

- `package.json`
- `package-lock.json`
- `src/app/(public)/page.tsx`
- `src/app/(public)/_controllers/discovery-controller.tsx`
- `src/app/(public)/_components/discovery-shell.tsx`
- `src/app/(public)/_components/discovery.module.css`
- `src/app/(public)/_components/discovery-route-shell.tsx`

## 5) Her dosyada ne değişti

### `package.json` / `package-lock.json`

- yalnız discovery header/drawer için gereken minimum icon ihtiyacı adına `lucide-react` eklendi

### `src/app/(public)/page.tsx`

- suspense fallback'i discovery shell çizgisine taşıdı
- loading state fallback'i route-local shell içinde açılır hale geldi

### `src/app/(public)/_controllers/discovery-controller.tsx`

- mevcut discovery data yanında minimum session snapshot okumaya başladı
- UI/chrome state taşımadan `DiscoveryRouteShell` için dar shell props üretir hale geldi

### `src/app/(public)/_components/discovery-shell.tsx`

- presentational shell olarak korundu
- route-local chrome slotu taşıyacak kadar dar genişletildi
- follow-up ile sidebar/rail alanı tekrar sadeleştirildi

### `src/app/(public)/_components/discovery-route-shell.tsx`

- route-local client shell eklendi
- drawer open/close, `Esc`, backdrop, nav click ve body scroll lock burada toplandı
- tek drawer modeli burada final hale getirildi
- icon-only access control, hamburger ve drawer close affordance burada taşındı

### `src/app/(public)/_components/discovery.module.css`

- discovery shell chrome, header bar ve drawer yüzeyi için route-local stil zemini eklendi
- desktop rail stilleri follow-up 1'de kaldırıldı
- icon control hizası, drawer semantics yüzeyi, centering ve motion polish follow-up 2'de tamamlandı
- discovery card redesign açılmadan hero/state spacing toparlandı

## 6) Neden scope içinde kaldığı

- yalnız `/` discovery route'una dokunuldu
- `/auth`, `/live/[username]`, `/studio` dosyaları açılmadı
- discovery card redesign açılmadı
- public watch polish açılmadı
- yeni route/destination açılmadı
- global header/nav framework veya `shared/ui` açılmadı
- Tur 2B alanı bu dokümana karıştırılmadı

## 7) Command-verified sanity özeti

- `npm run lint`: PASS
- `npm run build`: PASS

## 8) Manual smoke özeti

- PASS
- mobile drawer:
  - `X` görünür ve çalışır
  - backdrop close çalışır
  - nav click close çalışır
  - body scroll lock çalışır
- discovery shell:
  - desktop centering drift toparlandı
  - hamburger press/active artifact düzeldi

Bu özet dar ve dürüst smoke notudur; yeni test harness açılmadı, Playwright çalıştırılmadı.

## 9) Scope dışı kalanlar

- P1.3 Tur 2B
- `/auth` chrome işi
- `/live/[username]`
- `/studio`
- discovery redesign
- public watch polish
- yeni route / destination
- global abstraction / framework

## 10) Remaining unknown

- Manual smoke PASS kabul edildi, ancak close-out turunda yeni Playwright koşusu alınmadı.
- Browser smoke doğrulaması dar shell/chrome düzeyinde yapıldı; bu doküman yeni feature kabulü değil, Tur 2A close-out özetidir.
