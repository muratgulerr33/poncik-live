# Live Watch Entry / Refresh / Reconnect State Matrix Audit

## 1. kısa hüküm

`/live/[username]` public watch yüzeyi tek bir state kaynağıyla çalışmıyor. Repo truth üç katman taşıyor:

- server route truth: `live | ended | unavailable`
- playback/media truth: `connecting | playing | playback_blocked | degraded`
- transition owner truth: `message | spinner_only`

Bu yüzden aynı kullanıcı anlamına yakın görünen bazı loading/transition copy'leri farklı katmanlardan geliyor. `ended` redirect strict server branch truth'u; `unavailable` auto redirect almıyor.

## 2. tur adı

Tur 7A — Live Watch Entry / Refresh / Reconnect State Matrix Audit

## 3. exact scope

- Sadece `/live/[username]` public watch route-local state/copy/transition audit'i
- Kod değişikliği yok
- UI/copy fix yok
- State logic değişikliği yok
- `/studio/**`, DB, token/grant, realtime transport, LiveKit packet protocol, media geometry, object-fit, top chrome, shared/global abstraction kapsam dışı

## 4. repo state/copy owner haritası

- Route suspense loading copy owner:
  - `Yayın yükleniyor`
  - `Canlı yayına bağlanıyor.`
  - Kaynak: `page.tsx` fallback + `live-watch-state.tsx`
- Route branch owner:
  - `live / ended / unavailable`
  - Kaynak: `readWatchView(username)` + `live-watch-controller.tsx`
- Playback/media state owner:
  - `connecting / playing / playback_blocked / degraded`
  - `playbackMessage`
  - Kaynak: `use-live-watch-playback.ts`
- Transition overlay owner:
  - `overlayMode = message | spinner_only`
  - one-shot refresh
  - bounded recovery
  - Kaynak: `use-live-watch-playback-transition.ts`
- Playback surface render owner:
  - spinner-only overlay
  - `Canlı yayın / Canlı yayın bağlanıyor.`
  - `Oynatmayı başlat`
  - Kaynak: `LiveWatchPlaybackSurface.tsx`
- Chat visibility owner:
  - history/composer/guest CTA visibility
  - Kaynak: `LiveWatchPlaybackController.tsx` + `LiveWatchChatSurface.tsx`
- Refresh owner:
  - live 5000ms
  - non-live 10000ms
  - 900ms coalesce
  - Kaynak: `live-watch-freshness.tsx`
- Ended redirect owner:
  - strict ended branch mount sonrası 3000ms `router.replace("/")`
  - Kaynak: `LiveWatchEndedRedirectOwner.tsx`

## 5. user-visible state listesi

1. Route loading state
   - Copy: `Yayın yükleniyor / Canlı yayına bağlanıyor.`
2. Playback connecting overlay
   - Copy: `Canlı yayın / Canlı yayın bağlanıyor.`
3. Playback blocked fallback
   - Copy: `Canlı yayın / Yayını açmak için oynatmayı başlatman gerekebilir.`
   - CTA: `Oynatmayı başlat`
4. Generic degraded overlay
   - Copy: `Canlı yayın akışı şu anda bağlanamıyor.`
5. Disconnect-like degraded overlay
   - Copy: `Canlı yayın bağlantısı kesildi. Sayfa yenileniyor.`
6. Spinner-only transition state
   - Visible text: yok
   - Accessible label: `Yayın durumu güncelleniyor`
7. Ended branch
   - Copy: `Yayın sona erdi / Ana sayfaya dönüyorsun…`
8. Unavailable branch
   - Copy: `Yayın şu anda kullanılabilir değil`
9. Guest watch ready CTA
   - Copy: `Yorum yapmak için giriş yap`
10. Viewer watch ready composer
   - Visible only when playback interactive

## 6. entry / refresh / reconnect / ended akış ayrımı

- Discovery entry:
  - önce route loading copy
  - sonra playback connecting overlay
  - sonra video ready + guest CTA
- Direct URL cold entry:
  - önce route loading copy
  - sonra playback connecting overlay
  - bazen playback blocked fallback
  - sonra video ready
- Refresh while stream still live:
  - ended redirect yok
  - spinner-only veya connecting/message overlay gelebilir
  - bazen blocked fallback görülebilir
  - sonra video/chat geri gelir
- Active/current video loss while route still live:
  - route live kalabilir
  - transition owner spinner-only gösterebilir
  - bounded recovery sonrası message mode'a dönebilir
- Confirmed ended:
  - strict `view.kind === "ended"`
  - ended card
  - 3 saniye sonra `/`
- Unavailable:
  - unavailable card
  - auto redirect yok

