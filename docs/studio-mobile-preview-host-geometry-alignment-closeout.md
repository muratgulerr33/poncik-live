# Studio Mobile Preview Host Geometry Alignment Close-out

## Kısa hüküm

`/studio` healthy initial requesting scene host geometry alignment bug'i bu final turla kapandı. Bu kapanış yalnız mobile preview host geometry alignment bug'ı içindir.

## Kapanan exact bug tanımı

Gerçek mobil cihazda approved publisher ile `/studio` refresh sonrası healthy requesting host ile final ready host farklı outer host geometry okuduğu için sahne kutu swap hissi veriyordu. Bu final turda requesting scene path, final ready scene host continuity'sine hizalandı.

## Checkpoint commit referansı

- Ara checkpoint commit:
  - `bde3624` - `studio: checkpoint preview bootstrap flash suppression attempt`
- Bu commit final close-out commit'inin parçası değildir.
- Checkpoint turu initial flash suppression attempt idi.
- Final tur mobile preview host geometry alignment işini kapatır.

## Bu final turda ne değişti

- `StudioPreviewPanel.tsx` içinde healthy initial requesting suppression path için dar `data-host-contract="initial-scene"` targeting eklendi.
- `studio-preview-panel.module.css` içinde yalnız bu requesting scene path için ready-host continuity kuralları eklendi.
- Hizalanan katmanlar:
  - root preview scene host
  - stage host
  - scene media root
  - preview frame
- Hizalanan outer geometry alanları:
  - gap
  - height / min-height
  - overflow / clipping
  - stretch behavior
  - frame border / radius / shadow / background
- Final `preview_ready` host kuralları yeniden tasarlanmadı.

## Exact changed files

- `src/app/(studio)/studio/_components/StudioPreviewPanel.tsx`
- `src/app/(studio)/studio/_components/studio-preview-panel.module.css`

## Lint sonucu

- `npm run lint`: PASS

## Build sonucu

- `npm run build`: PASS

## Owner-reported manual smoke özeti

- Owner-reported / manual smoke
- Gerçek mobil cihazda doğrulandı.
- Refresh sonrası host swap hissinin kalktığı bildirildi.
- Sahnenin artık native / stabil okunduğu bildirildi.
- Requesting host ile ready host aynı sahnenin parçası gibi çalışıyor bildirimi alındı.
- Blocked / timeout / degraded / retry / `Başlat` tarafında obvious regression görülmediği owner tarafından bildirildi.

## Scope dışı açıkça dokunulmayan alanlar

- adapters
- lifecycle semantics
- browser-close cleanup
- refresh continuity
- video-fit policy

## Final acceptance

- Yalnız bu bug için: PASS
