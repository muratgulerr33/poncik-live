# P1.3 Tur 3 — Live Watch Fullscreen Overlay Chrome Close-out

## 1) Kısa hüküm

- PASS / KABUL
- P1.3 Tur 3 batch'i tek close-out altında kapatıldı.
- Bu batch yalnız `/live/[username]` public watch route'u için fullscreen-first overlay chrome kurdu ve ardından contrast, stage framing ve loading presence polish'leriyle dar biçimde toparlandı.

## 2) Scope özeti

Bu turda kapanan iş:

- `/live/[username]` fullscreen-first watch chrome
- eski page-style üst bloğun kaldırılması
- route-local live chrome shell
- leading cluster içinde `X + @username`
- `router.back()` tabanlı close davranışı
- light/dark contrast polish
- stage/chrome spacing ve framing polish
- loading presence micro polish:
  - küçük spinner
  - `Canlı yayına bağlanıyor.` metni

Bu turda açılmadı:

- viewer count
- chat
- analytics
- global fullscreen framework
- global loading sistemi
- playback/provider/token mantığı değişikliği

## 3) Hangi batch'ler birlikte kapandı

- fullscreen-first watch chrome batch
- contrast ve stage framing polish follow-up'ı
- loading presence micro polish follow-up'ı

## 4) Changed files

- `docs/p1-3-tur-3-live-watch-fullscreen-overlay-chrome-closeout.md`
- `src/app/(public)/live/[username]/_components/live-watch-shell.tsx`
- `src/app/(public)/live/[username]/_components/live-watch-route-shell.tsx`
- `src/app/(public)/live/[username]/_components/live-watch-state.tsx`
- `src/app/(public)/live/[username]/_components/LiveWatchPlaybackSurface.tsx`
- `src/app/(public)/live/[username]/_components/live-watch.module.css`

## 5) Root cause özeti

Fullscreen-first hissi bozan ana sebep mevcut watch shell içindeki page-style üst bloktu:

- discovery geri linki
- `Public watch`
- route-level description

Follow-up polish'lerde görülen driftler:

- live route-local CSS içinde username renginin light mode'da fazla açılması
- chrome ile stage arasında gereksiz dikey boşluk
- stage çevresinde nested-card hissi
- ilk route açılışında ve connecting anında küçük loading presence eksikliği

## 6) Ne değişti

- mevcut discovery geri linki ve page-style header kaldırıldı
- yeni küçük route-local live chrome shell eklendi
- leading cluster yalnız `X + @username` taşıyacak şekilde sadeleştirildi
- `X` click ve `Esc` close davranışı `router.back()` ile bağlandı
- fullscreen-first canvas hissi için shell ve stage düzeni route-local CSS içinde daraltıldı
- preserve-first geometry korundu:
  - crop-first açılmadı
  - `object-fit: contain` korundu
- light mode'da username ve `X` kontrastı semantic token çizgisinde düzeltildi
- stage border/radius/shadow ilişkisi sadeleştirilerek nested-card hissi azaltıldı
- loading fallback ve connecting overlay içine küçük spinner + kısa loading metni eklendi

## 7) Scope denetimi

- yalnız `/live/[username]` route-local alanına dokunuldu
- `/`, `/auth`, `/studio` dosyaları açılmadı
- playback hook/controller/provider hattı açılmadı
- token/adapter/provider alanı açılmadı
- global fullscreen framework açılmadı
- global loading sistemi açılmadı
- viewer count/chat/analytics gibi yeni feature'lar açılmadı

## 8) Command-verified sanity

- `npm run lint`: PASS
- `npm run build`: PASS
- dar route smoke:
  - `/live/test-user`: `200`
  - `/live/sementatest`: `200`
- hafif regression status smoke:
  - `/`: `200`
  - `/auth`: `200`
  - `/studio`: `307`
- built HTML smoke:
  - `X` render ediliyor
  - `@username` render ediliyor
  - eski discovery geri linki ve eski description görünmüyor
  - loading fallback içinde spinner ve `Canlı yayına bağlanıyor.` render ediliyor

## 9) Manual smoke notu

- PASS kabul edilen temel davranış:
  - discovery'den live route'a giriş
  - fullscreen-first his
  - `X` çalışması
  - `@username` görünürlüğü
- close-out turunda yeni Playwright koşusu alınmadı
- loading presence'in gerçek yayın bağlantı anındaki hissi bu close-out turunda ayrıca manuel yeniden kanıtlanmadı

## 10) Remaining unknown

- `router.back()` cold-entry durumunda history sonucu neyse onu uygular; bu turda fallback kuralı icat edilmedi
- ended yüzeyi bu batch içinde ayrı fixture ile tam egzersiz edilmedi
- loading presence'in gerçek canlı bağlantı anındaki geçiş hissi command-verified değil; built fallback HTML ve code-truth seviyesinde doğrulandı
