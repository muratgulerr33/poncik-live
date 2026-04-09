export const STUDIO_COPY = {
  eyebrow: "Stüdyo",
  title: "Yayın hazırlığını tek yerde yönet.",
  description:
    "Bu alan yalnız yayın açma yetkisi onaylanmış publisher hesapları için hazırlık yüzeyini gösterir.",
  returnDiscoveryLabel: "Keşfe dön",
  wrongRoleTitle: "Bu yüzey yalnız yayıncı hesapları için açık",
  wrongRoleUserBody:
    "Yayın hazırlığı yalnız onaylanmış yayıncı hesaplarında açılır. Şimdilik keşiften devam edebilirsin.",
  wrongRoleAdminBody:
    "Admin hesabı bu alanda yayın hazırlığı açmaz. Başvuru işlemleri için auth yüzeyini kullanabilirsin.",
  sessionDegradedTitle: "Oturum durumu şu anda doğrulanamıyor",
  sessionDegradedBody:
    "Yayın hazırlığı bu durumda açılmadı. Şimdilik keşiften devam edebilir ve daha sonra tekrar deneyebilirsin.",
  pendingTitle: "Başvurun hâlâ inceleniyor",
  pendingBody:
    "Onay tamamlanmadan yayın hazırlığı açılmıyor. İnceleme bitene kadar bekleyebilir ve keşiften devam edebilirsin.",
  rejectedTitle: "Yayın hazırlığı şu anda açılamıyor",
  rejectedBody:
    "Başvurun kabul edilmediği için yayın hazırlığı açılmadı. Bu aşamada düzeltme veya yeniden gönderim akışı yok.",
  fallbackTitle: "Yayın hazırlığı şu anda gösterilemiyor",
  fallbackBody:
    "Başvuru durumun şu anda doğrulanamadı. Şimdilik keşiften devam edip daha sonra tekrar deneyebilirsin.",
  prepTitle: "Yayın hazırlığı",
  prepBody:
    "Onay tamamlandı. Bu adımda yalnız temel hazırlık ve cihaz uygunluğu bilgisi gösterilir.",
  previewLabel: "Hazırlık önizlemesi",
  previewBody:
    "Kapak seçimi, yayın başlatma ve medya akışı bu turda açılmadı. Burada yalnız hazırlık kabuğu gösterilir.",
  prepMetaPrefix: "Hazırlık hesabı",
  readyLaterTitle: "Tarayıcı hazırlığı uygun görünüyor",
  readyLaterBody:
    "Bu tarayıcıda gerekli temel API'ler görünüyor. Gerçek izin isteme ve yayın başlatma sonraki turda açılacak.",
  unsupportedTitle: "Bu cihazda yayın hazırlığı sınırlı",
  unsupportedBody:
    "Gerekli medya API'leri görünmüyor. Şimdilik yalnız hazırlık bilgisi gösteriliyor.",
  notReadyTitle: "İzin akışı henüz açılmadı",
  notReadyBody:
    "Bu turda gerçek kamera veya mikrofon isteği yapılmıyor. Hazırlık yüzeyi yalnız bilgi verir.",
  capabilityDegradedTitle: "Cihaz uygunluğu şu anda okunamıyor",
  capabilityDegradedBody:
    "Tarayıcı hazırlığı doğrulanamadı. Gerçek izin akışı bu turda yine de başlatılmaz."
} as const;
