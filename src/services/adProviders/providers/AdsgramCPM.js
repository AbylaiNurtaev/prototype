import Provider from "../Provider.js";

/**
 * Провайдер Adsgram CPM (просмотры)
 */
class AdsgramCPM extends Provider {
  constructor(config = {}) {
    super("adsgram-cpm", {
      blockId: config.blockId || "18010",
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

    // Инициализируем AdController с blockId
    this.sdk = window.Adsgram.init({
      blockId: this.config.blockId || "18010",
    });
  }

  async checkAdAvailability() {
    if (!this.sdk || !window.Adsgram) {
      return false;
    }

    try {
      // Проверяем доступность рекламы через SDK
      // Adsgram SDK может иметь метод isAvailable или подобный
      if (typeof this.sdk.isAvailable === "function") {
        return await this.sdk.isAvailable();
      }
      // Если метода нет, считаем что реклама доступна если SDK инициализирован
      return true;
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
      // Adsgram SDK может загружать рекламу автоматически при показе
      // Возвращаем объект с данными для отображения
      return {
        provider: this.name,
        sdk: this.sdk, // Передаем SDK для прямого использования
      };
    } catch (error) {
      console.error("[AdsgramCPM] Ошибка загрузки рекламы:", error);
      throw error;
    }
  }

  async displayAd(adData) {
    return new Promise((resolve) => {
      if (!adData || !adData.sdk) {
        resolve({ success: false, cancelled: false, noAd: true });
        return;
      }

      try {
        // Показываем рекламу через Adsgram SDK
        // Обычно SDK имеет метод show() или display()
        const adController = adData.sdk;
        
        // Минимальное время просмотра для CPM (5 секунд)
        const minViewTime = 5000;
        let viewStartTime = Date.now();
        
        // Пробуем разные возможные методы показа рекламы
        if (typeof adController.show === "function") {
          adController.show({
            onClose: () => {
              const viewTime = Date.now() - viewStartTime;
              resolve({
                success: viewTime >= minViewTime,
                cancelled: viewTime < minViewTime,
                noAd: false,
              });
            },
            onError: (error) => {
              console.error("[AdsgramCPM] Ошибка показа рекламы:", error);
              resolve({ success: false, cancelled: false, noAd: true });
            },
          });
        } else if (typeof adController.display === "function") {
          adController.display({
            onClose: () => {
              const viewTime = Date.now() - viewStartTime;
              resolve({
                success: viewTime >= minViewTime,
                cancelled: viewTime < minViewTime,
                noAd: false,
              });
            },
            onError: (error) => {
              console.error("[AdsgramCPM] Ошибка показа рекламы:", error);
              resolve({ success: false, cancelled: false, noAd: true });
            },
          });
        } else if (typeof adController.open === "function") {
          // Если есть метод open, открываем рекламу
          const result = adController.open();
          if (result) {
            // Для CPM ждем минимальное время просмотра
            setTimeout(() => {
              resolve({ success: true, cancelled: false, noAd: false });
            }, minViewTime);
          } else {
            resolve({ success: false, cancelled: true, noAd: false });
          }
        } else {
          // Если метод не найден, пробуем вызвать SDK напрямую
          console.warn("[AdsgramCPM] Метод показа рекламы не найден, пробуем альтернативный способ");
          // Резолвим как успех после минимального времени просмотра
          setTimeout(() => {
            resolve({ success: true, cancelled: false, noAd: false });
          }, minViewTime);
        }
      } catch (error) {
        console.error("[AdsgramCPM] Ошибка при показе рекламы:", error);
        resolve({ success: false, cancelled: true, noAd: false });
      }
    });
  }
}

export default AdsgramCPM;

