# Live Watch Guest Auth Drawer Close-out

## 1. Kısa hüküm

`PASS WITH NOTES`.

Bu doküman, `/live/[username]` guest auth drawer işinin hem close-out raporu hem de ileride aynı drawer mantığını başka bir yerde yeniden kurmak için kullanılacak cherry-pick / rebuild kaynak dokümanıdır.

Bu drawer yalnız login + user register akışını canlı izleme yüzeyi içinde çözmek için route-local olarak kuruldu. V1 watch public kalır; bu drawer izleme erişimini kapatan auth wall değildir. Drawer, chat composer’dan auth gerektiren etkileşim başlatıldığında kullanıcıya giriş / kayıt yüzeyi açar.

Final kabul çizgisi:

- Guest canlı yayını izlemeye devam eder.
- Auth drawer aynı live scene içinde açılır.
- Login ve user register drawer içinde çözülür.
- Keyboard açıkken password focus durumunda CTA görünür kalır.
- Drawer tab değişimlerinde yükseklik / geometry zıplaması üretilmez.
- Overlay / karartma katmanı finalde kaldırılmıştır.
- Final motion panel-only çizgiye indirilmiştir.
- Android Chrome / Redmi gerçek cihaz ana acceptance cihazıdır.
- Firefox Android compatibility debt olarak ayrı bırakılmıştır.

## 2. Amaç

Bu close-out dokümanının amacı:

- bu drawer’ın nasıl kodlandığını A’dan Z’ye belgelemek
- hangi dosyada hangi sorumluluğun yaşadığını göstermek
- cherry-pick yapılacaksa hangi dosyaların birlikte alınacağını netleştirmek
- keyboard / CTA / input görünürlüğü kontratını kalıcılaştırmak
- drawer motion ve Android Chrome jank derslerini kaybetmemek
- ileride aynı component yeniden tasarlanırsa tek seferde temiz başlanacak yolu tarif etmek
- yapılması gerekenler / yapılmaması gerekenler listesini kalıcı hale getirmek

Bu doküman yalnız bugünkü close-out değildir. Aynı zamanda ileride şu işlerde kaynak dokümandır:

- drawer yeniden kurulum
- auth drawer cherry-pick
- modal mı drawer mı karar analizi
- Android keyboard + CTA görünürlük rehberi
- route-local component sınırı rehberi
- motion / overlay jank guard
- future Vaul / shadcn drawer karşılaştırması

## 3. Canonical proje sınırı

Bu drawer işi aşağıdaki canonical sınırları korur:

- Canonical route omurgası değişmedi:
  - `/`
  - `/auth`
  - `/live/[username]`
  - `/studio`
- Drawer yalnız `/live/[username]` route-local scope içindedir.
- Shared/global drawer sistemi açılmadı.
- `shared/ui` açılmadı.
- Generic modal abstraction açılmadı.
- V2/V3 alanı açılmadı.
- Watch public çizgisi bozulmadı.
- Guest ve user canlı yayını izleyebilir.
- Auth duvarı watch yüzeyine vurulmadı.
- Viewer yalnız izler ve geri döner çizgisi korundu.
- Auth route truth’u değiştirilmedi.
- DB truth’u değiştirilmedi.

## 4. Scope

Bu close-out’un kapsamı:

- `/live/[username]` guest auth drawer
- guest auth entry wiring
- login drawer flow
- user register drawer flow
- keyboard / focus / CTA stability
- login/register tab değişimi
- same live scene continuity
- drawer visual polish
- drawer open/close motion
- Android Chrome real-device smoke sonucu
- cherry-pick / rebuild kaynak haritası

Bu işin üründeki anlamı:

- Viewer canlı yayını izlemeye devam eder.
- Kullanıcı chat/composer üzerinden auth gerektiren aksiyona geldiğinde drawer açılır.
- Ayrı `/auth` hop’una zorunlu yönlendirme yapılmaz.
- V1 public watch gate’e dönüşmez.

## 5. Non-scope

Bu drawer işi şunları kapsamaz:

- V2 paid 1v1 gate
- dakika / bakiye / ödeme
- gift / DM / sosyal / growth alanları
- global modal sistemi
- shared UI drawer component’i
- Vaul/shadcn migration
- publisher auth/register
- admin auth
- password reset self-service
- Firefox Android final compatibility fix
- iOS/Safari final acceptance
- DB model değişikliği
- route değişikliği
- `/auth` route’unu değiştirme
- `/studio` yüzeyine drawer taşıma
- chat persistence
- realtime transport değişikliği
- LiveKit transport değişikliği

## 6. GitHub’da teyit edilen önceki commitler

Bu drawer hattının önceki canonical commitleri:

### 6.1. Guest auth drawer temel commit

Commit:

```txt
2c0cc0e4a27a17f469eb1948983d2cca4842d595
```

Commit mesajı:

```txt
live: add guest auth drawer
```

Bu committe temel guest auth drawer hattı eklendi:

- live watch guest auth actions
- live watch guest auth action state
- drawer shell
- login form
- register form
- viewport / keyboard hook
- drawer CSS
- ilk close-out dokümanı

Bu commitin anlamı:

- drawer’ın temel auth form ve keyboard/CTA omurgası kuruldu
- login/register drawer flow eklendi
- Android Chrome gerçek cihaz smoke bilgisi ilk close-out’a yazıldı
- Firefox Android compatibility debt olarak bırakıldı

### 6.2. Chat entry wiring commit

Commit:

```txt
c8fffef7cf3f12c79199bf141b2098ebb2bb2c4e
```

Commit mesajı:

```txt
live: wire guest auth drawer chat entry
```

Bu committe guest auth drawer chat entry’ye bağlandı:

- `LiveWatchChatSurface.tsx`
- `live-watch-chat.module.css`
- `LiveWatchChatController.tsx`
- close-out kapsam güncellemesi

Bu commitin anlamı:

- `/auth` link davranışı drawer açan route-local butona çevrildi
- guest composer CTA artık aynı live scene içinde drawer açıyor
- chat controller drawer open/close state sahibi oldu
- chat surface/controller değişiklikleri drawer entry wiring kapsamına alındı

## 7. Yerelde commitlenecek final worktree scope

Bu doküman tamamlandıktan sonra birlikte commitlenecek beklenen yerel scope:

```txt
src/app/(public)/live/[username]/_components/LiveWatchGuestAuthDrawer.tsx
src/app/(public)/live/[username]/_components/live-watch-guest-auth-drawer.module.css
docs/live-watch-guest-auth-drawer-closeout.md
```

Bu yerel final scope’un anlamı:

- `LiveWatchGuestAuthDrawer.tsx`: lifecycle-controlled drawer open/close akışı
- `live-watch-guest-auth-drawer.module.css`: final visual polish + panel-only motion + overlay removal
- `docs/live-watch-guest-auth-drawer-closeout.md`: bu A’dan Z’ye close-out / cherry-pick kaynak dokümanı

Final doküman commit mesajı önerisi:

```txt
docs: expand guest auth drawer closeout
```

Eğer final commit yalnız doküman değil, mevcut TSX/CSS final patch ile birlikte atılacaksa daha doğru commit mesajı:

```txt
live: finalize guest auth drawer motion
```

## 8. Exact changed files

Bu drawer işinin toplam kaynak dosya kapsamı:

```txt
src/app/(public)/live/[username]/_actions/live-watch-guest-auth-actions.ts
src/app/(public)/live/[username]/_lib/live-watch-guest-auth-action-state.ts
src/app/(public)/live/[username]/_components/LiveWatchGuestAuthDrawer.tsx
src/app/(public)/live/[username]/_components/LiveWatchGuestLoginForm.tsx
src/app/(public)/live/[username]/_components/LiveWatchGuestRegisterForm.tsx
src/app/(public)/live/[username]/_components/useLiveWatchGuestAuthViewport.ts
src/app/(public)/live/[username]/_components/live-watch-guest-auth-drawer.module.css
src/app/(public)/live/[username]/_components/LiveWatchChatSurface.tsx
src/app/(public)/live/[username]/_components/live-watch-chat.module.css
src/app/(public)/live/[username]/_controllers/LiveWatchChatController.tsx
docs/live-watch-guest-auth-drawer-closeout.md
```

