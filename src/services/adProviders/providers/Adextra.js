import Provider from "../Provider.js";

/**
 * Провайдер Adextra (для просмотра рекламы - CPM)
 */
class Adextra extends Provider {
  constructor(config = {}) {
    super("adextra", {
      placementId:
        config.placementId || "fb9241580830412d8a338984f66c494146f23f50",
      ...config,
    });
  }

  async loadSDK() {
    // SDK Adextra загружается через внешний <script> тег в index.html
    // Проверяем, что функция p_adextra доступна
    if (window.p_adextra) {
      console.log("[Adextra] SDK загружен, p_adextra доступен");
      return;
    }

    // Если SDK не загружен, ждем немного (на случай, если скрипт еще загружается)
    console.log("[Adextra] Ожидание загрузки SDK...");
    let attempts = 0;
    const maxAttempts = 30; // Увеличиваем количество попыток
    while (!window.p_adextra && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      attempts++;
    }

    if (window.p_adextra) {
      console.log("[Adextra] SDK успешно загружен");
    } else {
      console.warn(
        "[Adextra] SDK не загружен после ожидания. Убедитесь, что скрипт добавлен в index.html"
      );
    }
  }

  async initSDK() {
    if (!window.p_adextra) {
      console.warn("[Adextra] p_adextra не доступен при инициализации");
      this.sdk = null;
      return;
    }

    console.log("[Adextra] Инициализация SDK...");

    // Находим div для рекламы (он должен быть в index.html)
    const placementId = this.config.placementId;

    // Ждем, пока DOM загрузится
    if (document.readyState === "loading") {
      await new Promise((resolve) => {
        if (document.readyState === "loading") {
          document.addEventListener("DOMContentLoaded", resolve);
        } else {
          resolve();
        }
      });
    }

    let adContainer = document.getElementById(placementId);
    if (!adContainer) {
      // Если div не найден, создаем его
      console.log(`[Adextra] Создаем контейнер с ID: ${placementId}`);
      adContainer = document.createElement("div");
      adContainer.id = placementId;
      document.body.appendChild(adContainer);
    } else {
      console.log(`[Adextra] Контейнер найден: ${placementId}`);
    }

    // Скрываем контейнер по умолчанию
    adContainer.style.display = "none";

    this.adContainer = adContainer;
    this.sdk = { initialized: true };
    console.log("[Adextra] SDK инициализирован успешно");
  }

  async checkAdAvailability() {
    // Проверяем наличие функции p_adextra
    if (!window.p_adextra) {
      console.log("[Adextra] p_adextra не доступен");
      return false;
    }

    // Проверяем, что SDK инициализирован
    if (!this.sdk) {
      console.log(
        "[Adextra] SDK не инициализирован, пытаемся инициализировать..."
      );
      // Пытаемся инициализировать, если еще не инициализирован
      await this.initSDK();
    }

    // Для Adextra всегда считаем, что реклама может быть доступна
    // Реальная проверка происходит при запросе
    return this.sdk !== null;
  }

  async fetchAd() {
    if (!this.sdk) {
      throw new Error("SDK не инициализирован");
    }

    // Для Adextra реклама загружается через p_adextra
    // Возвращаем объект с данными для отображения
    return {
      provider: this.name,
      placementId: this.config.placementId,
      container: this.adContainer,
    };
  }

  async displayAd(adData) {
    return new Promise((resolve) => {
      if (!adData || !window.p_adextra) {
        resolve({ success: false, cancelled: false, noAd: true });
        return;
      }

      // Сохраняем promise для разрешения в колбэках
      this.displayPromise = { resolve };

      try {
        const placementId = this.config.placementId;

        // Определяем колбэки для обработки событий
        const onSuccess = () => {
          console.log("[Adextra] ✅ Реклама показана успешно", { placementId });

          // Отправляем beacon на бэкенд о том, что реклама показана
          // (опционально, если нужно отслеживать на бэкенде)
          // fetch(`https://example.com/beacon/showed/${placementId}`).catch(() => {});

          if (this.displayPromise) {
            // Для CPM минимальное время просмотра
            const minViewTime = 5000;

            // Реклама показана, ждем минимальное время просмотра
            setTimeout(() => {
              if (this.displayPromise) {
                this.displayPromise.resolve({
                  success: true,
                  cancelled: false,
                  noAd: false,
                });
                this.displayPromise = null;
              }
            }, minViewTime);
          }
        };

        const onError = () => {
          console.warn("[Adextra] ❌ Ошибка при показе рекламы", {
            placementId,
          });

          // Отправляем beacon на бэкенд об ошибке
          // (опционально, если нужно отслеживать на бэкенде)
          // fetch(`https://example.com/beacon/error/${placementId}`).catch(() => {});

          if (this.displayPromise) {
            this.displayPromise.resolve({
              success: false,
              cancelled: false,
              noAd: true,
            });
            this.displayPromise = null;
          }
        };

        // Показываем контейнер перед вызовом
        if (this.adContainer) {
          this.adContainer.style.display = "block";
        }

        // Вызываем p_adextra с колбэками
        window.p_adextra(onSuccess, onError);

        // Таймаут на случай, если колбэки не вызовутся
        setTimeout(() => {
          if (this.displayPromise) {
            console.warn("[Adextra] Таймаут ожидания рекламы");
            this.displayPromise.resolve({
              success: false,
              cancelled: false,
              noAd: true,
            });
            this.displayPromise = null;
          }
        }, 10000);
      } catch (error) {
        console.error("[Adextra] Ошибка при показе рекламы:", error);
        resolve({ success: false, cancelled: true, noAd: false });
        this.displayPromise = null;
      }
    });
  }
}

export default Adextra;
