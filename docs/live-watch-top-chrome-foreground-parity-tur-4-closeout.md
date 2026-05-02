# Live Watch Top Chrome Foreground Parity Tur 4 Close-out

## Kısa hüküm

`PASS WITH NOTES`

## Scope

Bu close-out yalnız Live `/live/[username]` top chrome foreground parity işidir.

Kapsar:

- close / X foreground
- username foreground
- volume açık icon foreground
- volume kapalı icon foreground
- header rhythm / no-overlap
- carrier/background ikinci planda
- Studio PR-2 foreground standardına hizalama

Kapsamaz:

- Studio değişiklikleri
- Live media frame
- Tur 3 safe-contain policy
- video geometry
- chat/comment logic
- auth / LiveKit / DB
- V2/V3
- shared/global abstraction
- landscape/orientation

## Changed file

- `src/app/(public)/live/[username]/_components/live-watch-top-chrome.module.css`

## Foreground standard

- touch target: `44px`
- SVG glyph: `27px`
- SVG stroke-width: `2.42`
- glyph / touch ratio: `~0.614`
- username font-size: `16.9px`
- username font-weight: `650`
- username line-height: `1.04 / 17.576px`
- username letter-spacing: `-0.01em / -0.169px`
- close → username gap: `~6.398px`
- username → audio gap: `~6.397px`
- content lane: `44px`
- header height: `~48.477px`

## Paint standard

- foreground-first icon/text
- carrier/background ikinci planda
- root box-shadow yok
- root backdrop-filter yok
- carrier border yok
- carrier box-shadow yok
- carrier çok düşük alpha
- SVG minimal drop-shadow edge support
- username minimal text-shadow + minimal text-stroke
- ağır glow yok
- kirli halo yok
- outline/sticker hissi yok
- header bar/blur hissi yok

## Volume state

- `volume açık` ve `volume kapalı` state'leri aynı top chrome foreground sistemini kullanır.
- State farkının ana sinyali icon shape'tir.
- Muted state disabled/silik görünmemelidir.
- Carrier state foreground'dan önce okunmamalıdır.
- Owner manual smoke'a göre volume açık ve volume kapalı hizası görsel olarak uyumludur.

## Measurement evidence

- route: `/live/sementatest`
- verdict: `PASS`
- passCount: `35`
- failCount: `0`
- audio measured state: `active / Sesi kapat / aria-pressed=false`
- close touch: `44x44`
- audio touch: `44x44`
- close svg: `27x27`
- audio svg: `27x27`
- stroke-width: `2.42`
- username: `16.9px / 650 / 17.576px / -0.169px`
- content lane: `44px`
- header height: `48.477px`
- closeUsernameGap: `6.398px`
- usernameAudioGap: `6.397px`
- media regression snapshot: `cover / ready / transform none`

Not:

- Active state matematiksel ölçüm PASS.
- Muted state owner visual/manual smoke PASS.
- Bu yüzden close-out dili `PASS WITH NOTES` kalır.

## Visual smoke evidence

- iPhone 16 Pro simulator / iOS 18.6: Live top chrome native görünüyor, X / username / volume açık okunuyor.
- Redmi Note 11 Pro: açık sahnede username ve volume açık okunuyor.
- Carrier foreground'un önüne geçmiyor.
- Header bar/blur hissi oluşmuyor.
- Iconlar header yüksekliğini taşırmıyor.
- Username iconlarla çakışmıyor.
- Tur 3 media behavior değişmedi.

## Validation

- `git diff --check`: PASS
- `npm run lint`: PASS
- `npm run build`: PASS

## Commit message

- `live: close out top chrome foreground parity`
