import React, { useEffect, useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
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
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === "/" || location.pathname === "") {
      navigate("/mining", { replace: true });
    }
  }, [location.pathname, navigate]);

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
