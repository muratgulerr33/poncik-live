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
    "Yerel önizleme hazır olduğunda Başlat ile canlı sahneye geçebilirsin.",
  previewLabel: "Hazırlık önizlemesi",
  previewBody:
    "Önizleme hazır olduğunda yayın henüz başlamaz; canlıya geçişi Başlat açar.",
  previewPlaceholder: "Kamera ve mikrofon hazırlığı kontrol ediliyor.",
  prepMetaPrefix: "Hazırlık hesabı",
  requestingTitle: "Cihaz izni isteniyor",
  requestingBody:
    "Tarayıcı izin verirse önizleme burada açılır.",
  previewReadyTitle: "Yerel önizleme hazır",
  previewReadyBody:
    "Kamera ve mikrofon hazır. Yayın henüz başlamadı.",
  blockedTitle: "Cihaz izni tamamlanamadı",
  blockedBody:
    "Tarayıcı izin istemini tamamlamadı veya izin verilmedi. İstersen tekrar deneyebilirsin.",
  unsupportedTitle: "Bu cihazda yayın hazırlığı sınırlı",
  unsupportedBody:
    "Gerekli medya API'leri görünmüyor veya güvenli bağlam sağlanmadı. Şimdilik yerel önizleme açılamıyor.",
  timeoutTitle: "Cihaz yanıtı zamanında gelmedi",
  timeoutBody:
    "İzin isteği tamamlanamadı. Şimdilik dar fallback gösteriliyor; istersen tekrar deneyebilirsin.",
  capabilityDegradedTitle: "Cihaz uygunluğu şu anda okunamıyor",
  capabilityDegradedBody:
    "Yerel önizleme doğrulanamadı. Şimdilik dar fallback gösteriliyor.",
  retryPreviewLabel: "Tekrar dene",
  startBroadcastLabel: "Başlat",
  startingBroadcastLabel: "Başlatılıyor",
  stopBroadcastLabel: "Bitir",
  stoppingBroadcastLabel: "Bitiriliyor",
  exitConfirmTitle: "Canlıyı durdur?",
  exitConfirmConfirmLabel: "Evet",
  exitConfirmCancelLabel: "Hayır",
  idleLifecycleLabel: "Henüz canlı değil",
  liveLifecycleLabel: "Şu anda canlı",
  degradedLifecycleLabel: "Durum senkronu sınırlı",
  startBroadcastError:
    "Yayın şu anda başlatılamıyor. Onaylı publisher oturumu ile tekrar dene.",
  stopBroadcastError:
    "Yayın şu anda kapatılamıyor. Biraz sonra tekrar deneyebilirsin."
} as const;
