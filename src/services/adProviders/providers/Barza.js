import Provider from "../Provider.js";

/**
 * Провайдер Barza (Barge)
 */
class Barza extends Provider {
  constructor(config = {}) {
    super("barza", {
      apiKey: config.apiKey || "",
      campaignId: config.campaignId || "",
      ...config,
    });
  }

  async loadSDK() {
    if (window.Barza || window.Barge) {
      return;
    }

    // await this.loadScript("https://barza.com/sdk.js");
  }

  async initSDK() {
    const sdk = window.Barza || window.Barge;
    if (!sdk) {
      // Не выбрасываем ошибку, просто помечаем как не инициализированный
      return;
    }

    this.sdk = sdk.init({
      apiKey: this.config.apiKey,
      campaignId: this.config.campaignId,
    });
  }

  async checkAdAvailability() {
    if (!this.sdk || (!window.Barza && !window.Barge)) {
      return false;
    }

    try {
      return await this.sdk.checkAvailability();
    } catch (error) {
      console.error("[Barza] Ошибка проверки доступности:", error);
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
        image_url: ad.image || ad.bannerUrl || "",
        link: ad.clickUrl || ad.targetUrl || "",
        provider: this.name,
      };
    } catch (error) {
      console.error("[Barza] Ошибка загрузки рекламы:", error);
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

export default Barza;