Toplam:

- 10 route-local source dosyası
- 1 close-out dokümanı
- toplam 11 dosya

## 9. Dosya ownership haritası

### 9.1. `LiveWatchChatController.tsx`

Ana görev:

- chat/composer karar katmanı
- guest auth drawer open/close state sahibi
- guest auth entry callback’ini chat surface’e geçirir
- drawer component’i route-local olarak live watch yüzeyine bağlar

Bu dosya drawer UI çizmez.

Bu dosyada olmaması gerekenler:

- drawer CSS
- keyboard ölçüm matematiği
- auth action implementation
- form markup detayları
- modal visual polish

### 9.2. `LiveWatchChatSurface.tsx`

Ana görev:

- chat/composer görünür yüzeyi
- guest kullanıcı auth gerektiren aksiyona geldiğinde drawer açma callback’ini tetikler
- guest CTA’yı link yerine button olarak taşır
- composer chip / auth entry wiring tarafını taşır

Bu dosyada olmaması gerekenler:

- drawer lifecycle state
- drawer form state
- keyboard hook
- auth server action
- drawer motion logic

### 9.3. `live-watch-chat.module.css`

Ana görev:

- chat/composer yüzeyi için görsel düzen
- guest auth entry görünümü
- composer chip cleanup / hizalama
- guest action button stilleri

Drawer panel geometry’si bu dosyada değildir.

Bu dosyada olmaması gerekenler:

- drawer panel height
- drawer input height
- drawer CTA reserve
- drawer open/close motion
- dialog/backdrop/scrim kuralları

### 9.4. `LiveWatchGuestAuthDrawer.tsx`

Ana görev:

- drawer görünür shell
- native dialog lifecycle
- open / opening / closing / closed fazları
- Escape / cancel / backdrop click / X close funnel
- login/register tab state
- login/register form render orchestration
- body scroll lock bağlantısı
- viewport hook bağlantısı
- auth success sonrası router refresh + close akışı

Bu dosya auth action implementation değildir.

Bu dosya keyboard ölçüm matematiğinin ana sahibi değildir; keyboard/focus/CTA capacity işi hook içindedir.

Bu dosyada olmaması gerekenler:

- server action kodu
- form field validation implementation
- CSS motion değerlerinin dağınık inline hali
- chat transport logic
- LiveKit logic
- DB logic

### 9.5. `live-watch-guest-auth-drawer.module.css`

Ana görev:

- drawer panel geometry
- tab görünümü
- input / label / CTA görsel dili
- panel-only motion
- safe-area padding
- body/form scroll ownership görsel kontratı
- reduced-motion CSS kontratı
- final overlay removal

Final motion çizgisi bu dosyadadır:

```txt
dialog transparent shell
native backdrop transparent
no overlay
no scrim
panel-only transform motion
```

Bu dosyada olmaması gerekenler:

- global `:root` token açma
- shared UI token sistemi
- unrelated chat layout rewrite
- height/top/bottom transition
- filter / backdrop-filter ile drawer motion
- `transition: all`

### 9.6. `useLiveWatchGuestAuthViewport.ts`

Ana görev:

- Android keyboard / visualViewport davranışı
- active input tespiti
- target group tespiti
- CTA görünürlüğü için bounded correction
- submit slack / reserve hesabı
- bounded settle scheduler
- cleanup

Bu dosya drawer görsel polish dosyası değildir.

Bu dosyada olmaması gerekenler:

- renk / shadow / border polish
- panel motion
- dialog open/close lifecycle
- auth action
- chat entry wiring

### 9.7. `LiveWatchGuestLoginForm.tsx`

Ana görev:

- login form alanları
- form marker contract
- submit button
- login action state bağlantısı
- success callback tetikleme

Bu dosya drawer yüksekliği veya viewport correction yönetmez.

### 9.8. `LiveWatchGuestRegisterForm.tsx`

Ana görev:

- user register form alanları
- form marker contract
- submit button
- register action state bağlantısı
- success callback tetikleme

Bu dosya drawer yüksekliği veya viewport correction yönetmez.

### 9.9. `live-watch-guest-auth-actions.ts`

Ana görev:

- login/register server action sınırı
- auth işleminin route-local action hattı
- publisher hesapla yorum engeli
- user/admin login success kabulü
- user register success kabulü

Bu dosya UI lifecycle veya keyboard logic taşımaz.

### 9.10. `live-watch-guest-auth-action-state.ts`

Ana görev:

- auth action state tipleri
- initial action state
- form action sonucunun UI tarafına güvenli taşınması

Bu dosya görünür UI veya motion taşımaz.

### 9.11. `docs/live-watch-guest-auth-drawer-closeout.md`

Ana görev:

- close-out raporu
- cherry-pick dosya haritası
- rebuild rehberi
- keyboard/CTA kontratı
- visual/motion final reçetesi
- hatalardan öğrenilenler
- yapılacaklar / yapılmayacaklar
- commit ve validation kaydı

Bu doküman implementation dosyası değildir.

## 10. Dosya sorumluluk ayrımı

Bu drawer işinde dosya sorumluluğu şu şekilde ayrıldı:

```txt
Controller karar verir.
Surface kullanıcı aksiyonunu yakalar.
Drawer shell görünür yüzeyi orkestre eder.
Form dosyaları sadece form render eder.
Hook keyboard/focus/CTA capacity ölçer.
CSS panel geometry, görünüm ve motion taşır.
Action dosyaları auth sınırını taşır.
Close-out dokümanı kanıt / reçete / cherry-pick kaynağıdır.
```

Bu ayrımın amacı:

- god file oluşmasını engellemek
- keyboard matematiğini CSS polish’ten ayırmak
- form markup’ını lifecycle’dan ayırmak
- action/server logic’i UI’dan ayırmak
- chat entry wiring’i drawer internals’tan ayırmak
- ileride cherry-pick yaparken hangi dosyanın neden gerektiğini açık tutmak

## 11. Final durum mimari özeti

Final kabul edilen mimari:

```txt
LiveWatchChatController
  -> LiveWatchChatSurface
    -> auth required action
      -> opens LiveWatchGuestAuthDrawer

LiveWatchGuestAuthDrawer
  -> login/register tab state
  -> LiveWatchGuestLoginForm
  -> LiveWatchGuestRegisterForm
  -> useLiveWatchGuestAuthViewport
  -> live-watch-guest-auth-drawer.module.css
```

Final kabul edilen görsel/motion çizgisi:

```txt
transparent native dialog shell
transparent native backdrop
no overlay
no scrim
panel-only transform motion
```

Final kabul edilen keyboard çizgisi:

```txt
.body = only scroll owner
.form = content reserve owner
submit slack only for password + submit targets
bounded settle scheduler
no scrollIntoView
no visualViewport.scroll
no polling
```

## 12. Validation özeti

Son bilinen doğrulama komutları:

```txt
git diff --check: PASS
npm run lint: PASS
npm run build: PASS
```

Real-device smoke ana cihaz:

```txt
Android Chrome / Redmi
```

Kabul edilen smoke başlıkları:

- Register password focus + Google suggestion/autofill açıkken `Kayıt ol` CTA görünür: PASS
- Login password focus + Google suggestion/autofill açıkken `Giriş yap` CTA görünür: PASS
- Login/register password CTA hizası aynı: PASS
- X/kapat görünür kaldı: PASS
- Video/page drift gözlenmedi: PASS
- Overlay kaldırıldıktan sonra drawer açılışı büyük ölçüde düzeldi: PASS WITH NOTES

