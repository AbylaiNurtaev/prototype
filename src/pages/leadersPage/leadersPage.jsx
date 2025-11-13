import React, { useState } from "react";
import styles from "./leadersPage.module.scss";

const LeadersPage = () => {
  // Данные лидеров (можно будет заменить на данные из API)
  // Порядок: второй, первый, третий (для отображения: слева, центр, справа)
  const leaders = [
    {
      id: 2,
      userName: "Max",
      avatar: "/friends/avatar.png",
      score: 2250,
      position: 2,
    },
    {
      id: 1,
      userName: "VLAD",
      avatar: "/friends/avatar.png",
      score: 2900,
      position: 1,
    },
    {
      id: 3,
      userName: "Damir",
      avatar: "/friends/avatar.png",
      score: 1998,
      position: 3,
    },
  ];

  const otherLeaders = [
    {
      id: 4,
      userName: "Sergey",
      avatar: "/friends/avatar.png",
      btc: 1850,
      usd: "($92)",
    },
    {
      id: 5,
      userName: "Anastasia",
      avatar: "/friends/avatar.png",
      btc: 1720,
      usd: "($86)",
    },
    {
      id: 6,
      userName: "Kirill",
      avatar: "/friends/avatar.png",
      btc: 1640,
      usd: "($82)",
    },
    {
      id: 7,
      userName: "Olga",
      avatar: "/friends/avatar.png",
      btc: 1580,
      usd: "($79)",
    },
    {
      id: 8,
      userName: "Andrey",
      avatar: "/friends/avatar.png",
      btc: 1475,
      usd: "($73)",
    },
    {
      id: 9,
      userName: "Irina",
      avatar: "/friends/avatar.png",
      btc: 1405,
      usd: "($70)",
    },
    {
      id: 10,
      userName: "Dmitry",
      avatar: "/friends/avatar.png",
      btc: 1360,
      usd: "($68)",
    },
  ];

  const [activeTab, setActiveTab] = useState("month");

  const handleTabClick = (tab) => () => setActiveTab(tab);

  return (
    <div className={styles.leadersPage}>
      <img
        src="/profile/shineProfile.svg"
        alt="shine"
        className={styles.shine}
      />

      <div className={styles.pageContent}>
        <div className={styles.prototypeText}>prototype</div>
        <div className={styles.banner}>
          <img
            src="/leaders/bgbanner.png"
            alt="banner background"
            className={styles.bannerBg}
          />
          <div className={styles.leadersContainer}>
            {leaders.map((leader) => (
              <div key={leader.id} className={styles.leaderCard}>
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
                      alt={leader.name}
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
          <div className={styles.controlsLabel}>Твое место: 666</div>
        </div>
        <div className={styles.leadersList}>
          <div className={styles.listContainer}>
            {otherLeaders.map((leader) => (
              <div key={leader.id} className={styles.listItem}>
                <div className={styles.rank}>{leader.id}</div>
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
    </div>
  );
};

export default LeadersPage;
