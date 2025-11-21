import Provider from "../Provider.js";

/**
 * Провайдер Tads
 */
class Tads extends Provider {
  constructor(config = {}) {
    super("tads", {
      apiKey: config.apiKey || "",
      siteId: config.siteId || "",
      ...config,
    });
  }

  async loadSDK() {
    if (window.Tads) {
      return;
    }

    // await this.loadScript("https://tads.com/sdk.js");
  }

  async initSDK() {
    if (!window.Tads) {
      // Не выбрасываем ошибку, просто помечаем как не инициализированный
      return;
    }

    this.sdk = window.Tads.init({
      apiKey: this.config.apiKey,
      siteId: this.config.siteId,
    });
  }

  async checkAdAvailability() {
    if (!this.sdk || !window.Tads) {
      return false;
    }

    try {
      return await this.sdk.hasAd();
    } catch (error) {
      console.error("[Tads] Ошибка проверки доступности:", error);
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
        image_url: ad.image || ad.imageUrl || "",
        link: ad.url || ad.clickUrl || "",
        provider: this.name,
      };
    } catch (error) {
      console.error("[Tads] Ошибка загрузки рекламы:", error);
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

      const checkClosed = setInterval(() => {
        if (adWindow.closed) {
          clearInterval(checkClosed);
          resolve({ success: true, cancelled: false, noAd: false });
        }
      }, 500);

      setTimeout(() => {
        clearInterval(checkClosed);
        if (!adWindow.closed) {
          resolve({ success: true, cancelled: false, noAd: false });
        }
      }, 30000);
    });
  }
}

export default Tads;

