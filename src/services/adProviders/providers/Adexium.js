import Provider from "../Provider.js";

/**
 * Провайдер Adexium (для просмотра рекламы - CPM)
 */
class Adexium extends Provider {
  constructor(config = {}) {
    super("adexium", {
      widgetId: config.widgetId || "663a49e0-7cde-4d4d-83ad-a866a0f3b774",
      format: config.format || "interstitial",
      ...config,
    });
  }

  async loadSDK() {
    // SDK Adexium загружается через внешний <script> тег в index.html
    // Просто проверяем, что SDK доступен
    if (window.AdexiumWidget) {
      return;
    }

    // Если SDK не загружен, ждем немного (на случай, если скрипт еще загружается)
    let attempts = 0;
    const maxAttempts = 10;
    while (!window.AdexiumWidget && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      attempts++;
    }

    if (!window.AdexiumWidget) {
      console.warn("[Adexium] SDK не загружен. Убедитесь, что скрипт добавлен в index.html");
    }
  }

  async initSDK() {
    if (!window.AdexiumWidget) {
      // Не выбрасываем ошибку, просто помечаем как не инициализированный
      return;
    }

    // Инициализируем AdexiumWidget
    this.sdk = new window.AdexiumWidget({
      wid: this.config.widgetId,
      adFormat: this.config.format || "interstitial",
      debug: true,
    });

    // Настраиваем обработчики событий
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    if (!this.sdk) return;

    // Обработчик получения рекламы
    this.sdk.on("adReceived", (ad) => {
      this.currentAd = ad;
      // Если есть ожидающий промис, показываем рекламу
      if (this.displayPromise && this.sdk && ad) {
        this.sdk.displayAd(ad);
      }
    });

    // Обработчик отсутствия рекламы
    this.sdk.on("noAdFound", () => {
      if (this.displayPromise) {
        this.displayPromise.resolve({
          success: false,
          cancelled: false,
          noAd: true,
        });
        this.displayPromise = null;
      }
    });

    // Обработчик завершения просмотра рекламы
    this.sdk.on("adPlaybackCompleted", () => {
      if (this.displayPromise) {
        this.displayPromise.resolve({
          success: true,
          cancelled: false,
          noAd: false,
        });
        this.displayPromise = null;
      }
    });

    // Обработчик закрытия рекламы
    this.sdk.on("adClosed", () => {
      if (this.displayPromise) {
        this.displayPromise.resolve({
          success: false,
          cancelled: true,
          noAd: false,
        });
        this.displayPromise = null;
      }
    });
  }

  async checkAdAvailability() {
    if (!this.sdk || !window.AdexiumWidget) {
      return false;
    }

    // Для Adexium всегда считаем, что реклама может быть доступна
    // Реальная проверка происходит при запросе
    return true;
  }

  async fetchAd() {
    if (!this.sdk) {
      throw new Error("SDK не инициализирован");
    }

    // Для Adexium реклама загружается автоматически через requestAd
    // Возвращаем объект с данными для отображения
    return {
      provider: this.name,
      sdk: this.sdk,
    };
  }

  async displayAd(adData) {
    return new Promise((resolve) => {
      if (!adData || !adData.sdk) {
        resolve({ success: false, cancelled: false, noAd: true });
        return;
      }

      // Сохраняем promise для разрешения в обработчиках событий
      this.displayPromise = { resolve };

      try {
        // Если реклама уже получена, показываем её сразу
        if (this.currentAd) {
          adData.sdk.displayAd(this.currentAd);
        } else {
          // Запрашиваем рекламу
          // Реклама будет показана автоматически в обработчике adReceived
          adData.sdk.requestAd(this.config.format || "interstitial");
        }

        // Таймаут на случай, если реклама не загрузится
        setTimeout(() => {
          if (this.displayPromise) {
            this.displayPromise.resolve({
              success: false,
              cancelled: false,
              noAd: true,
            });
            this.displayPromise = null;
          }
        }, 10000);
      } catch (error) {
        console.error("[Adexium] Ошибка при показе рекламы:", error);
        resolve({ success: false, cancelled: true, noAd: false });
        this.displayPromise = null;
      }
    });
  }
}

export default Adexium;

