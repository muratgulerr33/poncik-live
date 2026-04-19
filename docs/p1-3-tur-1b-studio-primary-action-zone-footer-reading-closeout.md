# P1.3 Tur 1B — Studio Primary Action Zone Footer Reading Close-out

## kısa hüküm

- PASS / KABUL
- Bu close-out yalnız approved publisher `/studio` healthy approved prep visible surface içindeki Tur 1B structural blocker'ını kapatır.
- `Başlat / Bitir` primary action zone'u ayrı page/footer CTA bandı gibi değil, aynı scene skeleton'un alt bütçesi gibi okunur hale getirildi.

## bu turda ne kapandı

- healthy approved prep görünümünde primary action zone için scene-local alt bütçe wrapper eklendi
- media ile action arasındaki page-band hissi azaltıldı
- `Başlat / Bitir` action zone'u scene içi alt bütçe okunuşuna yaklaştırıldı
- pre-live ve live durumda ortak alt skeleton korundu

## scope disiplini korundu mu

- Evet
- Tur 1A yeniden açılmadı
- start/stop anlamı açılmadı
- exit alanı açılmadı
- continuity, viewer, support redesign, generic abstraction ve studio genel refactor açılmadı
- non-healthy/support yalnız regression guard çizgisinde bırakıldı

## manual smoke sonucu

- pre-live görsel smoke PASS
- live görsel smoke PASS
- `Başlat / Bitir` action zone'u artık ayrı footer CTA bandı gibi değil, same scene skeleton'un alt bütçesi gibi okunuyor
- pre-live ve live durumda ortak alt skeleton korunuyor

## DOM kanıtı

- pre-live `Başlat`
  - copy element:
    - `<div class="studio-module__ykpNTG__sceneActionBudget"><div class="studio-module__ykpNTG__lifecycleStack"><div class="studio-module__ykpNTG__actionRow studio-module__ykpNTG__lifecycleActionRow"><button class="ui-action ui-action-primary studio-module__ykpNTG__lifecyclePrimaryAction" type="button">Başlat</button></div></div></div>`
  - full xpath:
    - `/html/body/main/div/section/section/section/div/div/div[2]`
- live `Bitir`
  - copy element:
    - `<div class="studio-module__ykpNTG__lifecycleStack"><div class="studio-module__ykpNTG__actionRow studio-module__ykpNTG__lifecycleActionRow"><button class="ui-action ui-action-primary studio-module__ykpNTG__lifecyclePrimaryAction" type="button">Bitir</button></div></div>`
  - full xpath:
    - `/html/body/main/div/section/section/section/div/div/div[2]/div`
- dürüst not:
  - live tarafta seçilen node pre-live ile birebir aynı wrapper seviyesinde kopyalanmamış olabilir
  - ama live görsel smoke, `Bitir` action zone'unun da aynı alt budget içinde okunduğunu gösteriyor

## diff kanıtı

- `git diff --stat` sonucu:
  - `src/app/(studio)/studio/_components/StudioPreviewPanel.tsx` -> `+28 / -13`
  - `src/app/(studio)/studio/_components/studio.module.css` -> `+39 / -0`
- toplam:
  - `2 files changed`
  - `54 insertions(+)`
  - `13 deletions(-)`
- diff anlamı:
  - `StudioPreviewPanel.tsx` içinde `StudioLifecycleActions`, healthy preview durumunda yeni `sceneActionBudget` wrapper içine alındı
  - `studio.module.css` içinde `sceneActionBudget` için yeni visible-structure stilleri eklendi:
    - width
    - center hizalama
    - üst boşluk/band hissini kıran yakınlaştırma
    - padding
    - border
    - radius
    - background
    - box-shadow
    - `::before` çizgisi
    - mobil override

## command-verified sanity sonucu

- `npm run lint`: PASS
- `npm run build`: PASS

## dürüst kalan açık not

- DevTools ekranında primary button text contrast değeri `4.46` uyarısı görülüyor
- Bu Tur 1B structural PASS hükmünü bozmaz
- Ama ayrı küçük accessibility/polish follow-up notu olarak tutulmalıdır

## changed files

- `docs/p1-3-tur-1b-studio-primary-action-zone-footer-reading-closeout.md`
- `src/app/(studio)/studio/_components/StudioPreviewPanel.tsx`
- `src/app/(studio)/studio/_components/studio.module.css`

## commit mesajı

- `studio: close out primary action zone footer reading fix`

## final worktree durumu

- Selective add ile yalnız Tur 1B close-out write-set'i taşındı
- Scope dışı kirli dosya commit'e alınmadı
- Close-out commit sonrası worktree clean olmalıdır
