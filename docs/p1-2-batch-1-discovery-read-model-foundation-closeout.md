# kısa hüküm

P1.2 Batch 1, discovery read path foundation'ını genişletmek için dar kapsamda uygulandı. Görünür discovery grid live listeyi kullanmaya devam ederken approved non-live publisher verisi foundation/read olarak ayrı taşınır hale getirildi.

# scope korundu mu

Evet. Bu batch yalnız `public-live-read.ts` ve `discovery-controller.tsx` içinde kaldı. `DiscoveryEntry` export'u backward-compatible korundu. Schema, `/auth`, `/studio`, `/live/[username]`, `discovery-card.tsx` ve `discovery.module.css` açılmadı.

# changed files

- `src/app/(public)/_lib/public-live-read.ts`
- `src/app/(public)/_controllers/discovery-controller.tsx`
- `docs/p1-2-batch-1-discovery-read-model-foundation-closeout.md`

# read modelde ne değişti

- `DiscoveryEntry` korunarak live liste için backward-compatible shape devam etti.
- `DiscoveryResult` live `entries` yanında `approvedOfflineEntries` taşıyacak şekilde genişletildi.
- Approved non-live publisher verisi bu batch'te yalnız foundation/read olarak eklendi.
- Offline entry `href` kararı freeze edilmedi; nullable bırakıldı.
- Cover tarafında yalnız dürüst referans alanları taşındı:
  - `coverImageId`
  - `coverImageStorageKey`
- Asset URL/public path çözümü bilinçli olarak açılmadı.
- Görünür discovery grid hâlâ live listeyi kullanıyor.

# bilerek ne değiştirilmedi

- `discovery-card.tsx` değiştirilmedi.
- `discovery.module.css` değiştirilmedi.
- Schema'ya girilmedi.
- `/auth`, `/studio`, `/live/[username]` dosyaları açılmadı.
- Cover asset rendering veya write path açılmadı.

# validation özeti

- `npm run lint`: PASS
- `npm run build`: PASS

# commit hash

Bu close-out akışında commit sonrası işlendi.

# push durumu

Bu close-out akışında push sonrası işlendi.

# final worktree durumu

Bu close-out akışında push sonrası doğrulandı.

# unknown / follow-up

- Asset URL/public path çözümü bu batch'te bilinçli olarak açılmadı.
- Approved non-live verinin görünür UI kullanımı sonraki doğal iş olarak discovery UI batch'ine kaldı.
