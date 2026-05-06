# Live Watch Full-Surface Transition Tur 1 Close-Out

## Kisa hukum

- PASS.
- Tur 1 core full-surface transition uygulandi.
- Tur 1B opacity/layering fix ile cover native Poncik dark surface haline getirildi.
- Route loading + playback spinner ikili hissi tek transition diline cekildi.

## Scope

- Sadece `/live/[username]`.
- Full-cover transition.
- Route/Suspense fallback alignment.
- Playback `spinner_only` visual owner'in shell cover'a tasinmasi.
- Cover opacity/layering/native dark surface fix.
- Tur 2 fallback yok.

## Changed files

- `src/app/(public)/live/[username]/_components/live-watch-transition-cover-context.tsx`
- `src/app/(public)/live/[username]/_components/LiveWatchTransitionCover.tsx`
- `src/app/(public)/live/[username]/_components/live-watch-route-shell.tsx`
- `src/app/(public)/live/[username]/_components/live-watch-shell.tsx`
- `src/app/(public)/live/[username]/_components/live-watch-state.tsx`
- `src/app/(public)/live/[username]/_components/LiveWatchPlaybackSurface.tsx`
- `src/app/(public)/live/[username]/_components/live-watch.module.css`
- `src/app/(public)/live/[username]/_controllers/LiveWatchPlaybackController.tsx`
- `src/app/(public)/live/[username]/_controllers/use-live-watch-playback-transition.ts`
- `src/app/(public)/live/[username]/_controllers/live-watch-controller.tsx`
- `src/app/(public)/live/[username]/page.tsx`
- `docs/live-watch-full-surface-transition-tur-1-closeout.md`

## Implementation summary

- Route-local cover context eklendi.
- Shell-level transition cover eklendi.
- `spinner_only` visual spinner playback surface'ten kaldirildi.
- Shell cover tek gorsel spinner owner oldu.
- `message` / retry branch cover altinda kalmiyor.
- `ended` / unavailable branch cover altinda kalmiyor.
- `LiveWatchLoadingState` ayri kart hissinden cikarildi.
- Tur 1B ile cover background native dark surface / near-solid hale getirildi.
- Blur / backdrop-filter kullanilmadi.
- Animasyon opacity temelli kaldi.

## Owner smoke evidence

- Owner kronolojik ekran goruntusuyle dogruladi.
- Cover acikken yalniz spinner + `Canlı yayına bağlanıyor` algisi var.
- Arkadaki live UI okunur degil.
- Native dark transition surface kabul edildi.
- Soft reveal frame kabul edildi.

## No-touch confirmation

- `use-live-watch-playback.ts`
- viewer count source/handoff
- audio unlock / volume behavior
- media geometry / safe-contain
- chat/CTA business logic
- Studio
- DB/auth/API/token
- LiveKit token/source logic
- V2/V3
- shared/global abstraction

## Validation results

- `git diff --check`: PASS
- `npm run lint`: PASS
- `npm run build`: PASS
- targeted no-touch diff checks: PASS

## Future caution

- Tur 2 ayri is: 6-8 saniye uzun baglanti fallback'i.
- Tur 2'de auto redirect yok.
- `Kesfe don` fallback'i ayni cover icinde planlanacak.
- Viewer count source tekrar `mediaReady` / `playbackState` gate'ine baglanmayacak.
- Blur/backdrop-filter performans riski nedeniyle bu transition'da kullanilmayacak.
- Full-cover transition sadece `/live/[username]` route-local kalmali.
