# PR-1 Technical Foundation Close-out

## Amaç

PR-1 kapsamında dar ve compile eden teknik foundation zemini kurmak, canonical route tree ve minimum DB/bootstrap omurgasını repo içine almak.

## PR-1'de yapılan foundation işleri

- Next.js App Router tabanli minimal `src` bootstrap kuruldu.
- Canonical route tree olusturuldu: `/`, `/auth`, `/live/[username]`, `/studio`.
- Tek root layout ve ince global foundation CSS zemini eklendi.
- `src/db/client.ts` ve `src/db/schema/` altinda minimum Drizzle/PostgreSQL foundation omurgasi kuruldu.
- DB foundation isim/doctrine zemini canonical truth ile hizalandi: `accounts.account_status`, `accounts.role_type`, `publisher_applications.status`, `publisher_settings.cover_image_id`, `broadcasts.publisher_account_id`.
- `.gitignore`, `.env.example`, lint/build bootstrap config'leri ve lockfile repo icine alindi.
- Local dev server portu follow-up ile `3006` olarak sabitlendi.
- `docs/` altindaki canonical proje dokumanlari repo kapsaminda tutuldu.

## Bilerek yapilmayanlar

- Feature davranisi, auth UI akisi, discovery, approval yuzeyleri, studio prep, publish lifecycle, TanStack Query, LiveKit/media, support ve tam DB schema derinligi eklenmedi.
- `account_roles`, `shared/ui`, `features/`, generic shared abstraction ve future-scope placeholder'lari acilmadi.

## Sanity sonuclari

- `npm run lint` gecti.
- `npm run build` gecti.
- Kisa dev dogrulamasinda uygulama `3006` portunda ayaga kalkti.

## Follow-up notlari

- `next-env.d.ts` tracked degildir.
- `next-env.d.ts` ignore altindadir.
- Bu dosya Next tarafindan regenerate edilir.
- Custom type ihtiyaci dogarsa ayri bir declaration dosyasi acilmalidir.
- `npm audit` ciktisinda moderate vulnerability notu vardir; bu PR'da duzeltme yapilmadi.

## Known risks / unknown

- DB zemini kasitli olarak ince tutuldu; relation ve constraint derinligi sonraki PR'lara birakildi.
- `docs/` altindaki canonical kaynak dokumanlar bu close-out ile repo icine alinmistir.
