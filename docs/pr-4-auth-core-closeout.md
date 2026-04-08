# PR-4 Auth Core Close-out

## Amaç

PR-4, `/auth` altında tek route auth core kurar:
- shared login
- minimal user register
- current session read
- sign in / sign out
- session continuation boundary

V1 public watch davranışı korunur. `/live/[username]` auth gate yemez.

## Scope denetimi

Bu PR yalnız auth core ve local runtime hizasını kapsar.

Bilerek dışarıda bırakılanlar:
- publisher register ve status yüzeyleri
- support/Tawk
- admin approval UI
- password reset
- yeni auth subroute
- watch gating
- PR-5 / PR-6 alanları

## Teknik çıktı

- `/auth` route-local auth shell, controller, action, adapter ve küçük component sınırlarıyla kuruldu.
- Adapter boundary tek büyük dosyadan route-local küçük sorumluluklara ayrıldı.
- `use server` export blocker kapatıldı; action state route-local ayrı dosyaya taşındı.
- `DATABASE_URL` yokken hard-crash azaltıldı; local runtime ile gerçek auth smoke doğrulandı.
- Local runtime için `.env.example` ve `drizzle.config.ts` 5437 portuna hizalandı.
- `accounts.password_hash` ve `auth_sessions` runtime beklentileri local PostgreSQL üzerinde doğrulandı.

## Sanity sonuçları

### command-verified now

- `npm run lint`: PASS
- `npm run build`: PASS
- HTTP 200:
  - `/`
  - `/auth`
  - `/live/test-user`
  - `/studio`

### previously validated smoke evidence in this PR cycle

- gerçek browser smoke ile `register` PASS
- `login` PASS
- `current session read` PASS
- `logout` PASS
- refresh sonrası session persistence PASS
- `/live/test-user` auth redirect almadan açıldı

## Diff özeti

- changed files total count: `21`
- shortstat: `21 files changed, 1275 insertions(+), 4 deletions(-)`
- toplam eklenen/silinen satırlar: `+1275 / -4`
- en çok büyüyen dosyalar:
  - `src/app/(public)/auth/_components/auth.module.css` `+176`
  - `src/app/(public)/auth/_adapters/auth-session-adapter.ts` `+171`
  - `src/app/(public)/auth/_adapters/auth-session-boundary.ts` `+125`
  - `src/app/(public)/auth/_adapters/auth-account-boundary.ts` `+116`
  - `src/app/(public)/auth/_components/AuthShell.tsx` `+111`

Adapter boundary split etkisi:
- auth session/account/cookie/password sorumlulukları route-local ayrı dosyalara ayrıldı.

Local runtime/env alignment etkisi:
- `.env.example` ve `drizzle.config.ts` local postgres `5437` portuna hizalandı.

## Local runtime/env notu

- `.env.local` local runtime için kullanıldı ve commitlenmeyecek.
- Local PostgreSQL host port: `5437`
- Docker runtime dış bağımlılığı: `poncik-live-postgres-5437`

## Commit / push kanıtı

- exact commit hash ve push kanıtı commit/push adımından sonra final close-out raporunda doğrulanır.
- close-out anında intended commit set yalnız PR-4 auth core ve local runtime alignment dosyalarından oluşur.
- `.env.local`, docker runtime state ve geçici smoke dosyaları commit setine dahil edilmez.

## Bilerek yapılmayanlar

- PR-5 / PR-6 alanları
- publisher status / onboarding
- support/Tawk
- admin approval
- watch gating
- payment / minute / 1v1

## Follow-up notları

- Sıradaki canonical iş: `PR-5 — Publisher Register + Application + Status Surfaces`
- Local runtime korunacaksa Docker container ve `.env.local` aynı çizgide tutulmalı.
- `account_status` truth’u approval zincirinden ayrı tutulmaya devam etmeli.