## 13. Patch ilerleme durumu

Bu doküman 4 parça halinde genişletilmektedir.

```txt
Patch 1: canonical close-out + scope + file ownership haritası
Patch 2: lifecycle + keyboard/focus/CTA kontratı
Patch 3: visual polish + motion + do/don’t + modal/drawer karar notu
Patch 4: cherry-pick / rebuild guide + validation matrix + final staging notları
```

Şu an yazılan bölüm:

```txt
Patch 1 tamamlandı.
```

Sıradaki bölüm:

```txt
Patch 2: lifecycle + keyboard/focus/CTA kontratı
```

## 14. Git notu

Bu doküman güncellemesi sırasında commit/push yapılmadı.

Final doküman tamamlandıktan sonra önerilen commit mesajı:

```txt
docs: expand guest auth drawer closeout
```

Eğer final doküman mevcut drawer TSX/CSS final patch ile birlikte commitlenecekse önerilen commit mesajı:

```txt
live: finalize guest auth drawer motion
```

## 15. Drawer lifecycle kontratı

Bu drawer’ın lifecycle amacı:

```txt
guest auth ihtiyacı doğduğunda
aynı live scene içinde
sayfa değiştirmeden
login/register yüzeyini açmak
```

Drawer lifecycle iki ayrı şeyi birlikte yönetir:

```txt
1. React state lifecycle
2. Native dialog lifecycle
```

Bunlar aynı şey değildir.

React state tarafı:

```txt
isOpen
drawerState
activeTab
drawerSessionKey
```

Native dialog tarafı:

```txt
dialog.showModal()
dialog.close()
cancel event
close event
```

Bu ayrım önemlidir çünkü native `<dialog>` anında açılıp kapanabilir. Biz ise panel motion’ın görünür olması için dialog’u hemen kapatmayıp önce `closing` state’ini gösteriyoruz.

## 16. Açılış akışı

Drawer açılışı şu sırayla çalışır:

```txt
Guest composer CTA tıklanır
-> LiveWatchChatSurface onGuestAuthRequest çağırır
-> LiveWatchChatController isGuestAuthDrawerOpen = true yapar
-> LiveWatchGuestAuthDrawer isOpen=true alır
-> dialog.showModal() çağrılır
-> drawerState = opening
-> panel offscreen bekler
-> sonraki frame zincirinde drawerState = open
-> panel transform ile yukarı çıkar
```

Bu akışın amacı:

- dialog önce DOM/top-layer içinde görünür hale gelsin
- panel ilk frame’de offscreen pozisyonu alsın
- sonra open state ile transition başlasın
- panel ilk paint’te yarı yolda görünmesin
- Android Chrome’da ani zıplama azalır

Açılışta final motion:

```txt
opening:
  panel offscreen
  transition: none

open:
  panel translateY(0)
  transition-property: transform
  transition-duration: 280ms
  transition-timing-function: linear
```

Açılışta bilinçli olarak yapılmayanlar:

```txt
dialog background fade yok
backdrop karartması yok
scrim opacity yok
height transition yok
top/bottom transition yok
filter yok
backdrop-filter yok
```

## 17. Kapanış akışı

Drawer kapanışı şu sırayla çalışır:

```txt
X / backdrop click / Escape / auth success close tetiklenir
-> requestDrawerClose çalışır
-> drawerState = closing
-> panel transform ile aşağı iner
-> transition bitince veya güvenli timeout sonrası dialog.close()
-> drawerState = closed
-> local form/tab state resetlenir
```

Kapanışta native `dialog.close()` hemen çağrılmaz. Bunun sebebi:

```txt
Eğer dialog hemen kapanırsa panel kapanış animasyonu görünmeden top-layer’dan düşer.
```

Final kapanış çizgisi:

```txt
closing:
  transition-property: transform
  transition-duration: var(--live-auth-drawer-duration)
  transition-timing-function: var(--live-auth-drawer-ease)
```

Shared motion variable’lar:

```txt
--live-auth-drawer-duration
--live-auth-drawer-ease
```

Bu variable’lar `.dialog` içinde durabilir ama dialog’a motion vermez. Closing selector bu variable’ları kullanır.

Bu yüzden şu ikisi karıştırılmamalı:

```txt
.dialog içindeki custom property = güvenli
.dialog üzerinde background transition = yasak
```

## 18. Drawer state sözlüğü

Bu componentte kullanılan anlamlar:

### `closed`

Drawer görünür değildir.

Beklenen durum:

```txt
dialog native olarak kapalı
panel görünmez
body scroll lock yok
keyboard correction yok
```

### `opening`

Drawer açılış staging fazıdır.

Beklenen durum:

```txt
dialog açık
panel offscreen
transition none
overlay yok
```

Amaç:

```txt
ilk frame’i güvenli offscreen hazırlamak
```

### `open`

Drawer aktif ve görünür fazdır.

Beklenen durum:

```txt
dialog açık
panel görünür
form aktif
keyboard hook aktif
body scroll lock aktif
```

### `closing`

Drawer kapanış fazıdır.

Beklenen durum:

```txt
dialog hâlâ açık
panel aşağı iniyor
dialog.close() henüz çağrılmadı
keyboard hook cleanup’a hazırlanıyor
```

Amaç:

```txt
kapanış animasyonunu göstermek
sonra native dialog’u kapatmak
```

## 19. Close trigger kaynakları

Drawer şu kaynaklardan kapanabilir:

```txt
X close button
native cancel / Escape
dialog backdrop click
login success
register success
parent isOpen=false
```

Hepsi aynı close funnel’a gitmelidir.

Dağınık close yazılmamalı.

Doğru yaklaşım:

```txt
tek close request fonksiyonu
tek state geçişi
tek cleanup yolu
```

Yanlış yaklaşım:

```txt
her button kendi içinde dialog.close() çağırsın
form success direkt native close yapsın
Escape ayrı state resetlesin
```

Bu yanlış olur çünkü lifecycle drift üretir.

## 20. Login / register tab kontratı

Drawer içinde iki tab vardır:

```txt
Giriş
Kayıt
```

Tab değişimi sadece görünür formu değiştirir.

Tab değişince yapılmaması gerekenler:

```txt
panel height yeniden hesaplanmasın
dialog yeniden showModal yapmasın
body scroll owner değişmesin
keyboard hook yeniden mimari değiştirmesin
CTA reserve sistemi bozulmasın
```

Tab değişince olması gerekenler:

```txt
activeTab değişir
ilgili form render edilir
body scroll alanı aynı kalır
panel geometry aynı kalır
```

Bu yüzden panel grid yapısı sabit tutulur.

Final mental model:

```txt
tab değişiyor
drawer değişmiyor
sadece body içeriği değişiyor
```

## 21. Tab değişince drawer yüksekliği nasıl sabit kalır?

Login form daha kısa, register form daha uzun olabilir.

Bu fark drawer yüksekliğini zıplatmamalıdır.

Final yaklaşım:

```txt
.panel sabit grid iskelet taşır
.body sabit scroll alanı taşır
.form içerik body içinde akar
```

Yani yükseklik yönetimi form dosyasında değil, drawer CSS’tedir.

Ana prensip:

```txt
panel yüksekliği tab içeriğine teslim edilmez
tab içeriği body scroll alanına teslim edilir
```

Bu yüzden:

```txt
.panel = dış kabuk / geometry owner
.body = scroll owner
.form = content owner
```

Tablar arasında geçerken body alanı aynı kaldığı için drawer zıplamaz.

## 22. Body scroll owner kontratı

Drawer içindeki scroll sahibi:

