import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { TadsWidgetProvider } from "react-tads-widget";
import "./index.css";
import App from "./App.jsx";
import { requestFullscreen, isFullscreen } from "@telegram-apps/sdk";

// Версия билда приложения (синхронизирована с package.json)
const APP_VERSION = "0.1.2";
console.log("[BUILD] App version:", APP_VERSION);

// Делаем версию доступной глобально для использования в компонентах
window.APP_VERSION = APP_VERSION;

// Инициализация Telegram WebApp до рендеринга компонентов
const initTelegramWebApp = async () => {
  console.log("[TG] initTelegramWebApp start");
  const tg = window?.Telegram?.WebApp;
  if (!tg) {
    console.log(
      "[TG] window.Telegram.WebApp не найден — код fullscreen не запускается"
    );
    return;
  }

  // Инициализация Telegram WebApp
  tg.ready();

  // Расширение на весь экран (должно быть вызвано сразу после ready)
  tg.expand();

  console.log("[TG] Telegram WebApp найден, начинаем попытку fullscreen");

  // Попытка включить полноэкранный режим через SDK
  let fullscreenEnabled = false;
  console.log(
    "[Fullscreen] SDK isAvailable:",
    typeof requestFullscreen?.isAvailable,
    requestFullscreen?.isAvailable?.()
  );
  if (requestFullscreen?.isAvailable?.()) {
    try {
      await requestFullscreen();
      fullscreenEnabled = isFullscreen();
      console.log(
        "[Fullscreen] SDK requestFullscreen:",
        fullscreenEnabled ? "успех" : "а т"
      );
    } catch (err) {
      console.log("Не удалось включить fullscreen через SDK:", err);
    }
  }

  // Fallback: прямой вызов Telegram API
  if (
    !fullscreenEnabled &&
    tg.requestFullscreen &&
    typeof tg.requestFullscreen === "function"
  ) {
    try {
      await tg.requestFullscreen();
      fullscreenEnabled = true;
      console.log("[Fullscreen] tg.requestFullscreen: успех");
    } catch (err) {
      console.log("Не удалось вызвать tg.requestFullscreen():", err);
    }
  }

  // Финальный fallback через viewport API
  if (!fullscreenEnabled) {
    const viewport = tg.viewport;
    if (viewport && viewport.requestFullscreen) {
      try {
        if (viewport.requestFullscreen.isAvailable?.()) {
          await viewport.requestFullscreen();
        } else if (typeof viewport.requestFullscreen === "function") {
          await viewport.requestFullscreen();
        }
        fullscreenEnabled = true;
        console.log("[Fullscreen] viewport.requestFullscreen: успех");
      } catch (err) {
        console.log("Не удалось включить fullscreen через viewport:", err);
      }
    }
  }

  if (!fullscreenEnabled) {
    console.log("[Fullscreen] Полноэкранный режим так и не включился");
  }

  // Настройка поведения приложения
  tg.enableClosingConfirmation();
  tg.disableVerticalSwipes();

  // Настройка цветов для полноэкранного режима (цвет должен совпадать с фоном)
  tg.setHeaderColor("#1a1a1a");
  tg.setBackgroundColor("#1a1a1a");

  // Применение начальной высоты viewport
  const applyVh = () => {
    const h = tg.viewportStableHeight || tg.viewportHeight;
    if (h) {
      document.documentElement.style.setProperty(
        "--tg-viewport-height",
        `${h}px`
      );
      document.body.style.height = `${h}px`;
      document.body.style.overflowY = "auto";
    }
  };

  applyVh();

  // Применение начальной темы
  const handleThemeChange = () => {
    const theme = tg.colorScheme;
    document.documentElement.setAttribute("data-theme", theme);
  };

  handleThemeChange();
};

// Блокировка поворота экрана - принудительная портретная ориентация
const lockOrientation = () => {
  // Проверяем доступность Screen Orientation API
  if (screen.orientation && screen.orientation.lock) {
    screen.orientation
      .lock("portrait")
      .then(() => {
        console.log("[Orientation] Экран заблокирован в портретной ориентации");
      })
      .catch((err) => {
        console.log("[Orientation] Не удалось заблокировать ориентацию:", err);
      });
  } else if (screen.lockOrientation) {
    // Старый API для совместимости
    try {
      screen.lockOrientation("portrait");
      console.log("[Orientation] Экран заблокирован (legacy API)");
    } catch (err) {
      console.log("[Orientation] Не удалось заблокировать ориентацию (legacy):", err);
    }
  } else if (screen.mozLockOrientation) {
    // Firefox
    try {
      screen.mozLockOrientation("portrait");
      console.log("[Orientation] Экран заблокирован (Firefox)");
    } catch (err) {
      console.log("[Orientation] Не удалось заблокировать ориентацию (Firefox):", err);
    }
  } else if (screen.msLockOrientation) {
    // IE/Edge
    try {
      screen.msLockOrientation("portrait");
      console.log("[Orientation] Экран заблокирован (IE/Edge)");
    } catch (err) {
      console.log("[Orientation] Не удалось заблокировать ориентацию (IE/Edge):", err);
    }
  }

  // Обработчик изменения ориентации - пытаемся заблокировать снова
  const handleOrientationChange = () => {
    if (screen.orientation && screen.orientation.lock) {
      screen.orientation.lock("portrait").catch(() => {
        // Игнорируем ошибки при повторных попытках
      });
    }
  };

  window.addEventListener("orientationchange", handleOrientationChange);
  window.addEventListener("resize", handleOrientationChange);
};

// Блокируем ориентацию при загрузке страницы
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", lockOrientation);
} else {
  lockOrientation();
}

// Инициализируем Telegram WebApp сразу
initTelegramWebApp().catch((err) =>
  console.log("Ошибка инициализации Telegram WebApp:", err)
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <TadsWidgetProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </TadsWidgetProvider>
  </StrictMode>
);
