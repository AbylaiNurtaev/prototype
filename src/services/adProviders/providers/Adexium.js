import Provider from "../Provider.js";

/**
 * Провайдер Adexium (для просмотра рекламы - CPM)
 */
class Adexium extends Provider {
  constructor(config = {}) {
    super("adexium", {
      widgetId: config.widgetId || "11381",
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
      console.warn(
        "[Adexium] SDK не загружен. Убедитесь, что скрипт добавлен в index.html"
      );
    }
  }

  async initSDK() {
    if (!window.AdexiumWidget) {
      // Не выбрасываем ошибку, просто помечаем как не инициализированный
      return;
    }

    // Инициализируем AdexiumWidget с простой конфигурацией
    this.sdk = new window.AdexiumWidget({
      wid: this.config.widgetId,
      adFormat: this.config.format || "interstitial",
      firstAdImpressionIntervalInSeconds: 5,
      adImpressionIntervalInSeconds: 100,
      debug: true,
      isFullScreen: false,
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
      console.log("[Adexium] Реклама не найдена");
      if (this.displayPromise) {
        this.displayPromise.resolve({
          success: false,
          cancelled: false,
          noAd: true,
        });
        this.displayPromise = null;
      }
    });

    // Обработчик ошибок (если SDK поддерживает)
    if (typeof this.sdk.on === "function") {
      try {
        this.sdk.on("error", (error) => {
          console.warn("[Adexium] Ошибка SDK:", error);
          if (this.displayPromise) {
            this.displayPromise.resolve({
              success: false,
              cancelled: false,
              noAd: true,
            });
            this.displayPromise = null;
          }
        });
      } catch (e) {
        // Игнорируем, если событие error не поддерживается
      }
    }

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

    // Проверяем, что SDK действительно работает
    // Если были ошибки при загрузке, возвращаем false
    try {
      // Для Adexium считаем, что реклама может быть доступна
      // Реальная проверка происходит при запросе
      return true;
    } catch (error) {
      console.warn("[Adexium] Ошибка при проверке доступности:", error);
      return false;
    }
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
        console.warn("[Adexium] SDK не доступен для показа рекламы");
        resolve({ success: false, cancelled: false, noAd: true });
        return;
      }

      // Сохраняем promise для разрешения в обработчиках событий
      this.displayPromise = { resolve };

      try {
        // Проверяем, что метод requestAd существует
        if (typeof adData.sdk.requestAd !== "function") {
          console.error("[Adexium] Метод requestAd не доступен");
          resolve({ success: false, cancelled: false, noAd: true });
          this.displayPromise = null;
          return;
        }

        // Запрашиваем рекламу вручную (не используем autoMode, т.к. он запускает автоматический показ)
        // Реклама будет показана автоматически через событие adReceived
        adData.sdk.requestAd(this.config.format || "interstitial");

        // Таймаут на случай, если реклама не загрузится
        setTimeout(() => {
          if (this.displayPromise) {
            console.warn("[Adexium] Таймаут ожидания рекламы");
            this.displayPromise.resolve({
              success: false,
              cancelled: false,
              noAd: true,
            });
            this.displayPromise = null;
          }
        }, 15000);
      } catch (error) {
        console.error("[Adexium] Ошибка при показе рекламы:", error);
        resolve({ success: false, cancelled: true, noAd: false });
        this.displayPromise = null;
      }
    });
  }
}

export default Adexium;
