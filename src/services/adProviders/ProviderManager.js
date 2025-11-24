import AdsgramCPC from "./providers/AdsgramCPC.js";
import AdsgramCPM from "./providers/AdsgramCPM.js";
import Adexium from "./providers/Adexium.js";
import Adextra from "./providers/Adextra.js";
import Tads from "./providers/Tads.js";
import Barza from "./providers/Barza.js";

/**
 * Менеджер рекламных провайдеров
 * Управляет всеми провайдерами и выбирает подходящий по приоритету
 */
class ProviderManager {
  constructor() {
    this.providers = new Map();
    this.providerConfigs = {};
    this.initialized = false;
    this.isShowingAd = false; // Флаг для предотвращения параллельного показа рекламы
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
    this.providers.set(
      "adextra",
      new Adextra({ ...defaultConfig, ...(configs["adextra"] || {}) })
    );
    this.providers.set(
      "tads",
      new Tads({ ...defaultConfig, ...(configs["tads"] || {}) })
    );
    this.providers.set(
      "barza",
      new Barza({ ...defaultConfig, ...(configs["barza"] || {}) })
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
      adextra: "adextra",
      tads: "tads",
      barza: "barza",
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
      // Приоритет: Barza -> Tads -> AdsgramCPC
      return ["barza", "tads", "adsgram-cpc"];
    } else {
      // Провайдеры для просмотров (CPM)
      // Приоритет: Adexium -> Adextra -> AdsgramCPM
      return ["adexium", "adextra", "adsgram-cpm"];
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
    // КРИТИЧНО: Если реклама уже показывается, не запускаем еще одну
    if (this.isShowingAd) {
      console.log(
        `[ProviderManager] ⛔ Реклама уже показывается, игнорируем новый запрос`
      );
      return {
        success: false,
        cancelled: true,
        noAd: false,
        provider: null,
      };
    }

    if (!this.initialized) {
      await this.initialize();
    }

    // Устанавливаем флаг, что реклама показывается
    this.isShowingAd = true;

    // Флаг для отслеживания успешного просмотра
    let adSuccessfullyViewed = false;

    try {
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
            const result = await this.startAd(normalizedName);
            // Если успешно просмотрено, останавливаемся
            if (result.success === true) {
              return result;
            }
          }
        }
      }

      // Получаем список провайдеров для данного типа действия
      const providerList = this.getProvidersForAction(actionType);
      console.log(
        `[ProviderManager] Список провайдеров для ${actionType}:`,
        providerList
      );

      // Перебираем провайдеров по приоритету
      for (const providerName of providerList) {
        // КРИТИЧНО: Если реклама уже успешно просмотрена, НЕ проверяем следующие провайдеры
        if (adSuccessfullyViewed) {
          console.log(
            `[ProviderManager] ⛔ Реклама уже просмотрена, пропускаем ${providerName}`
          );
          break;
        }

        const provider = this.providers.get(providerName);
        if (!provider) {
          console.warn(
            `[ProviderManager] Провайдер ${providerName} не найден в списке`
          );
          continue;
        }

        try {
          // КРИТИЧНО: Проверяем флаг ПЕРЕД ЛЮБЫМИ ДЕЙСТВИЯМИ
          if (adSuccessfullyViewed) {
            console.log(
              `[ProviderManager] ⛔⛔⛔ РЕКЛАМА УЖЕ ПРОСМОТРЕНА, ПРЕРЫВАЕМ ЦИКЛ ДО ПРОВЕРКИ ${providerName}`
            );
            break; // Прерываем цикл немедленно
          }

          console.log(`[ProviderManager] Проверяем провайдер: ${providerName}`);
          // Проверяем доступность рекламы
          const isAvailable = await provider.isAdAvailable();
          console.log(
            `[ProviderManager] Провайдер ${providerName} доступен:`,
            isAvailable
          );
          if (isAvailable) {
            // ЕЩЕ РАЗ проверяем флаг перед запуском рекламы
            if (adSuccessfullyViewed) {
              console.log(
                `[ProviderManager] ⛔⛔⛔ РЕКЛАМА УЖЕ ПРОСМОТРЕНА, НЕ ЗАПУСКАЕМ ${providerName}`
              );
              break;
            }

            console.log(
              `[ProviderManager] Найден доступный провайдер: ${providerName}, запускаем рекламу...`
            );
            const result = await this.startAd(providerName);

            console.log(
              `[ProviderManager] Результат от ${providerName}:`,
              result
            );

            // КРИТИЧНО: Если реклама успешно просмотрена, СРАЗУ останавливаемся
            // НЕ пробуем следующие провайдеры - ВОЗВРАЩАЕМ РЕЗУЛЬТАТ НЕМЕДЛЕННО
            if (result && result.success === true) {
              console.log(
                `[ProviderManager] ✅✅✅ РЕКЛАМА УСПЕШНО ПРОСМОТРЕНА через ${providerName}, ОСТАНАВЛИВАЕМ ПОИСК НЕМЕДЛЕННО`
              );
              // Устанавливаем флаг, чтобы следующие провайдеры не проверялись
              adSuccessfullyViewed = true;
              // Немедленно возвращаем результат - это прервет цикл for и функцию
              const finalResult = { ...result, provider: providerName };
              console.log(
                `[ProviderManager] ВОЗВРАЩАЕМ РЕЗУЛЬТАТ И ПРЕРЫВАЕМ ВСЕ:`,
                finalResult
              );
              return finalResult; // ЭТО ДОЛЖНО ПРЕРВАТЬ ЦИКЛ И ФУНКЦИЮ
            }

            // Если реклама не найдена (noAd: true), пробуем следующий провайдер
            if (result && result.noAd === true) {
              console.log(
                `[ProviderManager] Провайдер ${providerName} не нашел рекламу, пробуем следующий...`
              );
              continue; // Переходим к следующему провайдеру
            }

            // Если была отмена пользователем, тоже пробуем следующий провайдер
            if (result && result.cancelled === true) {
              console.log(
                `[ProviderManager] Пользователь отменил просмотр через ${providerName}, пробуем следующий...`
              );
              continue; // Переходим к следующему провайдеру
            }

            // Для других ошибок пробуем следующий провайдер
            console.log(
              `[ProviderManager] Неизвестный результат от ${providerName}, пробуем следующий...`,
              result
            );
            continue; // Переходим к следующему провайдеру
          } else {
            console.log(
              `[ProviderManager] Провайдер ${providerName} недоступен, пробуем следующий...`
            );
          }
        } catch (error) {
          console.error(
            `[ProviderManager] Ошибка проверки провайдера ${providerName}:`,
            error
          );
          continue; // Переходим к следующему провайдеру
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
    } finally {
      // Сбрасываем флаг после завершения (успешного или нет)
      this.isShowingAd = false;
      console.log("[ProviderManager] Сброшен флаг isShowingAd");
    }
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