```txt
.body
```

Page/body scroll sahibi değildir.

Form scroll sahibi değildir.

Panel scroll sahibi değildir.

Final kontrat:

```txt
.body {
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
}
```

Neden?

```txt
Keyboard açıldığında sadece drawer içeriği ayarlanmalı.
Sayfanın kendisi zıplamamalı.
Video/live scene drift üretmemeli.
```

Yasak:

```txt
window scroll ile form düzeltmek
document.body scroll ile CTA göstermek
visualViewport.scroll kullanmak
scrollIntoView ile inputa atlamak
```

Bunlar Android Chrome’da drift ve jump riski üretir.

## 23. Form reserve / slack kontratı

Formun görevi içerik taşımaktır.

CTA görünürlüğü için ekstra alt boşluk gerektiğinde bu değer CSS variable ile verilir:

```txt
--live-auth-submit-scroll-slack
```

Form bunu padding-bottom içinde kullanır.

Mental model:

```txt
keyboard açıldı
password input focus
CTA keyboard altında kalma riski var
hook gerekli slack değerini hesaplar
body içindeki form altına reserve verir
body kendi içinde scroll eder
page kıpırdamaz
```

Bu yaklaşımın amacı:

```txt
CTA görünür kalsın
ama drawer geometry değişmesin
```

## 24. Keyboard / focus hook kontratı

`useLiveWatchGuestAuthViewport.ts` bu drawer’ın en hassas dosyalarından biridir.

Ana görevi:

```txt
keyboard açıldığında aktif input + CTA görünürlük ilişkisini korumak
```

Hook şu bilgileri kullanır:

```txt
rootRef
bodyRef
document.activeElement
window.visualViewport
data-live-auth-field
data-live-auth-submit
form mode
field name
```

Hook şu hedefi korur:

```txt
Aktif alan ve gerekli CTA görünür alan içinde kalsın.
Sayfa drift üretmesin.
```

Hook içinde bilinçli guard’lar vardır:

```txt
bounded settle scheduler
short settle
long settle
final settle
submit slack frame
cleanup
```

Bu guard’ların amacı:

```txt
Android keyboard ve suggestion/autofill bar açılırken viewport tek seferde oturmaz.
Birkaç kısa settle adımı gerekir.
```

Ama bu settle sistemi polling değildir.

Yasak:

```txt
setInterval
sonsuz loop
sürekli frame ölçümü
agresif scroll
```

## 25. Form marker contract

Login/register formları hook tarafından okunabilsin diye marker taşır.

Field marker:

```txt
data-live-auth-field="identifier"
data-live-auth-field="email"
data-live-auth-field="username"
data-live-auth-field="password"
```

Submit marker:

```txt
data-live-auth-submit="true"
```

Bu marker’lar tasarım süsü değildir.

Bunlar keyboard/focus/CTA sisteminin kontratıdır.

Yanlış:

```txt
markerları temiz görünsün diye kaldırmak
field adlarını rastgele değiştirmek
submit markerını unutmak
```

Doğru:

```txt
form alanı değişirse hook contract da bilinçli güncellenir
```

## 26. Login form kontratı

Login form alanları:

```txt
identifier
password
submit
```

Kullanıcıya görünen label:

```txt
E-posta veya kullanıcı adı
Şifre
Giriş yap
```

Autocomplete:

```txt
identifier -> username
password -> current-password
```

Success davranışı:

```txt
action success
-> onSuccess
-> router.refresh()
-> drawer close
```

Login formun sahip olmadığı işler:

```txt
drawer close lifecycle detayları
keyboard correction matematiği
tab state
body scroll lock
```

## 27. Register form kontratı

Register form alanları:

```txt
email
username
password
submit
```

Kullanıcıya görünen label:

```txt
E-posta
Kullanıcı adı
Şifre
Kayıt ol
```

Autocomplete:

```txt
email -> email
username -> username
password -> new-password
```

Success davranışı:

```txt
action success
-> onSuccess
-> router.refresh()
-> drawer close
```

Register formun sahip olmadığı işler:

```txt
drawer close lifecycle detayları
keyboard correction matematiği
tab state
body scroll lock
```

## 28. CTA visibility kontratı

En kritik acceptance noktası:

```txt
Keyboard açıkken password focus durumunda CTA görünür kalmalı.
```

Özellikle:

```txt
Register password focus + Google suggestion/autofill açık -> Kayıt ol görünür
Login password focus + Google suggestion/autofill açık -> Giriş yap görünür
```

Bu iki smoke ana kabul kriteridir.

Neden password focus özel?

```txt
Formun en altına en yakın input password’dür.
Password focus olunca keyboard + suggestion/autofill CTA’yı en çok tehdit eder.
```

Bu yüzden submit slack özellikle password + submit target çevresinde anlamlıdır.

## 29. Input focus kontratı

Input focus davranışı:

```txt
focus ring input içinde kalmalı
dışa taşan ring olmamalı
input genişliği focus ile değişmemeli
input height focus ile değişmemeli
```

Final yaklaşım:

```txt
outline none
border-color değişebilir
inset box-shadow kullanılabilir
external glow/ring yok
```

Neden external ring yok?

```txt
Focus ring dışarı taşarsa gerçek cihazda kenarlardan overflow hissi verir.
Keyboard açıkken bu daha belirgin görünür.
```

Bu yüzden focus vurgusu içeride tutulur.

## 30. Keyboard açıkken yapılmaması gerekenler

Yasak liste:

```txt
scrollIntoView
visualViewport.scroll
window.scrollTo ile aktif inputa agresif gitmek
body height transition
panel height transition
top/bottom transition
form submit CTA’yı fixed yapmak
input focus sırasında panel geometry değiştirmek
keyboard açılınca tab layout değiştirmek
```

Bunlar Android Chrome’da şu riskleri üretir:

```txt
page drift
video drift
drawer jump
CTA flicker
keyboard aç/kapa loop
focus kaybı
```

## 31. Keyboard açıkken yapılması gerekenler

Doğru çizgi:

```txt
sadece body scroll owner
sadece gerekli slack kadar padding-bottom
bounded correction
active element gerçekten drawer içinde mi kontrol et
visualViewport varsa ölç, yoksa fallback kullan
page scroll drift olursa eski scrollY’ye geri al
cleanup eksiksiz yap
```

Bu sistemin amacı:

```txt
form kullanılabilir kalsın
ama live scene hareket etmesin
```

## 32. Body scroll lock kontratı

Drawer açıkken sayfa scroll’u kilitlenir.

Ama bu kilit drawer iç scroll’u engellemez.

Mental model:

```txt
document.body overflow hidden
drawer body overflow auto
```

Amaç:

```txt
arka live scene scroll/drift yapmasın
drawer içeriği kendi içinde hareket etsin
```

Close/unmount cleanup şarttır.

Yanlış:

```txt
body overflow hidden set edip cleanup unutmak
```

Doğru:

```txt
önceki overflow değerini sakla
cleanup’ta geri yükle
```

## 33. Auth success kontratı

Login/register success sonrası:

```txt
router.refresh()
drawer close
local drawer state reset
```

Neden router refresh?

```txt
Live watch yüzeyinde access/session state güncellenmeli.
Guest görünümünden authenticated viewer görünümüne geçiş server/client state ile uyumlu olmalı.
```

Neden drawer reset?

```txt
Bir sonraki açılış temiz login tab ile başlasın.
Eski action error/success state görünmesin.
```

Bu yüzden drawer session key kullanımı anlamlıdır.

## 34. Error state kontratı

Auth action error olduğunda:

```txt
form içinde inline error gösterilir
drawer kapanmaz
tab değişmez
inputlar kullanılabilir kalır
```

Error state drawer lifecycle’ı bozmaz.

Yanlış:

