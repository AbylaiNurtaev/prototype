import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { TadsWidgetProvider } from "react-tads-widget";
import "./index.css";
import App from "./App.jsx";
import { requestFullscreen, isFullscreen } from "@telegram-apps/sdk";

// Инициализация Telegram WebApp до рендеринга компонентов
const initTelegramWebApp = async () => {
  const tg = window?.Telegram?.WebApp;
  if (!tg) return;

  // Инициализация Telegram WebApp
  tg.ready();

  // Расширение на весь экран (должно быть вызвано сразу после ready)
  tg.expand();

  // Попытка включить полноэкранный режим через SDK
  let fullscreenEnabled = false;
  if (requestFullscreen?.isAvailable?.()) {
    try {
      await requestFullscreen();
      fullscreenEnabled = isFullscreen();
    } catch (err) {
      console.log("Не удалось включить fullscreen через SDK:", err);
    }
  }

  // Fallback: прямой вызов Telegram API
  if (!fullscreenEnabled && tg.requestFullscreen && typeof tg.requestFullscreen === "function") {
    try {
      await tg.requestFullscreen();
      fullscreenEnabled = true;
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
      } catch (err) {
        console.log("Не удалось включить fullscreen через viewport:", err);
      }
    }
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
