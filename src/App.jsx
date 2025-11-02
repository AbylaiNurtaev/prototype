import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import BottomNavigation from "./components/BottomNavigation";
import LeadersPage from "./pages/leadersPage/leadersPage";
import TasksPage from "./pages/tasksPage/tasksPage";
import MiningPage from "./pages/miningPage/miningPage";
import ExchangePage from "./pages/exchangePage/exchangePage";
import ProfilePage from "./pages/profilePage/profilePage";
import FriendsPage from "./pages/friendsPage/friendsPage";
import NoTelegramNoPhone from "./components/NoTelegramNoPhone";

function App() {
  const [showPopup, setShowPopup] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [accessDenied, setAccessDenied] = useState(null);

  // Проверка доступа
  useEffect(() => {
    const checkAccess = () => {
      const tg = window?.Telegram?.WebApp;

      // Проверка Telegram
      if (!tg) {
        setAccessDenied("not-telegram");
        return;
      }

      // Проверка мобильного устройства
      const isMobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );

      // Дополнительная проверка по ширине экрана (менее 768px считается мобильным)
      const isMobileScreen = window.innerWidth < 768;

      if (!isMobile && !isMobileScreen) {
        setAccessDenied("not-mobile");
        return;
      }

      // Если все проверки пройдены
      setAccessDenied(null);
    };

    checkAccess();
  }, []);

  useEffect(() => {
    // Если доступ запрещен, не инициализируем Telegram WebApp
    if (accessDenied) return;

    const tg = window?.Telegram?.WebApp;
    if (!tg) return;

    // Инициализация Telegram WebApp
    tg.ready();

    // Получаем данные пользователя из Telegram
    const user = tg.initDataUnsafe?.user;
    if (user) {
      console.log("Telegram User Data:", {
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        id: user.id,
        language_code: user.language_code,
        is_premium: user.is_premium,
      });
    }

    // Настройка полноэкранного режима
    tg.expand(); // Раскрывает WebApp на полный экран
    tg.enableClosingConfirmation(); // Подтверждение закрытия
    tg.disableVerticalSwipes(); // Отключаем вертикальные свайпы для предотвращения случайного закрытия при скролле

    // Настройка цветовой схемы
    tg.setHeaderColor("#1a1a1a"); // Темный цвет заголовка
    tg.setBackgroundColor("#1a1a1a"); // Темный фон

    // Функция для применения высоты viewport
    const applyVh = () => {
      const h = tg.viewportStableHeight || tg.viewportHeight;
      if (h) {
        document.documentElement.style.setProperty(
          "--tg-viewport-height",
          `${h}px`
        );
        // Устанавливаем высоту для body чтобы обеспечить скролл
        document.body.style.height = `${h}px`;
        document.body.style.overflowY = "auto";
      }
    };

    applyVh();
    tg.onEvent("viewportChanged", applyVh);

    // Обработка изменения темы
    const handleThemeChange = () => {
      const theme = tg.colorScheme;
      document.documentElement.setAttribute("data-theme", theme);
    };

    handleThemeChange();
    tg.onEvent("themeChanged", handleThemeChange);

    return () => {
      tg.offEvent("viewportChanged", applyVh);
      tg.offEvent("themeChanged", handleThemeChange);
    };
  }, [accessDenied]);

  // Если доступ запрещен, показываем экран блокировки
  if (accessDenied) {
    return <NoTelegramNoPhone reason={accessDenied} />;
  }

  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Navigate to="/mining" replace />} />
        <Route path="/leaders" element={<LeadersPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route
          path="/mining"
          element={
            <MiningPage showPopup={showPopup} setShowPopup={setShowPopup} />
          }
        />
        <Route
          path="/exchange"
          element={<ExchangePage onInputFocus={setIsInputFocused} />}
        />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/friends" element={<FriendsPage />} />
      </Routes>
      <BottomNavigation showPopup={showPopup} isInputFocused={isInputFocused} />
    </div>
  );
}

export default App;
