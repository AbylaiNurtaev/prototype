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

    // Инициализируем AdexiumWidget с конфигурацией
    // НЕ используем autoMode, т.к. будем вызывать requestAd вручную
    this.sdk = new window.AdexiumWidget({
      wid: this.config.widgetId,
      adFormat: this.config.format || "interstitial",
      debug: false, // Убираем debug в продакшене
    });

    // Настраиваем обработчики событий
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    if (!this.sdk) return;

    // Обработчик получения рекламы
    // Когда реклама получена, автоматически показываем её
    this.sdk.on("adReceived", (ad) => {
      console.log("[Adexium] ✅ Реклама получена:", ad);
      this.currentAd = ad;

      // Если есть ожидающий промис, показываем рекламу
      if (this.displayPromise && this.sdk && ad) {
        // Показываем рекламу используя displayAd
        this.sdk.displayAd(ad);
      }
    });

    // Обработчик отсутствия рекламы
    this.sdk.on("noAdFound", () => {
      console.warn("[Adexium] ❌ Реклама не найдена");
      if (this.displayPromise && !this.displayPromise.resolved) {
        this.displayPromise.resolved = true;
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
      console.log("[Adexium] ✅ Просмотр рекламы завершен");
      if (this.displayPromise && !this.displayPromise.resolved) {
        this.displayPromise.resolved = true;
        this.displayPromise.resolve({
          success: true,
          cancelled: false,
          noAd: false,
        });
        this.displayPromise = null;
      }
    });

    // Обработчик закрытия рекламы пользователем
    this.sdk.on("adClosed", () => {
      console.log("[Adexium] ⚠️ Реклама закрыта пользователем");
      if (this.displayPromise && !this.displayPromise.resolved) {
        this.displayPromise.resolved = true;
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
      this.displayPromise = { resolve, resolved: false };

      try {
        // Проверяем, что метод requestAd существует
        if (typeof adData.sdk.requestAd !== "function") {
          console.error("[Adexium] Метод requestAd не доступен");
          this.displayPromise.resolved = true;
          this.displayPromise.resolve({
            success: false,
            cancelled: false,
            noAd: true,
          });
          this.displayPromise = null;
          return;
        }

        console.log("[Adexium] Запрашиваем рекламу через requestAd...");

        // Запрашиваем рекламу вручную
        // Когда реклама будет получена, событие adReceived автоматически вызовет displayAd
        adData.sdk.requestAd(this.config.format || "interstitial");

        // Таймаут на случай, если реклама не загрузится
        setTimeout(() => {
          if (this.displayPromise && !this.displayPromise.resolved) {
            console.warn("[Adexium] Таймаут ожидания рекламы (15 секунд)");
            this.displayPromise.resolved = true;
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
        if (this.displayPromise && !this.displayPromise.resolved) {
          this.displayPromise.resolved = true;
          this.displayPromise.resolve({
            success: false,
            cancelled: true,
            noAd: false,
          });
          this.displayPromise = null;
        }
      }
    });
  }
}

export default Adexium;
