# Studio Top Corner Radius Polish Scope Freeze Close-out

## 1. Kisa hukum

`PASS`

PR-B2 Studio top corner radius polish scope freeze tamamlandi.

Owner smoke: `PASS`.

Ust sag / ust sol corner radius polish kaldirildi.

Alt corner polish korunuyor.

Ust edge flush bilincli kabul edildi.

## 2. Problem gecmisi

- PR-B Studio native corner visual polish denendi.
- Shadow/rim denemeleri ust edge native breathing saglamadi.
- Top-only mask/breathing denemesi jank uretti.
- Refresh sonrasi once video, sonra ust radius jank'i goruldu.
- Owner karariyla ust top-corner radius polish iptal edildi.

## 3. Final karar

- Ust sol / ust sag radius: square.
- Alt sol / alt sag radius: `--preview-media-polish-radius` ile korunur.
- Top breathing cozulmedi; bilerek scope disina alindi.
- Oncelik jank olmamasi + alt/sag/sol PASS korunumu.

## 4. Korunan contract

- Live dosyalari untouched.
- Studio hook untouched.
- Studio TSX untouched.
- frame/panel CSS untouched.
- Start CTA untouched.
- top chrome untouched.
- `object-fit: cover` untouched.
- `transform: none` untouched.
- `sideInset=0px` korunur.
- frame/video geometry degismedi.
- crop behavior degismedi.
- gercek layout gap yok.
- `.window::before` yok.
- `overflow: hidden` yok.
- failed shadow line geri gelmedi:
  `inset 0 7px 14px -16px color-mix(in oklch, white 14%, transparent),`

## 5. Validation

- `git diff --check`: PASS
- `npm run lint`: PASS
- `npm run build`: PASS

## 6. Owner smoke

- `PASS`
- Ust sag/sol koselerde radius polish artik yok.
- Refresh sonrasi ust corner radius jank'i kaldirildi.
- Alt kose polish korunuyor.
- Sag/sol edge PASS.
- Video kuculmedi.
- Start CTA/top chrome etkilenmedi.

## 7. Future note

- Studio top edge native breathing daha sonra ayri owner karariyla acilabilir.
- Bu gelecekte acilirsa once Chrome Remote Debug denemesi yapilacak.
- Kor shadow/mask denemesi yapilmayacak.
- Top breathing icin gercek gap / surface-layer kararlari ayri PR gerektirir.
