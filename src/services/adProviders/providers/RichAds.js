import Provider from "../Provider.js";

/**
 * Провайдер RichAds
 */
class RichAds extends Provider {
  constructor(config = {}) {
    super("richads", {
      apiKey: config.apiKey || "",
      zoneId: config.zoneId || "",
      ...config,
    });
  }

  async loadSDK() {
    // SDK RichAds загружается через внешний <script> тег в index.html
    // Просто проверяем, что SDK доступен
    if (window.RichAds) {
      return;
    }

    // Если SDK не загружен, ждем немного (на случай, если скрипт еще загружается)
    let attempts = 0;
    const maxAttempts = 10;
    while (!window.RichAds && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      attempts++;
    }

    if (!window.RichAds) {
      console.warn("[RichAds] SDK не загружен. Убедитесь, что скрипт добавлен в index.html");
    }
  }

  async initSDK() {
    if (!window.RichAds) {
      // Не выбрасываем ошибку, просто помечаем как не инициализированный
      return;
    }

    this.sdk = window.RichAds.init({
      apiKey: this.config.apiKey,
      zoneId: this.config.zoneId,
    });
  }

  async checkAdAvailability() {
    if (!this.sdk || !window.RichAds) {
      return false;
    }

    try {
      return await this.sdk.isAdAvailable();
    } catch (error) {
      console.error("[RichAds] Ошибка проверки доступности:", error);
      return false;
    }
  }

  async fetchAd() {
    if (!this.sdk) {
      throw new Error("SDK не инициализирован");
    }

    try {
      const ad = await this.sdk.getAd();
      return {
        title: ad.title || "",
        description: ad.description || "",
        image_url: ad.imageUrl || ad.banner || "",
        link: ad.clickUrl || ad.url || "",
        provider: this.name,
      };
    } catch (error) {
      console.error("[RichAds] Ошибка загрузки рекламы:", error);
      throw error;
    }
  }

  async displayAd(adData) {
    return new Promise((resolve) => {
      if (!adData || !adData.link) {
        resolve({ success: false, cancelled: false, noAd: true });
        return;
      }

      const adWindow = window.open(adData.link, "_blank", "noopener,noreferrer");

      if (!adWindow) {
        resolve({ success: false, cancelled: true, noAd: false });
        return;
      }

      const minViewTime = 5000;
      let viewStartTime = Date.now();

      const checkClosed = setInterval(() => {
        if (adWindow.closed) {
          clearInterval(checkClosed);
          const viewTime = Date.now() - viewStartTime;
          resolve({
            success: viewTime >= minViewTime,
            cancelled: viewTime < minViewTime,
            noAd: false,
          });
        }
      }, 500);

      setTimeout(() => {
        clearInterval(checkClosed);
        if (!adWindow.closed) {
          resolve({ success: true, cancelled: false, noAd: false });
        } else {
          const viewTime = Date.now() - viewStartTime;
          resolve({
            success: viewTime >= minViewTime,
            cancelled: viewTime < minViewTime,
            noAd: false,
          });
        }
      }, 30000);
    });
  }
}

export default RichAds;

