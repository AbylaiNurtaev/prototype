/**
 * Базовый класс для всех рекламных провайдеров
 * Каждый провайдер должен наследоваться от этого класса и реализовать все методы
 */
class Provider {
  constructor(name, config = {}) {
    this.name = name;
    this.config = config;
    this.isInitialized = false;
    this.sdk = null;
  }

  /**
   * Инициализация SDK провайдера
   * @returns {Promise<boolean>} - true если инициализация успешна
   */
  async initialize() {
    if (this.isInitialized) {
      return true;
    }

    try {
      await this.loadSDK();
      await this.initSDK();
      // Проверяем, что SDK действительно инициализирован
      // Если initSDK вернул undefined (SDK не загружен), не помечаем как инициализированный
      if (this.sdk) {
        this.isInitialized = true;
        return true;
      }
      return false;
    } catch (error) {
      // Тихая обработка - SDK может быть просто не загружен
      // Логируем только если это не ожидаемая ситуация
      if (error.message && !error.message.includes("не загружен")) {
        console.error(`[${this.name}] Ошибка инициализации:`, error);
      }
      return false;
    }
  }

  /**
   * Загрузка SDK скрипта (если требуется)
   * Переопределяется в дочерних классах
   */
  async loadSDK() {
    // По умолчанию ничего не делаем
    // Каждый провайдер может переопределить этот метод
  }

  /**
   * Инициализация SDK с конфигурацией
   * Переопределяется в дочерних классах
   */
  async initSDK() {
    // По умолчанию ничего не делаем
    // Каждый провайдер должен переопределить этот метод
  }

  /**
   * Проверка доступности рекламы
   * @returns {Promise<boolean>} - true если реклама доступна
   */
  async isAdAvailable() {
    try {
      if (!this.isInitialized) {
        const initialized = await this.initialize();
        if (!initialized) {
          return false;
        }
      }

      return await this.checkAdAvailability();
    } catch (error) {
      // Тихая обработка ошибок - просто возвращаем false
      // Ошибки уже залогированы в initialize()
      return false;
    }
  }

  /**
   * Проверка доступности рекламы (конкретная реализация)
   * Переопределяется в дочерних классах
   */
  async checkAdAvailability() {
    // Fallback режим для тестирования (если включен в конфиге)
    if (this.config.fallbackMode === true) {
      return true;
    }
    return false;
  }

  /**
   * Загрузка рекламы
   * @returns {Promise<Object>} - данные рекламы
   */
  async loadAd() {
    if (!this.isInitialized) {
      const initialized = await this.initialize();
      if (!initialized) {
        throw new Error(`Провайдер ${this.name} не инициализирован`);
      }
    }

    try {
      return await this.fetchAd();
    } catch (error) {
      console.error(`[${this.name}] Ошибка загрузки рекламы:`, error);
      throw error;
    }
  }

  /**
   * Загрузка рекламы (конкретная реализация)
   * Переопределяется в дочерних классах
   */
  async fetchAd() {
    // Fallback режим для тестирования (если включен в конфиге)
    if (this.config.fallbackMode === true) {
      return {
        title: `Тестовая реклама (${this.name})`,
        description: "Это тестовая реклама для проверки функциональности. В продакшене здесь будет реальная реклама.",
        image_url: "https://via.placeholder.com/300x200?text=Test+Ad",
        link: "https://example.com",
        provider: this.name,
      };
    }
    throw new Error("Метод fetchAd должен быть переопределен");
  }

  /**
   * Показ рекламы
   * @param {Object} adData - данные рекламы
   * @returns {Promise<{success: boolean, cancelled: boolean, noAd: boolean}>}
   */
  async showAd(adData) {
    if (!adData) {
      return { success: false, cancelled: false, noAd: true };
    }

    try {
      return await this.displayAd(adData);
    } catch (error) {
      console.error(`[${this.name}] Ошибка показа рекламы:`, error);
      return { success: false, cancelled: true, noAd: false };
    }
  }

  /**
   * Показ рекламы (конкретная реализация)
   * Переопределяется в дочерних классах
   */
  async displayAd(adData) {
    // Fallback режим для тестирования (если включен в конфиге)
    if (this.config.fallbackMode === true) {
      return new Promise((resolve) => {
        if (!adData || !adData.link) {
          resolve({ success: false, cancelled: false, noAd: true });
          return;
        }

        // Открываем ссылку в новом окне
        const adWindow = window.open(adData.link, "_blank", "noopener,noreferrer");

        if (!adWindow) {
          resolve({ success: false, cancelled: true, noAd: false });
          return;
        }

        // Для тестового режима считаем успешным, если окно открылось
        const checkClosed = setInterval(() => {
          if (adWindow.closed) {
            clearInterval(checkClosed);
            resolve({ success: true, cancelled: false, noAd: false });
          }
        }, 500);

        // Таймаут
        setTimeout(() => {
          clearInterval(checkClosed);
          if (!adWindow.closed) {
            resolve({ success: true, cancelled: false, noAd: false });
          } else {
            resolve({ success: true, cancelled: false, noAd: false });
          }
        }, 3000); // Короткий таймаут для тестового режима
      });
    }
    throw new Error("Метод displayAd должен быть переопределен");
  }

  /**
   * Запуск рекламы (загрузка + показ)
   * @returns {Promise<{success: boolean, cancelled: boolean, noAd: boolean, provider: string}>}
   */
  async start() {
    try {
      // Проверяем доступность
      const isAvailable = await this.isAdAvailable();
      if (!isAvailable) {
        return { success: false, cancelled: false, noAd: true, provider: this.name };
      }

      // Загружаем рекламу
      const adData = await this.loadAd();
      if (!adData) {
        return { success: false, cancelled: false, noAd: true, provider: this.name };
      }

      // Показываем рекламу
      const result = await this.showAd(adData);
      return { ...result, provider: this.name };
    } catch (error) {
      console.error(`[${this.name}] Ошибка запуска рекламы:`, error);
      return { success: false, cancelled: true, noAd: false, provider: this.name };
    }
  }

  /**
   * Вспомогательный метод для загрузки скрипта
   */
  loadScript(url) {
    return new Promise((resolve, reject) => {
      // Проверяем, не загружен ли уже скрипт
      const existingScript = document.querySelector(`script[src="${url}"]`);
      if (existingScript) {
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.src = url;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Не удалось загрузить скрипт: ${url}`));
      document.head.appendChild(script);
    });
  }
}

export default Provider;

