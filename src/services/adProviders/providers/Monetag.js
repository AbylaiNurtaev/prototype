import Provider from "../Provider.js";

/**
 * Провайдер Monetag
 */
class Monetag extends Provider {
  constructor(config = {}) {
    super("monetag", {
      apiKey: config.apiKey || "",
      siteId: config.siteId || "",
      ...config,
    });
  }

  async loadSDK() {
    // SDK Monetag загружается через внешний <script> тег в index.html
    // Просто проверяем, что SDK доступен
    if (window.Monetag) {
      return;
    }

    // Если SDK не загружен, ждем немного (на случай, если скрипт еще загружается)
    let attempts = 0;
    const maxAttempts = 10;
    while (!window.Monetag && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      attempts++;
    }

    if (!window.Monetag) {
      console.warn("[Monetag] SDK не загружен. Убедитесь, что скрипт добавлен в index.html");
    }
  }

  async initSDK() {
    if (!window.Monetag) {
      // Не выбрасываем ошибку, просто помечаем как не инициализированный
      return;
    }

    this.sdk = window.Monetag.init({
      apiKey: this.config.apiKey,
      siteId: this.config.siteId,
    });
  }

  async checkAdAvailability() {
    if (!this.sdk || !window.Monetag) {
      return false;
    }

    try {
      return await this.sdk.hasAd();
    } catch (error) {
      console.error("[Monetag] Ошибка проверки доступности:", error);
      return false;
    }
  }

  async fetchAd() {
    if (!this.sdk) {
      throw new Error("SDK не инициализирован");
    }

    try {
      const ad = await this.sdk.loadAd();
      return {
        title: ad.title || "",
        description: ad.description || "",
        image_url: ad.image || ad.imageUrl || "",
        link: ad.url || ad.clickUrl || "",
        provider: this.name,
      };
    } catch (error) {
      console.error("[Monetag] Ошибка загрузки рекламы:", error);
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

export default Monetag;

