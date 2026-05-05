# Live Viewer Count Visual Slot Only Close-out

## 1. Kısa hüküm

- PASS.
- Live `/live/[username]` top chrome için viewer count visual slot hazırlığı dar scope içinde tamamlandı.
- Runtime gerçek viewer count bu PR kapsamında bağlanmadı.

## 2. Scope: visual slot only

- Bu çalışma yalnız visual slot hazırlığıdır.
- `LiveWatchTopChrome` optional `viewerCountMetric` prop aldı.
- Metric mevcut `trailingCluster` içinde volume’dan önce render edilir.
- `trailingCluster` outer wrapper/class korundu.
- Volume button contract korundu.
- Source, hook, context, route shell handoff ve runtime viewer count wiring bu PR kapsamına alınmadı.

## 3. Changed files

- `src/app/(public)/live/[username]/_components/LiveWatchTopChrome.tsx`
- `src/app/(public)/live/[username]/_components/live-watch-top-chrome.module.css`
- `docs/live-viewer-count-visual-slot-only-closeout.md`

## 4. No-touch doğrulaması

- `live-watch-route-shell.tsx` diff yok.
- `LiveWatchPlaybackController.tsx` diff yok.
- `use-live-watch-playback.ts` diff yok.
- `live-watch-provider-adapter.ts` diff yok.
- Audio unlock ve volume behavior diff yok.
- Studio files diff yok.
- DB, API, auth, chat ve media geometry diff yok.
- Viewer count source/hook/context dosyası yok.
- Final diff’te fake/static fixture yok.

## 5. Temporary fixture smoke değerleri ve owner PASS sonucu

- `104`: PASS
- `1`: PASS
- `3`: PASS
- `12`: PASS

Owner manual smoke kabulü:

- metric volume’dan önce
- metric ve volume aynı yatay hatta
- volume aşağı itilmedi
- top chrome tek satır
- username ellipsis bozulmadı
- metric button/CTA gibi görünmedi

## 6. Hydration sonucu

- Owner smoke sırasında hydration warning görülmedi.
- Wrapper/class refactor yapılmadığı için mevcut `trailingCluster` contract korundu.

## 7. Validation sonuçları

- `git diff --check`: PASS
- `npm run lint`: PASS
- `npm run build`: PASS

## 8. Runtime source’un bağlı olmadığı notu

- Bu PR production runtime’da gerçek viewer count göstermez.
- `viewerCountMetric` render-only slot olarak hazırlandı.
- Route shell üzerinden metric prop geçişi yapılmadı.

## 9. Sonraki PR notu

- Sonraki ayrı PR, live viewer count source/hook/context ve handoff wiring işi olacaktır.
- Bu visual-slot-only PR içinde o alanlara bilinçli olarak girilmedi.
