import React, { useEffect, useState } from "react";
import styles from "./LeaderPopup.module.scss";
import { getUserInfo } from "../services/api";

const FriendPopup = ({ friend, onClose }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  // Загрузка информации о друге через API
  useEffect(() => {
    const fetchFriendInfo = async () => {
      if (!friend?.user_id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        console.log(`👤 [FriendPopup] Загружаем информацию о друге ${friend.user_id}`);
        const info = await getUserInfo(friend.user_id);
        console.log(`✅ [FriendPopup] Информация о друге получена:`, info);

        if (info) {
          setUserInfo(info);
        }
      } catch (error) {
        console.error(
          `❌ [FriendPopup] Ошибка загрузки информации о друге:`,
          error
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchFriendInfo();
  }, [friend?.user_id]);

  if (!friend) return null;

  // Используем данные из API, если они загружены, иначе используем данные из friend
  const displayFriend = userInfo
    ? {
        ...friend,
        name: userInfo.name || userInfo.username || userInfo.first_name || friend.name,
        photo_url: userInfo.photo_url || friend.photo_url,
        balanceBtc: userInfo.earned_coins ?? friend.amount,
        balanceEnergy: userInfo.balance_energy || userInfo.wallet?.light || 0,
        aiAgentActive: userInfo.ai_agent_active !== undefined ? userInfo.ai_agent_active : false,
        // Данные статистики из API
        successful_consoles: userInfo.successful_consoles,
        withdraw_sum: userInfo.withdraw_sum,
        friends_count: userInfo.friends_count,
        earned_coins: userInfo.earned_coins,
      }
    : {
        ...friend,
        name: friend.name || "Неизвестный",
        photo_url: friend.photo_url || "/profile/avatar.svg",
        balanceBtc: friend.amount || 0,
        balanceEnergy: 0,
        aiAgentActive: false,
      };

  const placeholderStats = [
    {
      icon: "/mine-icons/wallet.png",
      value: displayFriend.successful_consoles ?? "—",
      label: "Найдено кошельков",
    },
    {
      icon: "/exchange/usdt.png",
      value: displayFriend.withdraw_sum ?? "—",
      label: "Сумма выводов",
    },
    {
      icon: "/mine-icons/friends.svg",
      value: displayFriend.friends_count ?? "—",
      label: "Количество друзей",
    },
    {
      icon: "/mine-icons/bitcoin.svg",
      value: displayFriend.earned_coins ?? displayFriend.balanceBtc ?? "—",
      label: "Добыто биткоинов",
    },
    {
      icon: "/mine-icons/friends-income.svg",
      value: "—",
      label: "Доход с друзей",
    },
    {
      icon: "/profile/ai.png",
      value: "—",
      label: "Добыто ИИ-агентом",
    },
  ];

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <img
        src="/profile/shineProfile.png"
        alt="shine"
        className={styles.shine}
      />
      <div className={styles.modalScrollContainer}>
        <div
          className={styles.modalContent}
          onClick={(event) => event.stopPropagation()}
        >
        <button
          type="button"
          className={styles.modalClose}
          onClick={onClose}
          aria-label="Закрыть"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 4L4 12"
              stroke="#fff"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M4 4L12 12"
              stroke="#fff"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <div className={styles.modalHeader}>
          <img
            className={styles.modalHeaderImage}
            src={displayFriend.photo_url || "/profile/avatar.svg"}
            alt={displayFriend.name}
          />
          <div className={styles.modalHeaderInfo}>
            <div className={styles.modalName}>{displayFriend.name}</div>
            <div className={styles.modalBalances}>
              <span className={styles.modalBalanceLabel}>Балансы:</span>
              <div className={styles.modalBalanceItem}>
                <img
                  src="/mine-icons/bitcoin.svg"
                  alt="btc"
                  className={styles.modalBalanceIcon}
                />
                <span className={styles.modalBalanceValue}>
                  {displayFriend.earned_coins ?? displayFriend.balanceBtc}
                </span>
              </div>
              <div className={styles.modalBalanceDivider}></div>
              <div className={styles.modalBalanceItem}>
                <img
                  src="/mine-icons/energy.png"
                  alt="energy"
                  className={styles.modalBalanceIcon}
                />
                <span className={styles.modalBalanceValue}>
                  {displayFriend.balanceEnergy}
                </span>
              </div>
            </div>
            <button
              type="button"
              className={`${styles.modalAgentButton} ${
                displayFriend.aiAgentActive
                  ? styles.modalAgentButtonActive
                  : styles.modalAgentButtonInactive
              }`}
            >
              <img
                src="/mine-icons/ai-agent.svg"
                alt="ai-agent"
                className={styles.modalAgentIcon}
              />
              <span className={styles.modalAgentText}>
                AI - agent {displayFriend.aiAgentActive ? "активен" : "не активен"}
              </span>
              <svg
                className={styles.modalAgentInfoIcon}
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g opacity="0.5">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M8.00015 1.33337C4.31828 1.33337 1.3335 4.31812 1.3335 8.00003C1.3335 11.6819 4.31828 14.6667 8.00015 14.6667C11.6821 14.6667 14.6668 11.6819 14.6668 8.00003C14.6668 4.31812 11.6821 1.33337 8.00015 1.33337ZM8.83496 5.33337C8.83496 5.81675 8.48303 6.16672 8.00693 6.16672C7.51159 6.16672 7.16828 5.81672 7.16828 5.32412C7.16828 4.85069 7.52087 4.50006 8.00693 4.50006C8.48303 4.50006 8.83496 4.85069 8.83496 5.33337ZM7.33496 7.33337H8.66828V11.3334H7.33496V7.33337Z"
                    fill="white"
                  />
                </g>
              </svg>
            </button>
          </div>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.modalStatsTitle}>Статистика игрока</div>
          <div className={styles.modalStatsGrid}>
            {placeholderStats.map((stat, index) => (
              <div key={index} className={styles.modalStatCard}>
                <div className={styles.modalStatIcon}>
                  <img src={stat.icon} alt="" />
                </div>
                <div className={styles.modalStatContent}>
                  <div className={styles.modalStatValue}>{stat.value}</div>
                  <div className={styles.modalStatLabel}>{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default FriendPopup;

