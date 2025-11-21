import Provider from "../Provider.js";

/**
 * Провайдер Adsgram CPM (просмотры)
 */
class AdsgramCPM extends Provider {
  constructor(config = {}) {
    super("adsgram-cpm", {
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
      console.warn("[AdsgramCPM] SDK не загружен. Убедитесь, что скрипт добавлен в index.html");
    }
  }

  async initSDK() {
    // Инициализация SDK Adsgram CPM
    if (!window.Adsgram) {
      // Не выбрасываем ошибку, просто помечаем как не инициализированный
      return;
    }

    this.sdk = window.Adsgram.init({
      apiKey: this.config.apiKey,
      placementId: this.config.placementId,
      type: "cpm",
    });
  }

  async checkAdAvailability() {
    if (!this.sdk || !window.Adsgram) {
      return false;
    }

    try {
      return await this.sdk.isAdAvailable();
    } catch (error) {
      console.error("[AdsgramCPM] Ошибка проверки доступности:", error);
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
        image_url: ad.imageUrl || ad.image_url || "",
        link: ad.viewUrl || ad.link || "",
        provider: this.name,
      };
    } catch (error) {
      console.error("[AdsgramCPM] Ошибка загрузки рекламы:", error);
      throw error;
    }
  }

  async displayAd(adData) {
    return new Promise((resolve) => {
      if (!adData || !adData.link) {
        resolve({ success: false, cancelled: false, noAd: true });
        return;
      }

      // Для CPM открываем рекламу и ждем минимальное время просмотра
      const adWindow = window.open(adData.link, "_blank", "noopener,noreferrer");

      if (!adWindow) {
        resolve({ success: false, cancelled: true, noAd: false });
        return;
      }

      // Минимальное время просмотра для CPM (5 секунд)
      const minViewTime = 5000;
      let viewStartTime = Date.now();

      const checkClosed = setInterval(() => {
        if (adWindow.closed) {
          clearInterval(checkClosed);
          const viewTime = Date.now() - viewStartTime;
          if (viewTime >= minViewTime) {
            resolve({ success: true, cancelled: false, noAd: false });
          } else {
            resolve({ success: false, cancelled: true, noAd: false });
          }
        }
      }, 500);

      // Таймаут
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

export default AdsgramCPM;