## 7. state matrix

| Akış | Trigger | Route/server truth | Playback/media truth | Transition owner | UI state adı | Kullanıcıya görünen copy | Chat history görünür mü? | Composer / guest CTA görünür mü? | Spinner görünür mü? | CTA görünür mü? | Redirect var mı? | Doğru owner dosya | Risk / not |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Discovery card click → live initial entry | route first load | `live` resolve edilmeden önce suspense | henüz yok | yok | route loading | `Yayın yükleniyor / Canlı yayına bağlanıyor.` | hayır | hayır | evet | hayır | hayır | `page.tsx` + `live-watch-state.tsx` | doğru ve gerekli |
| Discovery card click → live initial entry | live branch mount, playback bağlanıyor | `live` | `connecting` | `message` | playback connecting overlay | `Canlı yayın / Canlı yayın bağlanıyor.` | hayır | hayır | evet | hayır | hayır | `use-live-watch-playback.ts` + `LiveWatchPlaybackSurface.tsx` | doğru ama fazla tekrar ediyor |
| Direct URL cold entry | browser cold open | `live` resolve edilmeden önce suspense | henüz yok | yok | route loading | `Yayın yükleniyor / Canlı yayına bağlanıyor.` | hayır | hayır | evet | hayır | hayır | `page.tsx` + `live-watch-state.tsx` | doğru ve gerekli |
| Direct URL cold entry | autoplay/manual start gerekebilir | `live` | `playback_blocked` | `message` | blocked fallback | `Canlı yayın / Yayını açmak için oynatmayı başlatman gerekebilir.` | hayır | hayır | hayır | `Oynatmayı başlat` | hayır | `use-live-watch-playback.ts` + `LiveWatchPlaybackSurface.tsx` | doğru ve gerekli |
| `/live/[username]` refresh while stream remains live | route refresh, stream sürüyor | çoğunlukla `live` | `connecting` veya kısa süre eski `playing` | `message` veya `spinner_only` | refresh transition | route loading copy veya playback connecting copy veya spinner-only | kısa süre evet olabilir | kısa süre evet olabilir | evet olabilir | bazen | hayır | `live-watch-freshness.tsx` + playback/transition owner | stale/junk frame riski |
| Active/current video loss while route still live | current video unsubscribe sonrası proof | `live` kalabilir | `degraded` | önce `spinner_only`, sonra bounded `message` | recovery transition | önce visible text yok, sonra gerekirse degraded message | hayır olmalı | hayır olmalı | evet | bounded recovery sonrası olabilir | hayır | `use-live-watch-playback.ts` + `use-live-watch-playback-transition.ts` | ayrı follow-up gerekir |
| Reconnect / degraded | provider/token/connect sorunları | `live` kalabilir | `degraded` | `message` | degraded overlay | `Canlı yayın akışı şu anda bağlanamıyor.` veya `Canlı yayın bağlantısı kesildi. Sayfa yenileniyor.` | hayır | hayır | connecting görünümü yoksa hayır | bazen retry path | hayır | `use-live-watch-playback.ts` + `LiveWatchPlaybackSurface.tsx` | doğru ama fazla tekrar ediyor |
| Playback blocked / manual start | autoplay blocked / playback promise fail | `live` | `playback_blocked` | `message` | blocked fallback | `Canlı yayın / Yayını açmak için oynatmayı başlatman gerekebilir.` | hayır | hayır | hayır | `Oynatmayı başlat` | hayır | `use-live-watch-playback.ts` + `LiveWatchPlaybackSurface.tsx` | doğru ve gerekli |
| Confirmed ended | strict server ended truth | `ended` | playback truth artık owner değil | yok | ended branch | `Yayın sona erdi / Ana sayfaya dönüyorsun…` | hayır | hayır | isteğe bağlı küçük spinner dışında ana truth card | hayır | evet, 3000ms sonra `/` | `public-live-read.ts` + `live-watch-controller.tsx` + `LiveWatchEndedRedirectOwner.tsx` | Tur 6B kapalı truth, dokunulmaz |
| Unavailable | broadcaster/broadcast yok veya read error | `unavailable` | playback branch yok | yok | unavailable branch | `Yayın şu anda kullanılabilir değil` | hayır | hayır | hayır | hayır | hayır | `public-live-read.ts` + `live-watch-controller.tsx` + `live-watch-state.tsx` | Tur 6B kapalı truth, dokunulmaz |
| Guest watch ready | video playing, guest access | `live` | `playing` | yok | guest ready | `Yorum yapmak için giriş yap` | history varsa evet | guest CTA evet, composer hayır | hayır | auth CTA | hayır | `LiveWatchPlaybackController.tsx` + `LiveWatchChatSurface.tsx` | doğru ve gerekli |
| User viewer watch ready | video playing, viewer ready access | `live` | `playing` | yok | viewer ready | explicit fixed copy yok, chat/composer aktif | history varsa evet | composer evet | hayır | composer action | hayır | `LiveWatchPlaybackController.tsx` + `LiveWatchChatSurface.tsx` | doğru ve gerekli |

