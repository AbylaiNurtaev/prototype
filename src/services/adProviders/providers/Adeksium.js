import Provider from "../Provider.js";

/**
 * Провайдер Adeksium
 */
class Adeksium extends Provider {
  constructor(config = {}) {
    super("adeksium", {
      apiKey: config.apiKey || "",
      siteId: config.siteId || "",
      ...config,
    });
  }

  async loadSDK() {
    // SDK Adeksium загружается через внешний <script> тег в index.html
    // Просто проверяем, что SDK доступен
    if (window.Adeksium) {
      return;
    }

    // Если SDK не загружен, ждем немного (на случай, если скрипт еще загружается)
    let attempts = 0;
    const maxAttempts = 10;
    while (!window.Adeksium && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      attempts++;
    }

    if (!window.Adeksium) {
      console.warn(
        "[Adeksium] SDK не загружен. Убедитесь, что скрипт добавлен в index.html"
      );
    }
  }

  async initSDK() {
    if (!window.Adeksium) {
      // Не выбрасываем ошибку, просто помечаем как не инициализированный
      return;
    }

    this.sdk = window.Adeksium.init({
      apiKey: this.config.apiKey,
      siteId: this.config.siteId,
    });
  }

  async checkAdAvailability() {
    if (!this.sdk || !window.Adeksium) {
      return false;
    }

    try {
      return await this.sdk.hasAvailableAd();
    } catch (error) {
      console.error("[Adeksium] Ошибка проверки доступности:", error);
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
      console.error("[Adeksium] Ошибка загрузки рекламы:", error);
      throw error;
    }
  }

  async displayAd(adData) {
    return new Promise((resolve) => {
      if (!adData || !adData.link) {
        resolve({ success: false, cancelled: false, noAd: true });
        return;
      }

      const adWindow = window.open(
        adData.link,
        "_blank",
        "noopener,noreferrer"
      );

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

export default Adeksium;