```txt
error olunca drawer kapansın
error olunca sayfa /auth’a yönlensin
```

Doğru:

```txt
error form içinde kalır
kullanıcı düzeltir ve tekrar dener
```

## 35. Guest / user / publisher role davranışı

Bu drawer guest auth entry içindir.

Login sonrası kabul edilenler:

```txt
user
admin
```

Publisher için yorum akışı engellenir.

Sebep:

```txt
V1/V2 single-role modelinde publisher ayrı roldür.
Yorum için user hesabı beklenir.
```

Bu drawer publisher registration veya publisher approval yüzeyi değildir.

## 36. Chat entry wiring kontratı

Guest composer CTA:

Eski çizgi:

```txt
/auth link
```

Final çizgi:

```txt
button
-> onGuestAuthRequest
-> drawer open
```

Neden?

```txt
same live scene continuity korunur
viewer yayından kopmaz
ikinci hop açılmaz
auth drawer canlı izleme yüzeyinde çözülür
```

Bu değişiklik chat dosyalarını scope’a dahil eder:

```txt
LiveWatchChatController.tsx
LiveWatchChatSurface.tsx
live-watch-chat.module.css
```

## 37. Drawer açılırken live scene korunumu

Drawer açılırken:

```txt
video yüzeyi route değiştirmez
live watch page reload olmaz
viewer scene korunur
chat surface korunur
```

Auth success sonrası `router.refresh()` yapılır ama bu success sonrasıdır.

Drawer open sırasında route navigation yapılmaz.

Bu, ürün dilindeki hedefle uyumludur:

```txt
viewer izler
auth ihtiyacında drawer açılır
yayın yüzeyinden kopmaz
```

## 38. Lifecycle dosya sınırı

Lifecycle kodu sadece drawer shell içinde kalmalıdır:

```txt
LiveWatchGuestAuthDrawer.tsx
```

Şunlara yayılmamalıdır:

```txt
form dosyaları
chat surface
CSS dosyası
server action
viewport hook
```

CSS motion değerlerini taşır ama lifecycle kararını taşımaz.

Hook keyboard/focus düzeltmesini taşır ama drawer open/close kararını taşımaz.

Form success callback çağırır ama native dialog lifecycle’ı bilmez.

## 39. Patch 2 özeti

Bu bölümde kalıcılaştırılan kontratlar:

```txt
drawer lifecycle
open/opening/closing/closed state sözlüğü
login/register tab height stability
body scroll owner
form reserve/slack
keyboard/focus hook
form marker contract
CTA visibility
auth success/error behavior
chat entry wiring
live scene continuity
```

Bu bölümün acceptance özü:

```txt
Drawer form olarak çalışabilir olmalı.
Keyboard açılınca CTA kaybolmamalı.
Tab değişince drawer zıplamamalı.
Auth işlemi yayını koparmamalı.
```

## 40. Patch ilerleme durumu

```txt
Patch 1 tamamlandı:
canonical close-out + scope + file ownership haritası

Patch 2 tamamlandı:
lifecycle + keyboard/focus/CTA kontratı
```

Sıradaki bölüm:

```txt
Patch 3:
visual polish + motion + do/don’t + modal/drawer karar notu
```

## 41. Görsel polish final kontratı

Bu drawer’ın final görsel amacı:

```txt
canlı izleme yüzeyinin üstünde
hafif, okunur, native hisseden
form odaklı bottom drawer
```

Final görünümde bilinçli tercih:

```txt
arka karartma yok
drawer panel ana odak
CTA violet
inputlar light surface
tablar segmented control hissinde
focus ring input içinde
```

Bu component global design system değildir. Route-local auth drawer’dır.

## 42. Renk kontratı

Final görsel çizgi:

```txt
panel surface: açık / light
input surface: beyaz
tab inactive: muted light surface
tab active: white elevated surface
CTA: violet primary
text: koyu slate/navy
secondary text: slate muted
focus: violet inset emphasis
```

Önemli karar:

```txt
CTA violet kaldı.
Deep navy CTA terk edildi.
```

Neden?

```txt
Poncik light tema primary aksiyon dili violet.
Drawer login/register auth aksiyonu ana CTA olduğu için violet daha doğru.
```

Yapılmaması gereken:

```txt
CTA rengini her yüzeyde kafaya göre lacivert yapmak
dark contract gerekçesiyle light auth drawer CTA’sını karartmak
global token değiştirmek
```

## 43. Boyut / geometry kontratı

Drawer geometry final çizgisi:

```txt
panel genişliği: mobile full width, desktop max width
panel yüksekliği: tab içeriğine göre zıplamaz
body alanı: sabit scroll area
input height: focus/keyboard sırasında değişmez
CTA height: focus/keyboard sırasında değişmez
field gap: keyboard sırasında değişmez
```

Ana kural:

```txt
Focus, keyboard veya tab değişimi geometry değiştirmez.
```

Görsel polish yapılırken izinli olanlar:

```txt
renk
border opacity
shadow yoğunluğu
focus inset shadow
tab active shadow
CTA shadow yoğunluğu
```

Görsel polish yapılırken riskli olanlar:

```txt
input width
input height
CTA height
panel max-height
body height
form gap
padding-bottom davranışı
```

Bu değerler değiştirilecekse önce gerçek cihaz keyboard smoke gerekir.

## 44. Input görünüm kontratı

Input final davranışı:

```txt
light surface
rounded rectangle
border sakin
focus border violet
focus ring input içinde
external glow yok
```

Neden external focus ring yok?

```txt
Gerçek cihazda focus ring dışarı taşmış gibi göründü.
Bu, inputun kenardan dışa vurduğu hissini verdi.
```

Final doğru çizgi:

```txt
.input:focus-visible {
  outline: none;
  border-color: violet tone;
  box-shadow: inset ...
}
```

Yasak:

```txt
0 0 0 3px external ring
focus ile input width/height değiştirmek
focus ile parent padding değiştirmek
```

## 45. CTA görünüm kontratı

CTA final amacı:

```txt
tek ana aksiyon
yüksek okunurluk
native button hissi
aşırı glow yok
```

Final kararlar:

```txt
CTA violet
text white
radius pill
shadow kontrollü
disabled opacity sakin
```

CTA altında çok parlak glow denendi ve fazla geldi. Finalde glow azaltıldı.

Yasak:

```txt
CTA altına ağır bloom/glow
filter animation
box-shadow transition ile ağır motion
disabled state’te layout değiştirme
```

## 46. Tab görünüm kontratı

Tablar segmented control gibi davranır.

Final yapı:

```txt
tabRow = muted rounded container
tabButton inactive = muted text
tabButtonActive = white elevated chip
```

Tab değişince:

```txt
sadece active visual değişir
panel yüksekliği değişmez
body scroll owner değişmez
form reserve bozulmaz
```

Yasak:

```txt
tab değişince panel max-height değiştirmek
tab değişince dialog’u yeniden açıp kapatmak
tab değişince body scroll owner değiştirmek
```

## 47. Motion final kontratı

Final motion çizgisi:

```txt
dialog = transparent shell
backdrop = transparent
overlay = yok
scrim = yok
panel = tek hareket eden görünür katman
```

Açılış:

```txt
opening:
  panel offscreen
  transition none

open:
  transform -> translate3d(0, 0, 0)
  duration 280ms
  timing linear
```

Kapanış:

```txt
closing:
  transform aşağı
  shared duration/ease variable kullanır
```

Not:

```txt
Açılış ve kapanış katman olarak hizalıdır.
İkisi de sadece panel transform hareketidir.
Ama timing birebir aynı değildir.
```

Sebep:

```txt
Kapanış hissi real-device smoke’ta daha iyi bulundu.
Bu yüzden closing mevcut duration/ease ile korundu.
```

## 48. Overlay / backdrop / scrim kararı

