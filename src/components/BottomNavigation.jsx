import React, { useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./BottomNavigation.module.scss";

const BottomNavigation = ({ showPopup, isInputFocused, isTaskPopupOpen, isLeaderPopupOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const tabs = useMemo(
    () => [
      {
        id: "leaders",
        path: "/leaders",
        label: "Лидеры",
        icon: "/nav-icons/лидеры.png",
      },
      {
        id: "tasks",
        path: "/tasks",
        label: "Задания",
        icon: "/nav-icons/задания.png",
      },
      {
        id: "mining",
        path: "/mining",
        label: "Майнинг",
        icon: "/nav-icons/mining.png",
      },
      {
        id: "exchange",
        path: "/exchange",
        label: "Обмен",
        icon: "/nav-icons/обмен.png",
      },
      {
        id: "more",
        path: null,
        label: "Еще",
        icon: "/nav-icons/еще.svg",
      },
    ],
    []
  );

  const handleTabClick = (tab) => {
    if (tab.id === "more") {
      setIsMoreOpen((prev) => !prev);
      return;
    }
    setIsMoreOpen(false);
    if (tab.path) {
      navigate(tab.path);
    }
  };

  const getActiveTab = () => {
    if (isMoreOpen) {
      return "more";
    }
    const currentTab = tabs.find((tab) => tab.path === location.pathname);
    if (currentTab) {
      return currentTab.id;
    }
    if (location.pathname === "/profile" || location.pathname === "/friends") {
      return "more";
    }
    return null;
  };

  const activeTab = getActiveTab();

  return (
    <div
      className={`${styles.bottomNavigation} ${
        showPopup ? styles.blurred : ""
      } ${isInputFocused || isTaskPopupOpen || isLeaderPopupOpen ? styles.hidden : ""}`}
    >
      <div className={styles.navContent}>
        {tabs.map((tab) => {
          const isMore = tab.id === "more";
          const isActive = isMoreOpen
            ? isMore
            : activeTab === tab.id ||
              (isMore &&
                (location.pathname === "/profile" ||
                  location.pathname === "/friends"));

          return (
            <div
              key={tab.id}
              className={`${styles.navItem} ${isActive ? styles.active : ""}`}
              onClick={() => handleTabClick(tab)}
            >
              <div className={styles.navIcon}>
                <img src={tab.icon} alt={tab.label} />
              </div>
              <span className={styles.navLabel}>{tab.label}</span>
            </div>
          );
        })}
      </div>

      {isMoreOpen && (
        <div className={styles.moreMenu}>
          <button
            className={`${styles.moreItem} ${
              location.pathname === "/profile" ? styles.active : ""
            }`}
            onClick={() => {
              setIsMoreOpen(false);
              navigate("/profile");
            }}
          >
            <img
              className={styles.moreIcon}
              src="/nav-icons/profile.png"
              alt="Профиль"
            />
            <span className={styles.moreLabel}>Профиль</span>
          </button>
          <button
            className={`${styles.moreItem} ${
              location.pathname === "/friends" ? styles.active : ""
            }`}
            onClick={() => {
              setIsMoreOpen(false);
              navigate("/friends");
            }}
          >
            <img
              className={styles.moreIcon}
              src="/nav-icons/friends.png"
              alt="Друзья"
            />
            <span className={styles.moreLabel}>Друзья</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default BottomNavigation;
