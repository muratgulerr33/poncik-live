# PR-7A Studio Approval Gate + Minimal Prep Shell — Close-out

## 1) amaç

PR-7A, `/studio` placeholder yerine route-local approval gate ve minimal prep shell kurar.

Bu close-out yalnız PR-7A içindir.
PR-7 canonical başlığı daha geniştir; `PR-7B` bu repo history'sinde yapılmamıştır.

Bu PR:
- anonymous `/studio` isteğini `/auth?next=/studio` yönüne taşır
- publisher approval truth'una göre studio gate yüzeylerini çözer
- yalnız `approved` publisher için minimal prep shell açar

Bu PR:
- gerçek media permission request açmaz
- gerçek publish lifecycle açmaz
- schema breadth açmaz

## 2) scope denetimi

Yapılan dar iş:
- `/studio` içinde anonymous redirect
- `user` ve `admin` için wrong-role gate
- `publisher + pending_review` gate
- `publisher + rejected` gate
- `publisher + missing/degraded` fallback gate
- `publisher + approved` minimal prep shell
- session `degraded` için ayrı fallback gate

Açıkça dışarıda bırakılanlar:
- `PR-7B` alanı
- PR-8 publish lifecycle
- gerçek `getUserMedia`
- gerçek broadcast start/stop
- `broadcasts` write behavior
- cover image selection UI
- publisher settings edit surface
- auth subroute
- shared abstraction

## 3) uygulanan teknik çıktı

- `/studio` route-local shell/controller/adapter/component sınırlarıyla kuruldu
- studio gate kararı `role_type` ve `publisher_applications.status` truth'undan okunuyor
- `account_status` approval truth yerine kullanılmadı
- `Current session degraded` durumu redirect veya wrong-role yerine dar fallback surface olarak ayrıldı
- approved publisher için yalnız bilgi seviyesi prep shell eklendi:
  - heading/body
  - placeholder preview
  - capability/readiness notice
- capability adapter yalnız non-invasive browser checks yapıyor; gerçek permission request çağrısı yok
- schema değişikliği yapılmadı
- auth dosyaları büyütülmedi

## 4) command-verified sanity

- `npm run lint`: PASS
- `npm run build`: PASS
- route health:
  - `/` `200`
  - `/auth` `200`
  - `/live/test-user` `200`
  - anonymous `/studio` `307` -> `/auth?next=/studio`
- scope guard:
  - `rg 'getUserMedia\\(' src/app/(studio)/studio` boş
  - `rg 'broadcast' src/app/(studio)/studio` boş
- role/status route checks:
  - authenticated `user` -> wrong-role gate
  - authenticated `admin` -> wrong-role gate
  - authenticated `publisher + pending_review` -> gate
  - authenticated `publisher + rejected` -> gate
  - authenticated `publisher + missing` -> fallback gate
  - authenticated `publisher + approved` -> minimal prep shell

## 5) operator-verified manual smoke

- anonymous `/studio` -> auth continuation
- authenticated `user` `/studio` -> wrong-role gate
- authenticated `admin` `/studio` -> wrong-role gate
- authenticated `publisher + pending_review` `/studio` -> gate
- authenticated `publisher + approved` `/studio` -> minimal prep shell
- authenticated `publisher + rejected` `/studio` -> gate

## 6) diff özeti

- changed files count: `12`
- shortstat: `12 files changed, 620 insertions(+), 2 deletions(-)`
- en çok büyüyen dosyalar:
  - `src/app/(studio)/studio/_components/studio.module.css` `+117`
  - `docs/pr-7a-studio-approval-gate-minimal-prep-shell-closeout.md` `+110`
  - `src/app/(studio)/studio/_adapters/studio-gate-adapter.ts` `+87`
  - `src/app/(studio)/studio/_components/StudioGateSurface.tsx` `+64`
- studio-local split korundu
- god file riski görünmüyor

## 7) bilerek yapılmayanlar

- gerçek permission akışı
- gerçek publish CTA behavior
- gerçek broadcast write
- cover image seçimi
- publisher settings edit yüzeyi
- admin veya auth breadth
- route çoğaltma

## 8) risk / unknown

- browser capability notice, güvenli bağlam yoksa `not_ready` çizgisinde kalır; gerçek permission akışı sonraki iştedir
- local smoke için kullanılan runtime fixture ve session kayıtları repo dışıdır

## 9) son karar

- PASS
- bu close-out full PR-7 kapanışı değildir; yalnız PR-7A truth'unu taşır
