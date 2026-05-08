# Studio Mobile Portrait 720 Runtime Validation Close-out

## Kısa Hüküm

PASS WITH FPS NOTE.

`studio: add mobile portrait 720 capture contract` commit'i sonrası açık kalan runtime validation residual'ları kapatıldı.

Bu close-out implementation close-out değildir. Bu turda production kod yazılmadı, route açılmadı, CSS değiştirilmedi, viewer API değişikliği yapılmadı, publisher simulcast ayarı değiştirilmedi.

Bu doküman yalnız runtime evidence close-out'tur.

## Kapsam

Bu close-out şunu tamamlar:

- `docs/studio-mobile-portrait-720-capture-contract-closeout.md`

Önceki close-out r:

- Vercel smoke pending
- `/live/[username]` viewer measurement pending
- Ayrı cihaz publisher/viewer topolojisinde runtime media quality doğrulaması pending

Bu tur bu residual'ları ölçümle kapatır.

## Canonical Code State

Kod değişikliği yoktur.

Main üzerinde mevcut implementation commit:

- `64c9b4d` — `studio: add mobile portrait 720 capture contract`

Bu runtime validation sırasında viewer-side `setVideoQuality`, `setVideoDimensions`, `medium -> high` denemeleri canonical değildir. Bu denemeler main'e alınmadı ve worktree temizlendi.

## Publisher Runtime Evidence

Ölçüm topolojisi:

- Publisher device: RedMi Note 11 Pro
- Browser: Chrome
- Surface: `/studio`
- Env: local
- Camera: front camera

Publisher source evidence:

- Video element: `720x1280`
- Source track: `720x1280 @ 30fps`
- Facing mode: `user`
- Aspect ratio: `0.5625`
- Geometry: portrait source PASS

Publisher outbound WebRTC evidence:

- Low layer: `180x320 @ 20fp0.1 kbps`
- Mid layer: `360x640 @ 20fps`, bitrate approx `447.4 kbps`
- High layer: `720x1280 @ 20fps`, bitrate approx `1700.6 kbps`
- `qualityLimitationReason`: `none`
- `availableOutgoingBitrate`: approx `5.1 Mbps`
- Encoder: `SimulcastEncoderAdapter`

Publisher verdict:

- `source720x1280`: PASS
- `sourcePortrait`: PASS
- `anyOutbound720x1280`: PASS
- `highLayerPass`: PASS

## Viewer Runtime Evidence — iPhone Safari

Ölçüm topolojisi:

- Publisher source: RedMi Chrome Studio
- Viewer device: iPhone 16 Pro Simulator
- Browser: Safari
- Surface: `/live/sementatest`
- Env: local

Viewer inbound evidence:

- Inbound video: `720x1280`
- Bitrate approx: `1684.9 kbps`
- `framesPerSecond`: `18`
- `decodedFpsEstimate`: `19.5`
- `packetsLost`: `34`
- `jitter`: `0.016`
- `availableIncomingBitrate`: approx `2.9 Mbps`

Viewer geometry evidence:

- Final video: `720x1280`
- `objectFit`: `cover`
- `dataLiveMediaFit`: `cover`
- `geometryPass`: PASS

Viewer vt:

- `anyInbound720x1280`: PASS
- `anyInboundLow`: false
- `highLayerPass`: PASS
- `geometryPass`: PASS

## Viewer Runtime Evidence — RedMi Solo Viewer / Vercel

Ölçüm topolojisi:

- Publisher device: Samsung Galaxy Note 10 Lite
- Publisher surface: Vercel `/studio`
- Viewer device: RedMi Note 11 Pro
- Viewer surface: Vercel `/live/sementatest`
- Viewer role: solo viewer only
- Env: Vercel

Viewer inbound evidence:

- Inbound video: `720x1280`
- Bitrate approx: `1718.7 kbps`
- `framesPerSecond`: `16`
- `decodedFpsEstimate`: `16.58`
- `packetsLost`: `4`
- `jitter`: `0.018`
- `availableIncomingBitrate`: approx `2.7 Mbps`

Viewer geometry evidence:

- Final video: `720x1280`
- `objectFit`: `cover`
- `dataLiveMediaFit`: `cover`
- `geometryPass`: PASS

Viewer verdict:

- `anyInbound720x1280`: PASS
- `anyInbound480x640`: false
- `anyInboundLow`: false
- `highLayerPass`: PASS
- `geometryPass`: PASS

## Invalid / Misleading Test Topology

Önceki RedMi measus içinde aynı fiziksel cihaz hem publisher hem viewer olarak kullanıldı.

Bu topoloji canonical runtime truth değildir.

Sebep:

- Aynı cihazda camera capture + encode + LiveKit publish + viewer decode + render + debug yükü oluştu.
- Bu koşulda viewer `360x480` veya `480x640` alması normal test topolojisi olarak kabul edilmez.
- Ayrı publisher + ayrı viewer topolojisinde RedMi solo viewer `720x1280` PASS verdi.

Bu yüzden önceki low-layer sonuçlar product/media pipeline fail olarak kapatılmadı; test-topology artifact olarak işaretlendi.

## Sonuç

Runtime validation sonucu:

- Studio mobile portrait capture contract: PASS
- Publisher source `720x1280 @ 30fps`: PASS
- Publisher outbound high layer `720x1280`: PASS
- iPhone Safari viewer inbound `720x1280`: PASS
- RedMi solo viewer inbound `720x1280`: PASS
- Viewer geometry / cover policy: PASS
- Publisher simulcast/SFU high-layer forwarding: PASS
- Viewer-side quality API fix ihtiyacı: NO
- Publisher simulcast change ihtiyacı: NO
- CSS/htiyacı: NO

## FPS Note

Resolution/media quality hedefi PASS olsa da FPS ideal native hedefte değildir.

Observed chain:

- Camera source: `30fps`
- Publisher outbound high layer: approx `20fps`
- Viewer inbound:
  - iPhone Safari: approx `19.5fps`
  - RedMi solo viewer: approx `16.58fps`

Bu close-out FPS hardening işi değildir.

FPS ayrı audit konusu olarak bırakıldı:

- `Poncik Live — Mobile Live FPS Hardening Audit`

Bu audit başlamadan önce CSS, capture contract, viewer API veya publisher simulcast ayarlarına kör müdahale yapılmamalıdır.

## No-touch Confirmation

Bu validation sonrası aşağıdakilere dokunulmadı:

- `/live/[username]` viewer controller
- `/live/[username]` CSS
- `useLiveWatchMediaPolish`
- Studio capture contract
- Publisher LiveKit publish options
- Viewer `setVideoQuality`
- Viewer `setVideoDimensions`
- `adaptiveStream`
- DB/auth/token/V2/paFinal Hüküm

Studio mobile portrait 720 capture contract runtime validation PASS WITH FPS NOTE.

Ana eski problem olan düşük çözünürlüklü `/live/[username]` görüntüsü ayrı publisher + ayrı viewer cihaz topolojisinde tekrar üretilmedi. 720 portrait media quality zinciri çalışıyor.

FPS ayrı hardening audit olarak ele alınmalıdır.
