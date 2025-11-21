import Provider from "../Provider.js";

/**
 * Провайдер Adsgram CPC (клики)
 */
class AdsgramCPC extends Provider {
  constructor(config = {}) {
    super("adsgram-cpc", {
      apiKey: config.apiKey || "",
      placementId: config.placementId || "",
      ...config,
    });
  }

  async loadSDK() {
    // SDK Adsgram загружается через внешний <script> тег в index.html
    // Просто проверяем, что SDK доступен
    if (window.Adsgram) {
      return;
    }

    // Если SDK не загружен, ждем немного (на случай, если скрипт еще загружается)
    let attempts = 0;
    const maxAttempts = 10;
    while (!window.Adsgram && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      attempts++;
    }

    if (!window.Adsgram) {
      console.warn("[AdsgramCPC] SDK не загружен. Убедитесь, что скрипт добавлен в index.html");
    }
  }

  async initSDK() {
    // Инициализация SDK Adsgram CPC
    if (!window.Adsgram) {
      // Не выбрасываем ошибку, просто помечаем как не инициализированный
      return;
    }

    this.sdk = window.Adsgram.init({
      apiKey: this.config.apiKey,
      placementId: this.config.placementId,
      type: "cpc",
    });
  }

  async checkAdAvailability() {
    if (!this.sdk || !window.Adsgram) {
      return false;
    }

    try {
      // Проверяем доступность рекламы через SDK
      return await this.sdk.isAdAvailable();
    } catch (error) {
      console.error("[AdsgramCPC] Ошибка проверки доступности:", error);
      return false;
    }
  }

  async fetchAd() {
    if (!this.sdk) {
      throw new Error("SDK не инициализирован");
    }

    try {
      // Загружаем рекламу через SDK
      const ad = await this.sdk.loadAd();
      return {
        title: ad.title || "",
        description: ad.description || "",
        image_url: ad.imageUrl || ad.image_url || "",
        link: ad.clickUrl || ad.link || "",
        provider: this.name,
      };
    } catch (error) {
      console.error("[AdsgramCPC] Ошибка загрузки рекламы:", error);
      throw error;
    }
  }

  async displayAd(adData) {
    return new Promise((resolve) => {
      if (!adData || !adData.link) {
        resolve({ success: false, cancelled: false, noAd: true });
        return;
      }

      // Открываем рекламу в новом окне
      const adWindow = window.open(adData.link, "_blank", "noopener,noreferrer");

      if (!adWindow) {
        resolve({ success: false, cancelled: true, noAd: false });
        return;
      }

      // Отслеживаем закрытие окна
      const checkClosed = setInterval(() => {
        if (adWindow.closed) {
          clearInterval(checkClosed);
          // Для CPC считаем успешным, если окно было открыто
          resolve({ success: true, cancelled: false, noAd: false });
        }
      }, 500);

      // Таймаут на случай, если окно не закрывается
      setTimeout(() => {
        clearInterval(checkClosed);
        if (!adWindow.closed) {
          resolve({ success: true, cancelled: false, noAd: false });
        }
      }, 30000);
    });
  }
}

export default AdsgramCPC;

