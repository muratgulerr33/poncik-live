# Poncik Live — V1 Smart Menu + Tawk Support Close-out

## 1) kısa hüküm

`PASS / KABUL`

V1 Smart Menu + Live Support hattı bu turda close-out ile kapandı. `/` ve `/auth` drawer içinde role-aware menu çalışır durumda; Tawk support hattı sade boundary reset ile stabil hale getirildi; son mikro follow-up ile görünür `Canlı Destek bağlanıyor…` feedback kaldırıldı.

---

## 2) scope denetimi

Scope korundu.

Bu close-out ailesinde kapananlar:

- `/` ve `/auth` drawer içinde role-aware smart menu
- guest/user/publisher için `Canlı Destek` action
- admin için support gizleme
- approved publisher için `Canlı Yayın` approved-only görünürlüğü
- Tawk support hattının route-local boundary ile kurulması
- first-click open davranışının `/` ve `/auth` üstünde çalışır hale gelmesi
- minimize/kapat sonrası bubble suppression
- görünür `Canlı Destek bağlanıyor…` loading feedback’inin kaldırılması

Bilerek açılmayanlar:

- `/live/[username]` chrome davranışı
- `/studio` chrome davranışı
- support slot ailesi redesign
- yeni route/query/modal/page/form/ticket
- global/shared nav framework
- admin breadth / dashboard / history

---

## 3) kapanan işler

- discovery ve auth drawer’larında precomputed role-aware menu item setleri açıldı
- guest fallback linkleri repo truth’a uygun biçimde `/auth` çizgisinde kaldı
- admin drawer `Operasyon / Ödemeler(disabled) / Raporlar(disabled)` olarak kuruldu
- publisher için `Canlı Yayın` itemi yalnız approved truth’te görünür kaldı
- Tawk support hattı tek boundary dosyasında sade reset ile yeniden kuruldu
- Tawk script `next/script` ile sabit `id` üstünden yüklendi
- widget ready truth’u `Tawk_API.onLoad` + durable marker çizgisinde kuruldu
- `/` ve `/auth` üstünde first-click open manuel smoke ile PASS kabul edildi
- minimize/kapat sonrası bubble geri görünmeme davranışı PASS kabul edildi
- son follow-up ile görünür loading text ve loading feedback yüzeyi kaldırıldı

---

## 4) changed files listesi

- `src/app/(public)/page.tsx`
- `src/app/(public)/_controllers/discovery-controller.tsx`
- `src/app/(public)/_components/discovery-route-shell.tsx`
- `src/app/(public)/_components/discovery.module.css`
- `src/app/(public)/_components/tawk-support-boundary.tsx`
- `src/app/(public)/auth/_components/AuthShell.tsx`
- `src/app/(public)/auth/_components/auth-route-shell.tsx`
- `src/app/(public)/auth/_components/auth.module.css`
- `docs/v1-smart-menu-tawk-support-closeout.md`

---

## 5) command-verified sanity özeti

- `npm run lint` → PASS
- `npm run build` → PASS

Bu close-out turunda yeni lint/build zinciri tekrar açılmadı; mevcut kabul edilmiş PASS sonucu close-out truth’u olarak taşındı.

---

## 6) manual smoke özeti

Kullanıcı manuel smoke sonucu PASS doğruladı.

Kabul edilen davranışlar:

- `/` üstünde first-click ile support açılıyor
- `/auth` üstünde first-click ile support açılıyor
- route değişmeden widget uygulama içinde açılıyor
- bubble minimize/kapat sonrası geri görünmüyor
- `/live/[username]` ve `/studio` untouched kalıyor
- son follow-up sonrası görünür `Canlı Destek bağlanıyor…` feedback görünmüyor

Bu close-out turunda yeni smoke veya Playwright zinciri yeniden koşulmadı; kullanıcı doğrulaması esas alındı.

---

## 7) neden scope içinde kaldığı

Çalışma yalnız smart menu ve Tawk support hattında kaldı.

- route-local shell/menu wiring
- auth/discovery tarafındaki ilgili drawer yüzeyleri
- tek Tawk support boundary
- bu hattın gerekli CSS dokunuşları

`/live/[username]` ve `/studio` dosyalarına taşılmadı, yeni feature açılmadı, yeni refactor başlatılmadı.

---

## 8) remaining unknown

- Tawk embed davranışı üçüncü taraf runtime’a bağlı olduğu için tam cihaz matrisi close-out dokümanında tekrar ispatlanmadı; kabul, command-verified sanity + kullanıcı manuel smoke PASS üstünden verildi.
- Loading feedback kaldırılırken çalışan open davranışı korunmuş kabul edildi; bu close-out turunda yeni smoke zinciri açılmadı.

---

## 9) commit mesajı

`support: close out smart menu and tawk support flow`

---

## 10) push durumu

Bu close-out ile birlikte `origin/main` üstüne push hedeflenir.

---

## 11) final worktree durumu

Hedef durum:

- ilgili dosyalar stage edilir
- tek commit atılır
- `git push origin main` tamamlanır
- `git status -sb` temiz worktree gösterir
