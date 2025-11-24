import AdsgramCPC from "./providers/AdsgramCPC.js";
import AdsgramCPM from "./providers/AdsgramCPM.js";
import Adexium from "./providers/Adexium.js";

/**
 * Менеджер рекламных провайдеров
 * Управляет всеми провайдерами и выбирает подходящий по приоритету
 */
class ProviderManager {
  constructor() {
    this.providers = new Map();
    this.providerConfigs = {};
    this.initialized = false;
  }

  /**
   * Инициализация менеджера с конфигурацией провайдеров
   * @param {Object} configs - конфигурации для каждого провайдера
   */
  async initialize(configs = {}) {
    if (this.initialized) {
      return;
    }

    this.providerConfigs = configs;

    // Проверяем, включен ли fallback режим (для тестирования без SDK)
    const fallbackMode =
      configs.fallbackMode === true ||
      (typeof window !== "undefined" && window.AD_PROVIDERS_FALLBACK === true);

    // Создаем экземпляры провайдеров
    const defaultConfig = fallbackMode ? { fallbackMode: true } : {};

    this.providers.set(
      "adsgram-cpc",
      new AdsgramCPC({ ...defaultConfig, ...(configs["adsgram-cpc"] || {}) })
    );
    this.providers.set(
      "adsgram-cpm",
      new AdsgramCPM({ ...defaultConfig, ...(configs["adsgram-cpm"] || {}) })
    );
    this.providers.set(
      "adexium",
      new Adexium({ ...defaultConfig, ...(configs["adexium"] || {}) })
    );

    if (fallbackMode) {
      console.log(
        "🔧 [ProviderManager] Fallback режим включен - используются тестовые данные"
      );
    }

    this.initialized = true;
  }

  /**
   * Получить провайдера по имени
   * @param {string} providerName - имя провайдера
   * @returns {Provider|null}
   */
  getProvider(providerName) {
    // Нормализуем имя провайдера
    const normalizedName = this.normalizeProviderName(providerName);
    return this.providers.get(normalizedName) || null;
  }

  /**
   * Нормализация имени провайдера
   * @param {string} name - исходное имя
   * @returns {string} - нормализованное имя
   */
  normalizeProviderName(name) {
    if (!name) return "";

    const nameMap = {
      adsgram: "adsgram-cpc",
      "adsgram-cpc": "adsgram-cpc",
      "adsgram-cpm": "adsgram-cpm",
      adexium: "adexium",
    };

    return nameMap[name.toLowerCase()] || name.toLowerCase();
  }

  /**
   * Получить список провайдеров для типа задания
   * @param {string} actionType - тип действия ("click" или "view")
   * @returns {Array<string>} - список имен провайдеров в порядке приоритета
   */
  getProvidersForAction(actionType) {
    if (actionType === "click" || actionType === "cpc") {
      // Провайдеры для кликов (CPC)
      return ["adsgram-cpc"];
    } else {
      // Провайдеры для просмотров (CPM)
      // Adexium имеет приоритет выше AdsgramCPM
      return ["adexium", "adsgram-cpm"];
    }
  }

  /**
   * Запустить рекламу через конкретного провайдера
   * @param {string} providerName - имя провайдера
   * @returns {Promise<{success: boolean, cancelled: boolean, noAd: boolean, provider: string}>}
   */
  async startAd(providerName) {
    if (!this.initialized) {
      await this.initialize();
    }

    const provider = this.getProvider(providerName);
    if (!provider) {
      console.error(`[ProviderManager] Провайдер "${providerName}" не найден`);
      return {
        success: false,
        cancelled: false,
        noAd: true,
        provider: providerName,
      };
    }

    try {
      console.log(`[ProviderManager] Запуск рекламы через ${provider.name}`);
      const result = await provider.start();
      return result;
    } catch (error) {
      console.error(
        `[ProviderManager] Ошибка запуска рекламы через ${providerName}:`,
        error
      );
      return {
        success: false,
        cancelled: true,
        noAd: false,
        provider: providerName,
      };
    }
  }

  /**
   * Запустить рекламу через первого доступного провайдера
   * @param {string} actionType - тип действия ("click" или "view")
   * @param {string} preferredProvider - предпочтительный провайдер (опционально)
   * @returns {Promise<{success: boolean, cancelled: boolean, noAd: boolean, provider: string}>}
   */
  async startAdWithFallback(actionType = "view", preferredProvider = null) {
    if (!this.initialized) {
      await this.initialize();
    }

    // Если указан предпочтительный провайдер, пробуем его сначала
    if (preferredProvider) {
      const normalizedName = this.normalizeProviderName(preferredProvider);
      const provider = this.providers.get(normalizedName);

      if (provider) {
        const isAvailable = await provider.isAdAvailable();
        if (isAvailable) {
          console.log(
            `[ProviderManager] Используем предпочтительный провайдер: ${normalizedName}`
          );
          return await this.startAd(normalizedName);
        }
      }
    }

    // Получаем список провайдеров для данного типа действия
    const providerList = this.getProvidersForAction(actionType);

    // Перебираем провайдеров по приоритету
    for (const providerName of providerList) {
      const provider = this.providers.get(providerName);
      if (!provider) {
        continue;
      }

      try {
        // Проверяем доступность рекламы
        const isAvailable = await provider.isAdAvailable();
        if (isAvailable) {
          console.log(
            `[ProviderManager] Найден доступный провайдер: ${providerName}`
          );
          return await this.startAd(providerName);
        }
      } catch (error) {
        console.error(
          `[ProviderManager] Ошибка проверки провайдера ${providerName}:`,
          error
        );
        continue;
      }
    }

    // Если ни один провайдер не доступен
    console.warn("[ProviderManager] Нет доступных провайдеров");
    return {
      success: false,
      cancelled: false,
      noAd: true,
      provider: null,
    };
  }

  /**
   * Обновить конфигурацию провайдера
   * @param {string} providerName - имя провайдера
   * @param {Object} config - новая конфигурация
   */
  updateProviderConfig(providerName, config) {
    const normalizedName = this.normalizeProviderName(providerName);
    const provider = this.providers.get(normalizedName);

    if (provider) {
      provider.config = { ...provider.config, ...config };
      provider.isInitialized = false; // Сбрасываем инициализацию для применения новой конфигурации
    }
  }
}

// Создаем единственный экземпляр менеджера (singleton)
const providerManager = new ProviderManager();

export default providerManager;
