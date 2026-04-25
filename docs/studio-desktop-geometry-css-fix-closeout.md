# Studio Desktop Geometry CSS Fix Close-out

## 1. Kısa hüküm

PASS. Bu close-out yalnız `/studio` desktop geometry CSS fix içindir; global Studio visual PASS değildir.

## 2. Scope

`/studio` approved publisher media surface içinde `@media (min-width: 641px) and (orientation: landscape)` branch'te `previewFrame` / `previewVideo` intrinsic `640×480` shrink davranışının kapatılması.

## 3. Non-scope

`/live/[username]`, camera switcher, mobile contract, realtime chat, DB, auth, TSX, top chrome redesign, chat redesign.

## 4. Changed files

- `src/app/(studio)/studio/_components/studio-preview-panel.module.css`
- `docs/studio-desktop-geometry-css-fix-closeout.md`

## 5. CSS değişiklik özeti

- `.previewFrame` auto/center sizing yerine explicit fill/stretch davranışına alındı.
- `.previewVideo` auto intrinsic sizing yerine explicit fill davranışına alındı.
- `object-fit: contain` korundu.

## 6. Kanıt özeti

- Önceki computed evidence: `1473×1472` ve üstünde frame/video `640×480` intrinsic size'a düşüyordu.
- Owner-reported final visual/computed smoke: desktop PASS.
- Owner-reported mobile regression smoke: PASS / unchanged.

## 7. Mobile no-touch

- mobile selectors untouched
- mobile portrait scale untouched
- mobile safe-area/action/composer/exit dialog untouched
- base contain policy untouched
- mobile smoke yalnız regression guard'dı

## 8. Özellikle dokunulmayan alanlar

- `.sceneMediaRoot`
- TSX
- `StudioTopChrome`
- `StudioChatOwners`
- `StudioRouteShell`
- `StudioPrepSurface`
- `/live/[username]`
- camera switcher
- realtime/chat DB

## 9. Lint/build

Implementation turunda:

- `npm run lint` PASS
- `npm run build` PASS

Close-out turunda yeniden çalıştırılmadı.

## 10. Remaining risk / unknown

- `@media (min-width: 641px) and (orientation: landscape)` tablet/mobile landscape'e de denk gelebilir; residual risk olarak kalır.
- Safari desktop doğrulanmadı.
- `/live/[username]` alignment scope dışıdır.
- Mobile landscape ayrıca doğrulanmadıysa unknown kalır.

## 11. Commit / push

Close-out doc oluşturulduktan sonra şu akış uygulandı:

- `git diff --stat`
- `git status -sb`
- `git add src/app/(studio)/studio/_components/studio-preview-panel.module.css docs/studio-desktop-geometry-css-fix-closeout.md`
- `git commit -m "studio: fix desktop media geometry scaling"`
- `git push origin main`
- `git status -sb`
