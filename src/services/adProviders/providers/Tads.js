import Provider from "../Provider.js";

/**
 * Провайдер Tads CPC (клики)
 * Использует react-tads-widget для отображения рекламы
 */
class Tads extends Provider {
  constructor(config = {}) {
    super("tads", {
      widgetId: config.widgetId || "972",
      ...config,
    });
  }

  async loadSDK() {
    // Tads SDK загружается через npm пакет react-tads-widget
    // Проверяем, что TadsWidgetProvider доступен (через React контекст)
    // Для проверки просто убеждаемся, что пакет установлен
    // В реальности проверка будет через React компонент
    return true;
  }

  async initSDK() {
    // Tads инициализируется через React компонент TadsWidget
    // Здесь просто помечаем как инициализированный
    this.sdk = {
      widgetId: this.config.widgetId,
      initialized: true,
    };
    return true;
  }

  async checkAdAvailability() {
    // Tads виджет сам проверяет доступность рекламы
    // Считаем, что реклама доступна, если SDK инициализирован
    return this.sdk && this.sdk.initialized;
  }

  async fetchAd() {
    if (!this.sdk) {
      throw new Error("SDK не инициализирован");
    }

    try {
      // Возвращаем данные для отображения через React компонент
      return {
        provider: this.name,
        widgetId: this.config.widgetId,
        sdk: this.sdk,
      };
    } catch (error) {
      console.error("[Tads] Ошибка загрузки рекламы:", error);
      throw error;
    }
  }

  async displayAd(adData) {
    // Tads отображается через React компонент TadsWidget
    // Этот метод вызывается для проверки, но реальное отображение происходит в компоненте
    // Возвращаем промис, который будет разрешен через колбэки компонента
    return new Promise((resolve) => {
      // Сохраняем resolve для вызова из компонента
      if (!this.displayPromise) {
        this.displayPromise = { resolve, resolved: false };
      }

      // Таймаут на случай, если колбэки не вызовутся
      setTimeout(() => {
        if (this.displayPromise && !this.displayPromise.resolved) {
          console.warn("[Tads] Таймаут ожидания рекламы (30 секунд)");
          this.displayPromise.resolved = true;
          this.displayPromise.resolve({
            success: false,
            cancelled: false,
            noAd: true,
          });
          this.displayPromise = null;
        }
      }, 30000);
    });
  }

  /**
   * Вызывается из компонента при успешном клике на рекламу
   */
  onReward() {
    if (this.displayPromise && !this.displayPromise.resolved) {
      console.log("[Tads] ✅ onReward вызван - пользователь кликнул на рекламу");
      this.displayPromise.resolved = true;
      this.displayPromise.resolve({
        success: true,
        cancelled: false,
        noAd: false,
      });
      this.displayPromise = null;
    }
  }

  /**
   * Вызывается из компонента, если реклама не найдена
   */
  onAdsNotFound() {
    if (this.displayPromise && !this.displayPromise.resolved) {
      console.warn("[Tads] ❌ onAdsNotFound вызван - реклама не найдена");
      this.displayPromise.resolved = true;
      this.displayPromise.resolve({
        success: false,
        cancelled: false,
        noAd: true,
      });
      this.displayPromise = null;
    }
  }
}

export default Tads;
