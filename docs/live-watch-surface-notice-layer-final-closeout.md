# Live Watch Surface Notice Layer Final Close-out

## 1. Kısa hüküm

PASS.

`/live/[username]` yüzeyi için route-local **Surface Notice Layer** kuruldu ve guest auth drawer success hattına bağlandı.

Bu mekanizma, guest kullanıcının live drawer içinden login veya register işlemini başarıyla tamamlamasından sonra, drawer kapanışının ardından ekranda kısa süreli bir başarı bildirimi gösterir:

> Poncik’e hoş geldiniz

Bu çalışma global/shared toast sistemi değildir.

Bu çalışma drawer görselini, drawer motion’ını, drawer layout’unu, auth form yapılarını, `/auth` route’unu, media/playback/LiveKit/WebRTC katmanlarını veya DB yapısını değiştirmez.

## 2. Scope

Bu final close-out şu işleri kapsar:

- `/live/[username]` route-local notice foundation
- `useLiveWatchSurfaceNotice()` hook API
- fixed surface notice host
- render-only notice pill component
- guest auth drawer success seam
- login success sonrası welcome notice
- register success sonrası welcome notice
- native/premium timing polish
- symmetric entry/exit motion polish
- timer cleanup ve replace+restart notice lifecycle
- accessibility semantics:
  - `role="status"`
  - `aria-live="polite"`
  - `aria-atomic="true"`

## 3. Non-scope

Bu çalışma şunları kapsamaz:

- global toast sistemi
- `shared/ui` notification sistemi
- app-wide provider
- queue/list notification sistemi
- multi-tone notification sistemi
- drawer visual redesign
- drawer open/close motion değişikliği
- drawer lifecycle rewrite
- login/register form değişikliği
- auth action değişikliği
- `/auth` route davranış değişikliği
- media/playback/LiveKit/WebRTC değişikliği
- DB / migration / server-side notification sistemi
- native push notification
- browser Notification API / Push API
- `/studio` notice implementation

## 4. Changed files

Final mekanizma şu source dosyalarından oluşur:

### Foundation files

- `src/app/(public)/live/[username]/_components/LiveWatchSurfaceNoticeProvider.tsx`
- `src/app/(public)/live/[username]/_components/LiveWatchSurfaceNotice.tsx`
- `src/app/(public)/live/[username]/_components/live-watch-surface-notice.module.css`
- `src/app/(public)/live/[username]/_components/live-watch-route-shell.tsx`

### Drawer success seam files

- `src/app/(public)/live/[username]/_components/LiveWatchGuestAuthDrawer.tsx`
- `src/app/(public)/live/[username]/_controllers/LiveWatchChatController.tsx`

### Close-out docs

- `docs/live-watch-surface-notice-foundation-closeout.md`
- `docs/live-watch-surface-notice-layer-final-closeout.md`

## 5. Mekanizma haritası

Yapının çalışma zinciri:

```text
LiveWatchRouteShell
  → LiveWatchSurfaceNoticeProvider
    → route-local notice context
    → internal fixed notice host
    → LiveWatchSurfaceNotice

LiveWatchChatController
  → useLiveWatchSurfaceNotice()
  → showNotice(...)

LiveWatchGuestAuthDrawer
  → login/register success
  → onAuthSuccess?.()
  → router.refresh()
  → requestDrawerClose()
```

Bu zincirde sorumluluklar ayrıdır:

```text
LiveWatchRouteShell
  → notice provider'ı route-local yüzeye takar

LiveWatchSurfaceNoticeProvider
  → notice state, timer, delay, duration, exit cleanup yönetir

LiveWatchSurfaceNotice
  → sadece görünür pill/badge render eder

live-watch-surface-notice.module.css
  → konum, görünüm ve motion tasarımını taşır

LiveWatchGuestAuthDrawer
  → login/register success anını parent'a haber verir

LiveWatchChatController
  → success sinyalini alır ve showNotice çağırır
```

## 6. Çalışma akışı

### Login success akışı

```text
Guest kullanıcı /live/[username] açar
→ yorum için giriş drawer'ını açar
→ login form başarılı olur
→ LiveWatchGuestAuthDrawer.handleAuthSuccess çalışır
→ onAuthSuccess?.() çağrılır
→ LiveWatchChatController.handleGuestAuthSuccess çalışır
→ showNotice schedule edilir
→ router.refresh() çalışır
→ requestDrawerClose() çalışır
→ drawer kapanır
→ notice delay sonrası görünür
→ 2.5 saniye sonra exit motion başlar
→ animationend sonrası cleanup olur
```

### Register success akışı

```text
Guest kullanıcı /live/[username] açar
→ yorum için giriş drawer'ını açar
→ Kayıt sekmesine geçer
→ register form başarılı olur
→ login ile aynı handleAuthSuccess hattı çalışır
→ aynı welcome notice görünür
```

