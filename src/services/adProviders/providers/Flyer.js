import Provider from "../Provider.js";

/**
 * Провайдер Flyer
 */
class Flyer extends Provider {
  constructor(config = {}) {
    super("flyer", {
      apiKey: config.apiKey || "",
      publisherId: config.publisherId || "",
      ...config,
    });
  }

  async loadSDK() {
    if (window.Flyer) {
      return;
    }

    // await this.loadScript("https://flyer.com/sdk.js");
  }

  async initSDK() {
    if (!window.Flyer) {
      // Не выбрасываем ошибку, просто помечаем как не инициализированный
      // Это позволит другим провайдерам попробовать
      return;
    }

    this.sdk = window.Flyer.init({
      apiKey: this.config.apiKey,
      publisherId: this.config.publisherId,
    });
  }

  async checkAdAvailability() {
    if (!this.sdk || !window.Flyer) {
      return false;
    }

    try {
      return await this.sdk.isReady();
    } catch (error) {
      console.error("[Flyer] Ошибка проверки доступности:", error);
      return false;
    }
  }

  async fetchAd() {
    if (!this.sdk || !window.Flyer) {
      throw new Error("Flyer SDK не инициализирован");
    }

    try {
      const ad = await this.sdk.getBanner();
      return {
        title: ad.title || "",
        description: ad.description || "",
        image_url: ad.imageUrl || ad.banner || "",
        link: ad.url || ad.clickUrl || "",
        provider: this.name,
      };
    } catch (error) {
      console.error("[Flyer] Ошибка загрузки рекламы:", error);
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

export default Flyer;

