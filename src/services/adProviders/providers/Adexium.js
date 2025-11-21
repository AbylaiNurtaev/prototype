import Provider from "../Provider.js";

/**
 * Провайдер Adexium
 */
class Adexium extends Provider {
  constructor(config = {}) {
    super("adexium", {
      apiKey: config.apiKey || "",
      zoneId: config.zoneId || "",
      ...config,
    });
  }

  async loadSDK() {
    // SDK Adexium загружается через внешний <script> тег в index.html
    // Просто проверяем, что SDK доступен
    if (window.Adexium) {
      return;
    }

    // Если SDK не загружен, ждем немного (на случай, если скрипт еще загружается)
    let attempts = 0;
    const maxAttempts = 10;
    while (!window.Adexium && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      attempts++;
    }

    if (!window.Adexium) {
      console.warn("[Adexium] SDK не загружен. Убедитесь, что скрипт добавлен в index.html");
    }
  }

  async initSDK() {
    if (!window.Adexium) {
      // Не выбрасываем ошибку, просто помечаем как не инициализированный
      return;
    }

    this.sdk = window.Adexium.init({
      apiKey: this.config.apiKey,
      zoneId: this.config.zoneId,
    });
  }

  async checkAdAvailability() {
    if (!this.sdk || !window.Adexium) {
      return false;
    }

    try {
      return await this.sdk.hasAd();
    } catch (error) {
      console.error("[Adexium] Ошибка проверки доступности:", error);
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
      console.error("[Adexium] Ошибка загрузки рекламы:", error);
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

      // Для CPM минимальное время просмотра
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

export default Adexium;