### Manual close akışları

Aşağıdaki durumlar notice tetiklemez:

```text
Drawer X ile kapatma
Backdrop click ile kapatma
Escape / dialog cancel ile kapatma
Manual close path
/auth route login/register
Menü veya başka auth akışı
```

## 7. Notice lifecycle

Notice provider tek aktif notice modeli kullanır.

```text
idle
→ visible
→ exiting
→ idle
```

Davranışlar:

* `showNotice()` boş mesaj alırsa no-op yapar.
* Aktif notice varken yeni notice gelirse replace+restart yapar.
* Queue/list sistemi yoktur.
* `delayMs`, notice görünmeden önce bekleme süresidir.
* `durationMs`, notice görünür olduktan sonra başlar.
* Duration bitince notice hemen silinmez; önce `exiting` phase'e geçer.
* Exit tamamlanınca notice temizlenir.
* Exit event kaçarsa provider fallback cleanup devreye girer.
* Unmount sırasında timer'lar temizlenir.

Current auth success notice değerleri:

```text
delayMs: 650
durationMs: 2500
message: Poncik’e hoş geldiniz
tone: success
```


## 8. Görünüm, konum ve motion

Bildirim `/live/[username]` yüzeyinde route-local fixed notice layer olarak görünür.

Konum:

```text
Üst-orta
Top chrome altında
Video/media içine gömülü değil
Drawer içine gömülü değil
Chat/composer içine gömülü değil
```

Görsel karakter:

```text
Dark glass pill
Kompakt badge/toast görünümü
Soft border
Hafif shadow
Yeşil success indicator/check
Okunur açık renk metin
Mobile-first max-width
pointer-events: none
```

Motion karakteri:

```text
Entry:
  opacity 0 → 1
  translateY(-0.55rem) → 0
  scale(0.985) → 1

Exit:
  opacity 1 → 0
  translateY(0) → -0.55rem
  scale(1) → 0.985
```

Entry ve exit aynı motion ailesindedir. Exit, entry değerlerinin ters sırasını kullanır.

Performans kararı:

```text
Sadece opacity + transform animate edilir.
Top/left/width/height animasyonu yoktur.
Blur/shadow animasyonu yoktur.
Video/media katmanına efekt uygulanmaz.
```

Reduced motion:

```text
prefers-reduced-motion: reduce altında animasyon süresi minimuma indirilir.
```

## 9. Dosya sorumlulukları

### `LiveWatchSurfaceNoticeProvider.tsx`

Görevi:

```text
Route-local notice context kurar.
useLiveWatchSurfaceNotice() hook'unu export eder.
showNotice() API'sini sağlar.
Tek aktif notice state'ini yönetir.
delay/duration/exit timer'larını yönetir.
replace+restart lifecycle uygular.
provider dışında hook çağrılırsa açık error verir.
```

Bu dosya:

```text
Global store değildir.
App-wide provider değildir.
Auth logic taşımaz.
Drawer logic taşımaz.
Media/playback logic taşımaz.
```

### `LiveWatchSurfaceNotice.tsx`

Görevi:

```text
Render-only notice pill component'idir.
Mesajı, success indicator'ı ve accessibility attributelerini render eder.
Exit animation cleanup'ını animationend üzerinden tamamlar.
```

Bu dosya:

```text
Timer yönetmez.
Auth state bilmez.
Drawer state bilmez.
Global notification state tutmaz.
```

### `live-watch-surface-notice.module.css`

Görevi:

```text
Notice layer konumu
Pill görünümü
Success indicator görünümü
Entry/exit keyframe motion
Mobile width/padding
Reduced motion davranışı
```

Bu dosya:

```text
Drawer CSS'i değildir.
Top chrome CSS'i değildir.
Media/video CSS'i değildir.
Global toast CSS'i değildir.
```

### `live-watch-route-shell.tsx`

Görevi:

```text
LiveWatchSurfaceNoticeProvider'ı /live/[username] route shell seviyesine takar.
Notice layer'ı route-local tutar.
Top chrome ve content stack davranışını korur.
```

### `LiveWatchGuestAuthDrawer.tsx`

Görevi:

```text
Login/register success anında opsiyonel onAuthSuccess seam'i çağırır.
Mevcut router.refresh() + requestDrawerClose() success akışını korur.
```

Bu dosyada değişmeyenler:

```text
Drawer visual
Drawer CSS
Drawer open/close motion
Drawer lifecycle
Dialog cancel/backdrop/X close paths
```

### `LiveWatchChatController.tsx`

Görevi:

```text
useLiveWatchSurfaceNotice() hook'unu tüketir.
Drawer auth success geldiğinde welcome notice schedule eder.
Drawer open/close state owner görevini korur.
```

Bu dosyada değişmeyenler:

