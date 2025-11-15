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
import BlockedScreen from "./components/BlockedScreen";
import { loginUser } from "./services/api";

function App() {
  const [showPopup, setShowPopup] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isTaskPopupOpen, setIsTaskPopupOpen] = useState(false);
  const [isLeaderPopupOpen, setIsLeaderPopupOpen] = useState(false);
  const [accessDenied, setAccessDenied] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    const checkAccess = () => {
      const tg = window?.Telegram?.WebApp;

      if (!tg) {
        setAccessDenied("not-telegram");
        return;
      }

      const isMobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );

      const isMobileScreen = window.innerWidth < 768;

      if (!isMobile && !isMobileScreen) {
        setAccessDenied("not-mobile");
        return;
      }

      setAccessDenied(null);
    };

    checkAccess();
  }, []);

  // Логин пользователя при загрузке приложения
  useEffect(() => {
    const performLogin = async () => {
      try {
        console.log("🚀 Начало авторизации...");
        const response = await loginUser();

        console.log("✅ Авторизация успешна:", response);
        setUserData(response);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("❌ Ошибка авторизации:", error);

        // Проверяем, является ли это ошибкой 401 (заблокирован)
        if (error.isBlocked || error.response?.status === 401) {
          console.log("🚫 Пользователь заблокирован (401)");
          setIsBlocked(true);
        } else {
          setIsAuthenticated(false);
        }
      } finally {
        setAuthLoading(false);
      }
    };

    performLogin();
  }, []);

  useEffect(() => {
    if (accessDenied) return;

    const tg = window?.Telegram?.WebApp;
    if (!tg) return;

    tg.ready();

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

    tg.expand();
    tg.enableClosingConfirmation();
    tg.disableVerticalSwipes();

    tg.setHeaderColor("#1a1a1a");
    tg.setBackgroundColor("#1a1a1a");

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
    tg.onEvent("viewportChanged", applyVh);

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

  // if (accessDenied) {
  //   return <NoTelegramNoPhone reason={accessDenied} />;
  // }

  // Если пользователь заблокирован - показываем экран блокировки
  if (isBlocked) {
    return <BlockedScreen />;
  }

  // Показываем пустой экран во время авторизации
  if (authLoading) {
    return (
      <div
        className="app"
        style={{
          width: "100%",
          height: "100vh",
          background: "#1a1a1a",
        }}
      />
    );
  }

  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Navigate to="/mining" replace />} />
        <Route
          path="/leaders"
          element={<LeadersPage onPopupStateChange={setIsLeaderPopupOpen} />}
        />
        <Route
          path="/tasks"
          element={<TasksPage onPopupStateChange={setIsTaskPopupOpen} />}
        />
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
        <Route path="/profile" element={<ProfilePage userData={userData} />} />
        <Route path="/friends" element={<FriendsPage />} />
      </Routes>
      <BottomNavigation
        showPopup={showPopup}
        isInputFocused={isInputFocused}
        isTaskPopupOpen={isTaskPopupOpen}
        isLeaderPopupOpen={isLeaderPopupOpen}
      />
    </div>
  );
}

export default App;