Bu drawer’da final karar:

```txt
overlay yok
scrim yok
backdrop transparent
```

Denenen ve terk edilenler:

```txt
dialog background-color overlay
dialog::before opacity scrim
backdrop karartma
```

Neden terk edildi?

```txt
Android Chrome gerçek cihazda açılış junk’ı üretti veya çözmedi.
Panel transform temiz ölçülmesine rağmen görsel junk devam etti.
Overlay katmanı kaldırılınca büyük ölçüde düzeldi.
```

Sonuç:

```txt
Bu drawer tam ekrana yakın açıldığı için arka karartma zorunlu değildir.
Panel-only motion daha stabil ve yeterlidir.
```

## 49. Native akış nasıl sağlandı?

Native hissin kaynağı:

```txt
tek görünür hareketli katman
transform-only panel motion
no overlay fade
no height/top/bottom transition
body scroll lock
drawer body internal scroll
keyboard CTA reserve
focus ring inside
reduced-motion guard
```

Native hissi bozan şeyler:

```txt
aynı anda panel + overlay fade
background-color transition
top-layer paint çakışması
external focus glow
keyboard açılırken panel geometry değiştirmek
```

Final reçete:

```txt
Önce stabil geometry.
Sonra tek transform motion.
En son hafif görsel polish.
Overlay opsiyonel bile olsa önce cihazda test edilmeli.
```

## 50. Modal + drawer kararı

Bu component şu an teknik olarak:

```txt
native dialog shell + custom bottom drawer panel
```

Bunu yapmak zorunlu değildi.

Sadece custom fixed drawer da yapılabilirdi:

```txt
fixed bottom panel
role="dialog"
aria-modal="true"
custom Escape handling
custom outside click
custom body scroll lock
custom focus/accessibility guard
```

Neden dialog seçildi?

```txt
modal semantik
cancel / Escape event
top-layer garantisi
accessibility zemini
body dışı modal davranış
```

Bugünkü ders:

```txt
Dialog seçimi teorik olarak yanlış değildi.
Ama Android Chrome top-layer/overlay davranışı maliyet çıkardı.
```

Sıfırdan başlanırsa karar:

```txt
Eğer gerçek modal semantik kritikse:
  dialog shell veya erişilebilir drawer library değerlendir.

Eğer amaç sadece bottom auth panel ise:
  custom fixed drawer daha sade ve daha kontrollü olabilir.
```

## 51. Shadcn/Vaul notu

shadcn/ui Drawer, Vaul üstüne kurulu hazır drawer yaklaşımıdır.

Bizim drawer:

```txt
route-local custom drawer
native dialog shell
custom panel motion
custom keyboard/CTA hook
```

shadcn/Vaul drawer:

```txt
library-managed drawer
hazır motion/layer davranışı
genel amaçlı component
```

Bu projede Vaul’a geçilmedi çünkü:

```txt
mevcut iş route-local dar scope’ta tutuldu
yeni dependency/pattern açılmadı
keyboard/CTA özel davranışı zaten custom kuruldu
```

Gelecek karar:

```txt
Eğer aynı drawer pattern’i 2-3 farklı yerde tekrar gerekecekse Vaul/shadcn tekrar değerlendirilebilir.
Tek route-local auth drawer için mevcut custom çözüm yeterlidir.
```

## 52. Yapılması gerekenler

Bu drawer yeniden kodlanacaksa:

```txt
önce scope daralt
önce keyboard acceptance belirle
önce dosya ownership çiz
önce panel-only motion ile başla
önce overlay olmadan test et
sonra görsel polish ekle
en son gerçek cihaz smoke yap
```

Kodlama sırası:

```txt
1. controller entry state
2. drawer shell
3. login/register forms
4. action state
5. keyboard hook
6. CSS geometry
7. panel-only motion
8. visual polish
9. real-device keyboard smoke
10. close-out doc
```

## 53. Yapılmaması gerekenler

Yasak / riskli liste:

```txt
global drawer abstraction açmak
shared/ui içine erken taşımak
dialog overlay + panel motion’ı aynı anda tune etmek
background-color transition ile full-screen overlay animasyonu
backdrop-filter kullanmak
filter ile motion hissi vermek
height/top/bottom transition
transition: all
scrollIntoView
visualViewport.scroll
setInterval polling
keyboard açıkken panel geometry değiştirmek
form dosyasına viewport math sokmak
CSS dosyasına lifecycle kararı sokmak
server action içine UI close logic sokmak
```

## 54. Hata geçmişinden çıkarılan dersler

Bu işte en çok zaman kaybettiren alan:

```txt
panel transform temizken hâlâ junkı panelde aramak
```

Doğru teşhis sonradan netleşti:

```txt
panel değil
overlay/top-layer/dialog background katmanı
```

Ölçüm dersi:

```txt
Sadece panel transform ölçümü yeterli değildir.
Kullanıcının gördüğü tüm katmanlar ölçülmelidir:
dialog
backdrop
scrim
panel
arka video/chat layer
```

Ürün dersi:

```txt
Tam ekrana yakın drawer’da overlay şart değildir.
Stabil panel motion, karartmadan daha değerlidir.
```

## 55. Android Chrome jank guard

Android Chrome’da dikkat edilecekler:

```txt
native dialog top-layer ilk paint hassas olabilir
keyboard visualViewport birkaç aşamada oturabilir
Google suggestion/autofill bar CTA’yı tehdit edebilir
full-screen paint transition jank üretebilir
```

Bu yüzden final guard:

```txt
panel transform dışında motion yok
overlay yok
keyboard correction bounded
CTA visibility real-device smoke zorunlu
```

## 56. Accessibility notu

Dialog shell hâlâ accessibility için anlamlıdır.

Korunması gerekenler:

```txt
aria-label
cancel/Escape close
X button aria-label
tablist / tab role
aria-selected
button type="button"
form submit button
inline error role="alert"
```

Dikkat:

```txt
Overlay kaldırıldı diye modal semantik unutulmaz.
Drawer açıkken kullanıcı hâlâ auth modal yüzeydedir.
```

Eğer ileride custom fixed drawer’a geçilirse şunlar manuel sağlanmalıdır:

```txt
role="dialog"
aria-modal="true"
Escape close
outside click close
focus management
body scroll lock cleanup
```

## 57. Performans kontratı

Performans dostu final çizgi:

```txt
transform motion
opacity sadece component içi state için sınırlı kullanılabilir
no fullscreen opacity/paint layer
no filter
no backdrop-filter
no layout transition
no polling
```

Bu drawer’da finalde görünür motion:

```txt
yalnız panel transform
```

Açılış/kapanış performansını bozan riskler:

```txt
overlay fade
blur
box-shadow animation
height animation
top/bottom animation
continuous JS measurement
```

## 58. Patch 3 özeti

Bu bölümde kalıcılaştırılan kararlar:

```txt
visual polish final çizgisi
CTA/input/tab görünüm kontratı
panel-only motion
overlay removal
modal/drawer karar analizi
shadcn/Vaul karşılaştırması
do/don’t listesi
Android Chrome jank dersleri
accessibility/performance guard
```

Bu bölümün acceptance özü:

```txt
Drawer güzel görünsün diye stabilite feda edilmez.
Önce keyboard + panel motion + live scene continuity.
Sonra polish.
```

## 59. Patch ilerleme durumu

```txt
Patch 1 tamamlandı:
canonical close-out + scope + file ownership haritası

Patch 2 tamamlandı:
lifecycle + keyboard/focus/CTA kontratı

Patch 3 tamamlandı:
visual polish + motion + do/don’t + modal/drawer karar notu
```

Sıradaki bölüm:

```txt
Patch 4:
cherry-pick / rebuild guide + validation matrix + final staging notları
```

## 60. Cherry-pick amacı