## 8. duplicate / conflicting visible states

### Aynı kullanıcı anlamına yaklaşan ama farklı owner'lardan gelenler

- `Yayın yükleniyor / Canlı yayına bağlanıyor.`
  - route suspense loading
- `Canlı yayın / Canlı yayın bağlanıyor.`
  - playback overlay loading

Bu iki state aynı teknik owner değil. Kullanıcı anlamı yakın olduğu için tekrar hissi yaratıyor.

### `Oynatmayı başlat`

- Repo truth'a göre gerçek playback-blocked/manual-start fallback
- Ama refresh/cold entry sırasında loading katmanlarıyla arka arkaya görünürse kullanıcı tarafında loading ile karışma riski var

## 9. stale / junk frame riskleri

1. Live refresh sırasında kısa stale chat/composer frame riski var.
   - En muhtemel sebep:
     - chat visibility `playbackState === "playing"` gate'ine bağlı
     - chat message state local client state olarak tutuluyor
     - refresh anında eski client branch çok kısa korunursa stale frame görülebilir
   - Bu repo kanıtına dayalı güçlü çıkarımdır; tek satır kesin root-cause değildir.

2. Refresh/reconnect sırasında kısa black/gap frame riski var.
   - Route loading, playback connecting overlay ve spinner-only transition aynı akışta sıralı görünebilir.

3. Spinner-only ara state bazı akışlarda doğru, bazı akışlarda yalnız geçiş hissi verir.
   - Doğru kullanım:
     - current video loss proof sonrası
     - token `not_live` sonrası status refresh beklenirken

## 10. doğru owner boundary değerlendirmesi

- `page.tsx`
  - route suspense loading owner
- `public-live-read.ts`
  - server branch truth owner
- `live-watch-controller.tsx`
  - live / ended / unavailable branch wiring owner
- `use-live-watch-playback.ts`
  - playback/media truth owner
- `use-live-watch-playback-transition.ts`
  - route-local transition overlay + refresh owner
- `LiveWatchPlaybackSurface.tsx`
  - render-only playback surface owner
- `LiveWatchChatSurface.tsx`
  - chat/composer/guest CTA visibility owner
- `LiveWatchEndedRedirectOwner.tsx`
  - strict ended redirect owner

Repo truth'a göre ended branch davranışı kapalı truth olarak korunmalı. Unavailable branch auto redirect almamalı.

## 11. no-touch alanlar

- `/studio/**`
- DB/schema/migration
- token/grant files
- realtime chat transport
- LiveKit data packet protocol
- media geometry / video ratio / object-fit
- top chrome geometry
- shared/global abstraction
- generic hook/util
- auth route
- moderation/report/admin panel
- persistence/replay/offline queue
- V2/V3 features

## 12. sonraki güvenli tur önerisi

- Tur 7B — Live Watch Refresh Stale Chat Frame Suppression
- Tur 7C — Live Watch Entry Loading / Connecting Copy Consolidation

Bu audit'e göre 7B ve 7C ayrı turlar olarak düşünülmeli. Bu doküman implementation prompt'u üretmez.

## 13. implementation’a geçmek güvenli mi?

Kısmi olarak evet.

- Ended redirect behavior için yeni implementation gerekmiyor; kapalı truth.
- Unavailable auto redirect açmak güvenli değil; mevcut truth korunmalı.
- En güvenli takip alanları:
  - refresh sırasında stale chat/composer frame
  - loading/connecting copy tekrarının ayrıştırılması

Bu değerlendirme fix planı değildir; yalnız audit sonucu risk ayrımıdır.

## 14. validation

- Safety check:
  - `git branch --show-current` => `main`
  - `git status -sb` => temiz
- Read-only audit commands:
  - copy map grep çalıştırıldı
  - state map grep çalıştırıldı
  - navigation/refresh map grep çalıştırıldı
- Doc-only validation:
  - `git diff --check` PASS
  - `npm run lint` PASS
  - `npm run build` PASS

## 15. commit / push sonucu

- Stage scope: yalnız bu doküman
- Commit message: `docs: audit live watch state matrix`
- Push target: `origin main`
- Bu tur doc-only audit turu olarak kapanır