```text
Chat submit
Realtime binding
Draft state
Message state
LiveWatchChatSurface wiring
```

## 10. İleride nasıl genişletilir?

Bu yapı ileride `/live/[username]` içinde başka kısa yüzey bildirimleri için kullanılabilir.

Doğru kullanım:

```ts
const { showNotice } = useLiveWatchSurfaceNotice();

showNotice({
  message: "Mesaj gönderildi",
  tone: "success",
  delayMs: 0,
  durationMs: 2500
});
```

Kural:

```text
Yeni bildirim /live/[username] route içinde kalıyorsa mevcut hook kullanılabilir.
Yeni bildirim /studio yüzeyinde gerekiyorsa bu dosyalar import edilmez.
Studio için ayrı route-local StudioNoticeLayer kurulmalıdır.
```

Doğru genişletme prensibi:

```text
Route-local kal.
Global/shared toast açma.
Media/video dosyalarına notice state gömme.
Drawer içine bildirim render etme.
Auth action içine UI notification koyma.
DB veya server action üzerinden UI toast yönetme.
```

Yeni tone gerekiyorsa:

```text
Önce gerçek kullanım kanıtı olmalı.
Sonra yalnız route-local payload ve CSS genişletilmeli.
Multi-tone önceden açılmamalı.
```

Yeni queue/list gerekiyorsa:

```text
Şu an queue yok.
Replace+restart davranışı bilinçli seçildi.
Queue/list ancak gerçek ürün ihtiyacı ve kanıtla ayrı turda düşünülmeli.
```

## 11. God file riskini önleme kuralları

Bu sistemin büyürken bozulmaması için:

```text
Provider'a auth business logic ekleme.
Provider'a drawer state ekleme.
Provider'a chat state ekleme.
Provider'a media/playback state ekleme.
Provider'a analytics/logging gibi unrelated işler ekleme.
Notice component'e timer/state ekleme.
CSS'e unused selector bırakma.
shared/ui/toast açma.
```

Dosya sınırları:

```text
Provider = state/timer/lifecycle
Notice component = render/accessibility/event boundary
CSS module = görünüm/konum/motion
Controller = ilgili route event'inden showNotice çağırma
Drawer = success seam'i parent'a haber verme
```

## 12. Validation

Implementation boyunca kullanılan validation:

```text
git diff --check: PASS
npm run lint: PASS
npm run build: PASS
```

Forbidden scope kontrolleri:

```text
Drawer CSS değişmedi.
Login/register form dosyaları değişmedi.
Auth action dosyaları değişmedi.
/auth route değişmedi.
Media/playback/LiveKit/WebRTC dosyaları değişmedi.
DB/migration yok.
Global/shared toast yok.
```

## 13. Manual smoke checklist

Owner manual smoke sonucu doğrulanan ana davranışlar:

```text
Register success sonrası notice görünüyor.
Login success sonrası notice görünüyor.
Notice live yüzeyinde doğru konumda görünüyor.
Notice drawer içinde çıkmıyor.
Notice top chrome/media içine gömülü görünmüyor.
Notice yaklaşık 2.5 saniye okunabilir kalıyor.
Notice giriş/çıkış motion'ı aynı aileye hizalandı.
X ile drawer kapatınca notice çıkmıyor.
Backdrop ile drawer kapatınca notice çıkmıyor.
Escape/dialog cancel ile drawer kapatınca notice çıkmıyor.
/auth üzerinden login/register notice tetiklemiyor.
Drawer tekrar açılma davranışı bozulmadı.
```

## 14. Risk notları

* `LiveWatchSurfaceNoticeProvider.tsx` tek görev taşıdığı için kabul edildi; ancak ileride gereksiz feature eklenmemelidir.
* Bu sistem yalnız `/live/[username]` route-local bildirim ihtiyacını çözer.
* `/studio` için aynı dosyalar kullanılmamalı; gerekirse ayrı route-local studio notice sistemi kurulmalıdır.
* Browser password manager prompt gibi native browser katmanları app notice layer'ın üstüne çıkabilir. Bu beklenen browser davranışıdır.
* Notice bu browser/native promptların üstüne çıkmaya çalışmamalıdır.

## 15. Commit bilgisi

Foundation commit:

```text
dacd206 — live: add surface notice foundation
```

Planned final commit message:

```text
live: wire and polish auth success notice
```

## 16. Final hüküm

Bu çalışma ile `/live/[username]` yüzeyinde hafif, route-local, performans dostu ve genişletilebilir bir in-app notice sistemi kurulmuştur.

Mevcut ilk kullanım:

```text
Guest drawer login/register success
→ drawer kapanır
→ Poncik’e hoş geldiniz notice'ı görünür
→ 2.5 saniye sonra symmetric exit motion ile kaybolur
```

Sistem, global toast açmadan ve medya/drawer/auth sınırlarını kirletmeden çalışır.