Bu drawer ileride başka bir özellik için taşınacaksa amaç şudur:

```txt
aynı davranışı almak
ama scope’u büyütmeden almak
```

Cherry-pick yapılırken iki şeyi karıştırma:

```txt
1. Drawer component reçetesi
2. Bu canlı izleme auth kullanım senaryosu
```

Bu dosyadaki component şu senaryo için yazıldı:

```txt
/live/[username] içinde guest kullanıcıya login/register drawer açmak
```

Başka bir özellikte tekrar kullanılacaksa önce şu sorular cevaplanmalı:

```txt
Bu gerçekten auth drawer mı?
Keyboard + CTA visibility gerekiyor mu?
Login/register tabları gerekiyor mu?
Live scene continuity gerekiyor mu?
Native modal semantik gerekiyor mu?
Overlay gerekli mi?
```

Cevaplar aynı değilse dosyalar körlemesine taşınmamalı.

## 61. Cherry-pick dosya paketleri

### 61.1. Full guest auth drawer paketi

Aynı `/live/[username]` guest auth drawer davranışı taşınacaksa birlikte alınması gereken paket:

```txt
src/app/(public)/live/[username]/_actions/live-watch-guest-auth-actions.ts
src/app/(public)/live/[username]/_lib/live-watch-guest-auth-action-state.ts
src/app/(public)/live/[username]/_components/LiveWatchGuestAuthDrawer.tsx
src/app/(public)/live/[username]/_components/LiveWatchGuestLoginForm.tsx
src/app/(public)/live/[username]/_components/LiveWatchGuestRegisterForm.tsx
src/app/(public)/live/[username]/_components/useLiveWatchGuestAuthViewport.ts
src/app/(public)/live/[username]/_components/live-watch-guest-auth-drawer.module.css
src/app/(public)/live/[username]/_components/LiveWatchChatSurface.tsx
src/app/(public)/live/[username]/_components/live-watch-chat.module.css
src/app/(public)/live/[username]/_controllers/LiveWatchChatController.tsx
```

Bu paket drawer’ın gerçek ürün bağlantısını da taşır.

### 61.2. Sadece drawer shell + form paketi

Chat entry olmadan sadece drawer auth yüzeyi alınacaksa minimum paket:

```txt
LiveWatchGuestAuthDrawer.tsx
LiveWatchGuestLoginForm.tsx
LiveWatchGuestRegisterForm.tsx
useLiveWatchGuestAuthViewport.ts
live-watch-guest-auth-drawer.module.css
live-watch-guest-auth-actions.ts
live-watch-guest-auth-action-state.ts
```

Bu pakette yeni parent controller kendi `isOpen/onClose` state’ini vermelidir.

### 61.3. Sadece native bottom drawer şablonu

Auth olmadan sadece drawer şablonu çıkarılacaksa alınacak fikirler:

```txt
transparent dialog shell
transparent backdrop
panel-only transform motion
body scroll owner
safe-area padding
reduced-motion guard
X close
Escape/cancel close
outside click close
```

Ama alınmaması gerekenler:

```txt
auth actions
login/register forms
auth action state
chat entry wiring
role-specific publisher block
```

## 62. Cherry-pick yapılmaması gereken dosyalar

Bu drawer için şu dosyalar normalde cherry-pick scope’una dahil edilmez:

```txt
src/app/(public)/live/[username]/page.tsx
src/app/(public)/live/[username]/_components/LiveWatchPlaybackSurface.tsx
src/app/(public)/live/[username]/_controllers/use-live-watch-playback.ts
src/app/(studio)/studio/*
src/app/(public)/auth/*
shared/*
global CSS
database files
LiveKit adapters
```

Sebep:

```txt
Drawer route-local auth UI işidir.
Playback, studio, DB, LiveKit veya global design system işi değildir.
```

## 63. Temiz rebuild sırası

Bu drawer sıfırdan tekrar kodlanacaksa en temiz sıra:

```txt
1. Scope’u yaz
2. Drawer sadece hangi route’ta yaşayacak belirle
3. Parent controller’da isOpen/onClose state kur
4. Drawer shell component’i kur
5. Close funnel’ı tek yere bağla
6. Login/register form dosyalarını ayrı kur
7. Action state modelini kur
8. Server action sınırını kur
9. Keyboard/focus/CTA hook’unu kur
10. CSS geometry kur
11. Panel-only motion ekle
12. Görsel polish yap
13. Gerçek cihaz keyboard smoke yap
14. Motion smoke yap
15. Close-out dokümanını güncelle
```

Yanlış sıra:

```txt
önce görsel polish
sonra keyboard
sonra lifecycle
sonra action
sonra smoke
```

Doğru sıra:

```txt
önce davranış
sonra keyboard
sonra motion
sonra polish
```

## 64. Minimum component şablonu

Auth dışı bir drawer yeniden yazılacaksa minimum mimari:

```txt
FeatureController.tsx
  state: isDrawerOpen
  handler: openDrawer / closeDrawer

FeatureDrawer.tsx
  props: isOpen, onClose
  lifecycle: opening/open/closing/closed
  shell: dialog veya fixed wrapper
  content slot

feature-drawer.module.css
  transparent shell
  panel geometry
  panel transform motion
  reduced motion
```

Eğer form + keyboard varsa eklenir:

```txt
useFeatureDrawerViewport.ts
FeatureForm.tsx
```

Eğer auth/server action varsa eklenir:

```txt
_actions/*
_lib/*action-state*
```

## 65. Modal kullanılmak zorunda mı?

Hayır.

Drawer için modal zorunlu değildir.

Karar tablosu:

```txt
Sadece kısa panel / bilgilendirme / picker:
  custom fixed drawer yeterli olabilir

Form, auth, destructive action, odak isteyen işlem:
  modal semantik gerekir

Birden fazla route ve tekrar kullanım:
  Vaul/shadcn gibi library değerlendirilebilir

Tek route-local özel davranış:
  custom route-local drawer daha kontrollü olabilir
```

Bu componentte dialog seçildi çünkü:

```txt
auth form modal karakter taşıyor
Escape/cancel davranışı isteniyor
top-layer garantisi isteniyor
accessibility zemini isteniyor
```

Ama bugünkü ders:

```txt
Dialog seçmek overlay kullanmayı zorunlu kılmaz.
Dialog sadece transparent shell olarak kalabilir.
```

## 66. Dialog kullanılacaksa kurallar

Dialog kullanılacaksa:

```txt
showModal lifecycle kontrollü olmalı
close hemen çağrılmamalı
closing state görünmeli
cancel event preventDefault + close funnel
close event cleanup
backdrop transparent olabilir
overlay zorunlu değildir
```

Yasak:

```txt
showModal sonrası aynı frame’de open motion başlatmak
close butonundan direkt dialog.close() yapmak
dialog background-color transition ile overlay fade yapmak
dialog::before scrim’i test etmeden final sanmak
```

## 67. Custom fixed drawer kullanılacaksa kurallar

Dialog yerine custom drawer seçilirse manuel sağlanması gerekenler:

```txt
role="dialog"
aria-modal="true"
Escape close
outside click close
focus return
body scroll lock cleanup
z-index/layer order
safe-area padding
reduced-motion
keyboard/CTA correction
```

Custom drawer daha kontrollüdür ama erişilebilirlik sorumluluğu daha fazladır.

Bu yüzden karar bilinçli verilmelidir.

## 68. Validation matrix

Her değişiklikten sonra çalıştırılacak minimum komutlar:

```bash
git diff --check
npm run lint
npm run build
git status -sb
git diff --name-only
```

Drawer CSS özel grep:

```bash
rg -n "transition:\\s*all|filter:|backdrop-filter|transition-property:\\s*height|transition-property:\\s*top|transition-property:\\s*bottom|scrollIntoView|visualViewport\\.scroll|setInterval" \
  'src/app/(public)/live/[username]/_components/live-watch-guest-auth-drawer.module.css' \
  'src/app/(public)/live/[username]/_components/LiveWatchGuestAuthDrawer.tsx' \
  'src/app/(public)/live/[username]/_components/useLiveWatchGuestAuthViewport.ts'
```

Beklenen:

```txt
transition: all yok
filter yok
backdrop-filter yok
height/top/bottom transition yok
scrollIntoView yok
visualViewport.scroll yok
setInterval yok
```

Overlay removal kontrolü:

```bash
rg -n "\\.dialog::before|data-drawer-state=.*::before|transition-property:\\s*background-color|background-color .*transition|::backdrop.*opacity" \
  'src/app/(public)/live/[username]/_components/live-watch-guest-auth-drawer.module.css'
```

Beklenen:

```txt
.dialog::before yok
dialog background transition yok
backdrop opacity/transition yok
```

Closing variable kontrolü:

```bash
rg -n -- "--live-auth-drawer-duration|--live-auth-drawer-ease|transition-duration: var\\(--live-auth-drawer-duration\\)|transition-timing-function: var\\(--live-auth-drawer-ease\\)" \
  'src/app/(public)/live/[username]/_components/live-watch-guest-auth-drawer.module.css'
```

Beklenen:

```txt
variable’lar duruyor
closing selector variable’ları kullanıyor
```

## 69. Real-device smoke matrix

Ana acceptance cihazı:

```txt
Redmi / Android Chrome
```

Minimum smoke:

```txt
1. Sayfa refresh
2. Drawer ilk açılış
3. Drawer 5 kez aç/kapat
4. Login tab tam görünüm
5. Register tab tam görünüm
6. Login password focus + keyboard açık
7. Register password focus + keyboard açık
8. Google suggestion/autofill açıkken CTA görünürlüğü
9. X/kapat görünürlüğü
10. Video/page drift kontrolü
```

Acceptance:

```txt
ilk açılış büyük junk yok
kapanış bozulmadı
CTA keyboard altında kaybolmuyor
input focus ring dışa taşmıyor
tab değişimi height jump üretmiyor
live scene route değiştirmiyor
```

## 70. Manual smoke notu

Bu drawer için build/lint tek başına yeterli değildir.

Sebep:

```txt
Ana risk TypeScript değil.
Ana risk Android Chrome keyboard + viewport + compositor davranışıdır.
```

Bu yüzden final acceptance her zaman gerçek cihaz smoke ister.

## 71. Final commit / staging disiplini

Bu iş solo main branch üzerinde yürür.

Staging dosya dosya yapılmalıdır.

Genel yasak:

```txt
git add .
git add -A
git stash
git restore
```

Final commit öncesi beklenen worktree dosyaları:

```txt
src/app/(public)/live/[username]/_components/LiveWatchGuestAuthDrawer.tsx
src/app/(public)/live/[username]/_components/live-watch-guest-auth-drawer.module.css
docs/live-watch-guest-auth-drawer-closeout.md
```

Eğer yalnız doküman commitlenecekse önerilen commit mesajı:

```txt
docs: expand guest auth drawer closeout
```

Eğer TSX/CSS final drawer motion patch’i de aynı committe olacaksa önerilen commit mesajı:

```txt
live: finalize guest auth drawer motion
```

Staging örneği:

```bash
git add \
  'src/app/(public)/live/[username]/_components/LiveWatchGuestAuthDrawer.tsx' \
  'src/app/(public)/live/[username]/_components/live-watch-guest-auth-drawer.module.css' \
  'docs/live-watch-guest-auth-drawer-closeout.md'
```

Commit örneği:

```bash
git commit -m "live: finalize guest auth drawer motion"
```

Push örneği:

```bash
git push origin main
```

## 72. Final close-out checklist

Commit öncesi checklist:

```txt
[ ] git status -sb kontrol edildi
[ ] yalnız beklenen dosyalar modified
[ ] git diff --check PASS
[ ] npm run lint PASS
[ ] npm run build PASS
[ ] drawer CSS forbidden grep clean
[ ] overlay/scrim grep clean
[ ] closing variables korunuyor
[ ] useLiveWatchGuestAuthViewport.ts beklenmedik diff almıyor
[ ] Android Chrome smoke owner tarafından PASS / PASS WITH NOTES
[ ] close-out dokümanı güncel
```

## 73. Future refactor guard

Bu drawer ileride refactor edilecekse önce şu sorular sorulmalı:

```txt
Bu refactor kullanıcı değerine direkt hizmet ediyor mu?
Aynı component ikinci kez mi kullanılacak?
Route-local kalması daha güvenli mi?
Keyboard/CTA acceptance tekrar test edilecek mi?
Overlay geri gelecekse gerçek cihazda önce probe edilecek mi?
Vaul/shadcn geçişi dependency ve scope olarak onaylı mı?
```

Refactor için uygun olmayan gerekçe:

```txt
daha temiz görünüyor
shared yapmak iyi olur
ileride lazım olabilir
```

Uygun gerekçe:

```txt
aynı drawer pattern’i 2+ route’ta gerçek ihtiyaç oldu
keyboard/focus davranışı ortaklaştırılacak kadar stabil
test matrix tekrar çalıştırılacak
```

## 74. Known debt

Bilinen notlar:

```txt
Firefox Android final compatibility tamamlanmadı.
iOS/Safari final acceptance bu close-out scope’unda değildir.
Overlay/karartma bilinçli olarak kaldırıldı.
Closing/open timing birebir simetrik değildir.
Drawer hâlâ route-local custom component’tir.
```

Bu debt’ler bug değil; bilinçli scope notudur.

## 75. Kaynak truth özeti

Bu doküman şu truth katmanlarına dayanır:

```txt
1. owner gerçek cihaz smoke sonuçları
2. GitHub’da teyit edilen commitler
3. runtime probe sonuçları
4. route-local repo dosya sınırı
5. canonical V1 scope talimatları
```

GitHub’da teyit edilen commitler:

```txt
2c0cc0e4a27a17f469eb1948983d2cca4842d595
live: add guest auth drawer

c8fffef7cf3f12c79199bf141b2098ebb2bb2c4e
live: wire guest auth drawer chat entry
```

## 76. Final hüküm

Bu drawer’ın final doğru tanımı:

```txt
/live/[username] route-local guest auth bottom drawer.
Native dialog shell kullanır.
Overlay/scrim/karartma kullanmaz.
Görünür motion yalnız panel transform’dur.
Login/register formları drawer içinde çözülür.
Keyboard açıkken CTA görünürlüğü özel hook ile korunur.
Chat guest CTA aynı live scene içinde drawer açar.
```

Bu componentin en önemli dersi:

```txt
Drawer tasarımında native hissin temeli efekt çokluğu değil,
katman azlığı + stabil geometry + gerçek cihaz keyboard davranışıdır.
```

## 77. Patch 4 özeti

Bu bölümde kalıcılaştırılan bilgiler:

```txt
cherry-pick paketleri
rebuild sırası
modal/drawer karar ağacı
validation matrix
real-device smoke matrix
final staging/commit disiplini
future refactor guard
known debt
final hüküm
```

## 78. Patch ilerleme durumu

```txt
Patch 1 tamamlandı:
canonical close-out + scope + file ownership haritası

Patch 2 tamamlandı:
lifecycle + keyboard/focus/CTA kontratı

Patch 3 tamamlandı:
visual polish + motion + do/don’t + modal/drawer karar notu

Patch 4 tamamlandı:
cherry-pick / rebuild guide + validation matrix + final staging notları
```

Bu close-out dokümanı artık A’dan Z’ye guest auth drawer kaynak dokümanı olarak tamamlanmıştır.

