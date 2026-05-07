# Live Watch Full-Surface Transition Tur 2 Close-out

## Kisa hukum

- PASS.
- Tur 2 uzun baglanti fallback'i tamamlandi.
- 12000ms sonrasi fallback ayni full-cover icinde gosteriliyor.
- Dev-only test flag owner smoke icin kullanildi, ardindan product code'dan temizlendi.

## Scope

- Sadece `/live/[username]`.
- Full-cover transition long-wait fallback.
- `Anasayfaya don` CTA.
- Cover exit/reveal suresi yumusatmasi.
- Test flag cleanup.

## Product behavior

- Ilk asama:
  - `Canlı yayına bağlanıyor`
  - spinner
- 12000ms sonrasi:
  - spinner devam eder
  - `Biraz uzun sürdü`
  - `Anasayfaya dön`
- Baglanti arkada devam eder.
- Ready olursa fallback temizlenir ve live UI acilir.
- CTA `/` route'una gider.
- Auto redirect yok.

## Owner smoke evidence

- Mobil gercek cihazda fallback cikti.
- CTA `/` route'una yonlendirdi.
- Baglanti arkada devam etti.
- Hazir olunca live UI acildi.
- Mobilde spinner dondu.
- Desktop reduced motion kaynakli sabit spinner algisi blocker kabul edilmedi.

## Cleanup note

- `liveWatchDevCoverDelayMs` dev-only test flag product code'dan kaldirildi.
- Final product davranisi test flag'e bagli degil.

## No-touch confirmation

- `use-live-watch-playback.ts`
- viewer count source/handoff
- audio unlock / volume behavior
- chat/CTA business logic
- media geometry / safe-contain
- Studio
- DB/API/auth/token
- V2/V3
- shared/global abstraction

## Validation

- `git diff --check`: PASS
- `npm run lint`: PASS
- `npm run build`: PASS
- targeted no-touch diff checks: PASS
- final grep: test flag source code'da yok

## Future caution

- Tur 1/Tur 2 cover transition route-local kalmali.
- Viewer count tekrar mediaReady/playbackState gate'ine baglanmamali.
- Blur/backdrop-filter kullanilmamali.
- Daha ileri loading copy/polish ayri is olmali.
