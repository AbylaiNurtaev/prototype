import React, { useEffect, useState } from "react";
import styles from "./leadersPage.module.scss";
import LeaderPopup from "../../components/LeaderPopup";
import { getLeaders } from "../../services/api";

const LeadersPage = ({ onPopupStateChange }) => {
  const [activeTab, setActiveTab] = useState("month");
  const [selectedLeader, setSelectedLeader] = useState(null);
  const [leaders, setLeaders] = useState([]);
  const [userInfo, setUserInfo] = useState(null);

  const handleTabClick = (tab) => () => setActiveTab(tab);
  const handleLeaderClick = (leader) => () => {
    setSelectedLeader(leader);
    if (onPopupStateChange) {
      onPopupStateChange(true);
    }
  };
  const handleLeaderKeyDown = (leader) => (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setSelectedLeader(leader);
      if (onPopupStateChange) {
        onPopupStateChange(true);
      }
    }
  };
  const closeModal = () => {
    setSelectedLeader(null);
    if (onPopupStateChange) {
      onPopupStateChange(false);
    }
  };

  useEffect(() => {
    if (!selectedLeader) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedLeader]);

  useEffect(() => {
    const filterParam = activeTab === "month" ? "month" : "all";

    const fetchLeaders = async () => {
      try {
        console.log("📡 [LeadersPage] Загружаем таблицу лидеров", {
          filter: filterParam,
        });
        const response = await getLeaders(filterParam);
        console.log("📈 [LeadersPage] Ответ от API /leaders:", response);

        const apiLeaders = response?.leaders || [];

        const mappedLeaders = apiLeaders.map((item, index) => ({
          id: item.user_id,
          userName: item.name,
          avatar: item.photo_url || "/friends/avatar.png",
          cover: item.photo_url || "/friends/avatar.png",
          score: item.amount,
          btc: item.amount,
          usd: "",
          place: index + 1,
          position: index + 1,
          balanceBtc: item.amount,
          balanceEnergy: 0,
          aiAgentActive: false,
          stats: [],
        }));

        setLeaders(mappedLeaders);
        setUserInfo(response?.user || null);
      } catch (error) {
        console.error("❌ [LeadersPage] Ошибка загрузки лидеров:", error);
      }
    };

    fetchLeaders();
  }, [activeTab]);

  const topThree = leaders.slice(0, 3);
  const orderedTopThree =
    topThree.length === 3
      ? [...topThree].sort((a, b) => {
          const order = [2, 1, 3];
          return order.indexOf(a.position) - order.indexOf(b.position);
        })
      : topThree;

  return (
    <div className={styles.leadersPage}>
      <img
        src="/profile/shineProfile.png"
        alt="shine"
        className={styles.shine}
      />

      <div className={styles.pageContent}>
        <div className={styles.prototypeText}>prototype</div>
        <div className={styles.banner}>
          <img
            src="/leaders/bgbanner.svg"
            alt="banner background"
            className={styles.bannerBg}
          />
          <div className={styles.leadersContainer}>
            {orderedTopThree.map((leader) => (
              <div
                key={leader.id}
                className={styles.leaderCard}
                role="button"
                tabIndex={0}
                onClick={handleLeaderClick(leader)}
                onKeyDown={handleLeaderKeyDown(leader)}
              >
                <div className={styles.avatarContainer}>
                  <div
                    className={`${styles.avatarWrapper} ${
                      leader.position === 1
                        ? styles.firstPlace
                        : leader.position === 2
                        ? styles.secondPlace
                        : styles.thirdPlace
                    }`}
                  >
                    <img
                      src={leader.avatar}
                      alt={leader.userName}
                      className={styles.avatar}
                    />
                  </div>
                  <div
                    className={`${styles.positionBadge} ${
                      leader.position === 1
                        ? styles.firstPlaceBadge
                        : leader.position === 2
                        ? styles.secondPlaceBadge
                        : styles.thirdPlaceBadge
                    }`}
                  >
                    {leader.position}
                  </div>
                </div>
                <div className={styles.leaderInfo}>
                  <div className={styles.leaderName}>{leader.userName}</div>
                  <div className={styles.leaderScore}>
                    <img
                      src="/mine-icons/bitcoin.svg"
                      alt="bitcoin"
                      className={styles.bitcoinIcon}
                    />
                    {leader.score}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.leadersTitle}>Таблица лидеров</div>
        <div className={styles.controlsRow}>
          <div className={styles.controlButtons}>
            <button
              type="button"
              onClick={handleTabClick("month")}
              className={`${styles.controlButton} ${styles.monthButton} ${
                activeTab === "month"
                  ? styles.controlButtonActive
                  : styles.controlButtonInactive
              }`}
            >
              Месяц
            </button>
            <button
              type="button"
              onClick={handleTabClick("allTime")}
              className={`${styles.controlButton} ${styles.allTimeButton} ${
                activeTab === "allTime"
                  ? styles.controlButtonActive
                  : styles.controlButtonInactive
              }`}
            >
              Все время
            </button>
          </div>
          <div className={styles.controlsLabel}>
            Твое место: {userInfo?.position ?? "—"}
          </div>
        </div>
        <div className={styles.leadersList}>
          <div className={styles.listContainer}>
            {leaders.slice(3).map((leader) => (
              <div
                key={leader.id}
                className={styles.listItem}
                role="button"
                tabIndex={0}
                onClick={handleLeaderClick(leader)}
                onKeyDown={handleLeaderKeyDown(leader)}
              >
                <div className={styles.rank}>{leader.place}</div>
                <div className={styles.listNameContainer}>
                  <img
                    className={styles.listAvatar}
                    src={leader.avatar}
                    alt={leader.userName}
                  />
                  <div className={styles.listName}>{leader.userName}</div>
                </div>
                <div className={styles.listBtcContainer}>
                  <img src="/mine-icons/bitcoin.svg" alt="btc" />
                  <span>{leader.btc}</span>
                  <p className={styles.listBtcText}>{leader.usd}</p>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M5.5 11.854H12V5.354H11V10.147L4.854 4L4.146 4.708L10.293 10.854H5.5V11.854Z"
                      fill="white"
                    />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {selectedLeader && (
        <LeaderPopup leader={selectedLeader} onClose={closeModal} />
      )}
    </div>
  );
};

export default LeadersPage;
