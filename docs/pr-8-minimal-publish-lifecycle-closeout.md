# PR-8 Minimal Publish Lifecycle — Close-out

## 1) Kisa hukum

- PASS / KABUL
- PR-8, approved publisher icin `/studio` uzerinde local preview, `Baslat / Bitir` minimal lifecycle ve public watch freshness davranisini dar scope ile tamamlar.

## 2) Scope denetimi

Yapilan is:
- approved publisher `/studio` prep icinde local camera/microphone preview bootstrap
- `Baslat` ile idempotent `live` broadcast lifecycle write
- `Bitir` ile idempotent `ended` lifecycle stop
- `/live/[username]` public watch tarafinda live/non-live route-local freshness
- approved prep permission/bootstrap reliability hardening

Bilerek disarida kalanlar:
- provider / LiveKit transport
- remote playback
- chat
- viewer count persistence
- payment / minute / 1v1
- cover image management UI
- publisher settings edit surface
- admin breadth
- auth route breadth

## 3) Dogrulanan teknik cikti

- `/studio` anonymous akisi `/auth?next=/studio` continuation olarak kalir.
- Approved publisher preview state DB truth degildir; preview local browser state olarak kalir.
- `Baslat` server action tarafinda authenticated approved publisher guard uygular.
- `start` mevcut active `live` row varsa ikinci row yaratmaz.
- `stop` active row varsa `ended` yapar; active row yoksa no-op donebilir.
- `broadcasts` yalniz lifecycle truth tasir.
- Public watch live/ended/unavailable state'i `broadcasts.status` okumasi uzerinden cozulur.

## 4) Sanity kaniti

Command-verified:
- `npm run lint`: PASS
- `npm run build`: PASS
- `/`: `200`
- `/auth`: `200`
- `/live/test-user`: `200`
- anonymous `/studio`: `307` -> `/auth?next=/studio`

Operator-verified / PR cycle smoke:
- approved publisher `/studio` preview yuzeyi acildi
- permission grant sonrasi local preview gorundu
- preview ready iken `Baslat` aktif oldu
- `Baslat` sonrasi active `live` broadcast truth'u olustu veya mevcut active row dondu
- public watch `live` state'i gordu
- `Bitir` sonrasi active row `ended` oldu
- `Bitir` sonrasi preview acik kaldi
- public watch live/ended freshness takipleri PR-8 FU-2 icinde toparlandi

## 5) Changed files / diff ozeti

- PR-8 route-local studio ve public watch dosyalarinda tamamlandi.
- Studio tarafinda lifecycle action, broadcast adapter, preview adapter/hook/panel ve ilgili copy/stil parcalari eklendi.
- Public watch tarafinda route-local freshness component eklendi.
- Close-out dokumani bu dosyadir.

## 6) Schema etkisi

- `broadcasts.started_at`
- `broadcasts.ended_at`

Eklenmeyenler:
- `ended_reason`
- `media_session_ref`
- preview state alanlari
- viewer count persistence

## 7) Bilerek acilmayan alanlar

- Realtime transport iddiasi yoktur.
- Provider/LiveKit entegrasyonu yoktur.
- Public watch playback breadth acilmadi.
- Auth, discovery, card, cover ve admin davranislari genisletilmedi.
- Preview publish truth'u olarak kullanilmadi.

## 8) Risk / follow-up

- Browser permission prompt davranisi garanti edilemez; preview bootstrap sadece guvenli recovery ve retry fallback saglar.
- Approved publisher manual smoke operator/runtime kanitina dayanir; close-out turunda full browser permission smoke yeniden command-verified kosulmadi.

## 9) Son karar

- PR-8 final close-out: PASS / KABUL
- Siradaki canonical adim: `PR-9 — Final hardening`
