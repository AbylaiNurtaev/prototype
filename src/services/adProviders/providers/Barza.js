import Provider from "../Provider.js";

/**
 * Провайдер Barza (CPC)
 * Работает через API/webhook, получает баннер и обрабатывает клики
 */
class Barza extends Provider {
  constructor(config = {}) {
    super("barza", {
      apiUrl: config.apiUrl || "https://api.barza.com",
      campaignId: config.campaignId || "",
      webhookUrl: config.webhookUrl || "",
      ...config,
    });
    this.displayPromise = null;
    this.adContainer = null;
  }

  async loadSDK() {
    // Barza работает через API, не требует загрузки внешних скриптов
    return true;
  }

  async initSDK() {
    // Инициализация не требуется, работаем через API
    this.sdk = {
      initialized: true,
      apiUrl: this.config.apiUrl,
      campaignId: this.config.campaignId,
    };
    return true;
  }

  async checkAdAvailability() {
    // Всегда считаем, что реклама доступна (проверка будет при загрузке)
    return this.sdk && this.sdk.initialized;
  }

  async fetchAd() {
    try {
      // Запрашиваем баннер через API
      // Если API не настроен, возвращаем данные для iframe
      const adData = {
        provider: this.name,
        campaignId: this.config.campaignId,
        apiUrl: this.config.apiUrl,
        // Если есть прямой URL баннера, используем его
        bannerUrl: this.config.bannerUrl || null,
        iframeUrl: this.config.iframeUrl || null,
      };

      return adData;
    } catch (error) {
      console.error("[Barza] Ошибка загрузки рекламы:", error);
      throw error;
    }
  }

  async displayAd(adData) {
    return new Promise((resolve) => {
      // Сохраняем promise для разрешения при клике
      this.displayPromise = { resolve, resolved: false };

      try {
        // Создаем контейнер для баннера, если его нет
        if (!this.adContainer) {
          this.adContainer = document.createElement("div");
          this.adContainer.id = `barza-ad-${Date.now()}`;
          this.adContainer.style.width = "100%";
          this.adContainer.style.height = "100%";
          this.adContainer.style.display = "flex";
          this.adContainer.style.justifyContent = "center";
          this.adContainer.style.alignItems = "center";
        }

        // Если есть iframeUrl, используем iframe
        if (adData.iframeUrl) {
          const iframe = document.createElement("iframe");
          iframe.src = adData.iframeUrl;
          iframe.style.width = "100%";
          iframe.style.height = "100%";
          iframe.style.border = "none";
          iframe.frameBorder = "0";
          iframe.scrolling = "no";

          // Обработка клика через postMessage
          window.addEventListener(
            "message",
            this.handleBarzaMessage.bind(this)
          );

          this.adContainer.appendChild(iframe);
        } else if (adData.bannerUrl) {
          // Если есть прямой URL баннера, создаем изображение
          const img = document.createElement("img");
          img.src = adData.bannerUrl;
          img.style.maxWidth = "100%";
          img.style.maxHeight = "100%";
          img.style.cursor = "pointer";

          img.onclick = () => {
            this.handleBarzaClick();
          };

          this.adContainer.appendChild(img);
        } else {
          // Если нет данных, считаем что рекламы нет
          console.warn("[Barza] Нет данных для отображения баннера");
          if (this.displayPromise && !this.displayPromise.resolved) {
            this.displayPromise.resolved = true;
            this.displayPromise.resolve({
              success: false,
              cancelled: false,
              noAd: true,
            });
            this.displayPromise = null;
          }
          return;
        }

        // Добавляем контейнер в DOM (будет добавлен в компоненте)
        this.adElement = this.adContainer;

        // Таймаут на случай, если клик не произойдет
        setTimeout(() => {
          if (this.displayPromise && !this.displayPromise.resolved) {
            console.warn("[Barza] Таймаут ожидания клика (30 секунд)");
            this.displayPromise.resolved = true;
            this.displayPromise.resolve({
              success: false,
              cancelled: false,
              noAd: true,
            });
            this.displayPromise = null;
          }
        }, 30000);
      } catch (error) {
        console.error("[Barza] Ошибка при отображении рекламы:", error);
        if (this.displayPromise && !this.displayPromise.resolved) {
          this.displayPromise.resolved = true;
          this.displayPromise.resolve({
            success: false,
            cancelled: false,
            noAd: true,
          });
          this.displayPromise = null;
        }
      }
    });
  }

  /**
   * Обработка клика на баннер Barza
   */
  handleBarzaClick() {
    console.log("[Barza] ✅ Клик на баннер Barza");

    if (this.displayPromise && !this.displayPromise.resolved) {
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
   * Обработка сообщений от iframe Barza
   */
  handleBarzaMessage(event) {
    // Проверяем origin для безопасности
    if (event.data && typeof event.data === "object") {
      const data = event.data;

      // Обрабатываем webhook callback от Barza
      if (data.notification_uuid || data.task_type === "exchange") {
        console.log("[Barza] ✅ Получен webhook callback от Barza:", data);
        this.handleBarzaClick();
      }
    }
  }

  /**
   * Получить элемент баннера для рендеринга
   */
  getAdElement() {
    return this.adElement || this.adContainer;
  }

  /**
   * Очистка ресурсов
   */
  cleanup() {
    if (this.adContainer && this.adContainer.parentNode) {
      this.adContainer.parentNode.removeChild(this.adContainer);
    }
    window.removeEventListener("message", this.handleBarzaMessage.bind(this));
    this.adContainer = null;
    this.adElement = null;
    this.displayPromise = null;
  }
}

export default Barza;
