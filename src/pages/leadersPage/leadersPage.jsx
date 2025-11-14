import React, { useEffect, useState } from "react";
import styles from "./leadersPage.module.scss";

const LeadersPage = () => {
  // Данные лидеров (можно будет заменить на данные из API)
  // Порядок: второй, первый, третий (для отображения: слева, центр, справа)
  const leaders = [
    {
      id: 2,
      userName: "Max",
      avatar: "/friends/avatar.png",
      cover: "/friends/avatar.png",
      score: 2250,
      position: 2,
      place: 2,
      balanceBtc: 3280,
      balanceEnergy: 12,
      aiAgentActive: true,
      stats: [
        {
          icon: "/mine-icons/wallet.png",
          value: "210",
          label: "Найдено кошельков",
        },
        {
          icon: "/exchange/usdt.png",
          value: "31 $",
          label: "Сумма выводов",
        },
        {
          icon: "/mine-icons/concl.svg",
          value: "8",
          label: "Количество друзей",
        },
        {
          icon: "/mine-icons/bitcoin.svg",
          value: "412 000",
          label: "Добыто биткоинов",
        },
        {
          icon: "/mine-icons/bitcoin.svg",
          value: "3420",
          label: "Доход с друзей",
        },
        {
          icon: "/profile/ai.png",
          value: "95$",
          label: "Добыто ИИ-агентом",
        },
      ],
    },
    {
      id: 1,
      userName: "VLAD",
      avatar: "/friends/avatar.png",
      cover: "/friends/avatar.png",
      score: 2900,
      position: 1,
      place: 1,
      balanceBtc: 3280,
      balanceEnergy: 12,
      aiAgentActive: true,
      stats: [
        {
          icon: "/mine-icons/wallet.png",
          value: "193",
          label: "Найдено кошельков",
        },
        {
          icon: "/exchange/usdt.png",
          value: "27 $",
          label: "Сумма выводов",
        },
        {
          icon: "/mine-icons/concl.svg",
          value: "6",
          label: "Количество друзей",
        },
        {
          icon: "/mine-icons/bitcoin.svg",
          value: "365 000",
          label: "Добыто биткоинов",
        },
        {
          icon: "/mine-icons/bitcoin.svg",
          value: "3280",
          label: "Доход с друзей",
        },
        {
          icon: "/profile/ai.png",
          value: "89$",
          label: "Добыто ИИ-агентом",
        },
      ],
    },
    {
      id: 3,
      userName: "Damir ",
      avatar: "/friends/avatar.png",
      cover: "/friends/avatar.png",
      score: 1998,
      position: 3,
      place: 3,
      balanceBtc: 2990,
      balanceEnergy: 10,
      aiAgentActive: true,
      stats: [
        {
          icon: "/mine-icons/wallet.png",
          value: "168",
          label: "Найдено кошельков",
        },
        {
          icon: "/exchange/usdt.png",
          value: "21 $",
          label: "Сумма выводов",
        },
        {
          icon: "/mine-icons/concl.svg",
          value: "5",
          label: "Количество друзей",
        },
        {
          icon: "/mine-icons/bitcoin.svg",
          value: "289 500",
          label: "Добыто биткоинов",
        },
        {
          icon: "/mine-icons/bitcoin.svg",
          value: "2980",
          label: "Доход с друзей",
        },
        {
          icon: "/profile/ai.png",
          value: "72$",
          label: "Добыто ИИ-агентом",
        },
      ],
    },
  ];

  const otherLeaders = [
    {
      id: 4,
      userName: "Sergey",
      avatar: "/friends/avatar.png",
      cover: "/friends/avatar.png",
      btc: 1850,
      usd: "(92$)",
      place: 4,
      balanceBtc: 2850,
      balanceEnergy: 11,
      aiAgentActive: true,
      stats: [
        {
          icon: "/mine-icons/wallet.png",
          value: "180",
          label: "Найдено кошельков",
        },
        {
          icon: "/exchange/usdt.png",
          value: "24 $",
          label: "Сумма выводов",
        },
        {
          icon: "/mine-icons/concl.svg",
          value: "7",
          label: "Количество друзей",
        },
        {
          icon: "/mine-icons/bitcoin.svg",
          value: "255 000",
          label: "Добыто биткоинов",
        },
        {
          icon: "/mine-icons/bitcoin.svg",
          value: "2450",
          label: "Доход с друзей",
        },
        {
          icon: "/profile/ai.png",
          value: "64$",
          label: "Добыто ИИ-агентом",
        },
      ],
    },
    {
      id: 5,
      userName: "Anastasia",
      avatar: "/friends/avatar.png",
      cover: "/friends/avatar.png",
      btc: 1720,
      usd: "($86)",
      place: 5,
      balanceBtc: 2700,
      balanceEnergy: 9,
      aiAgentActive: true,
      stats: [
        {
          icon: "/mine-icons/wallet.png",
          value: "172",
          label: "Найдено кошельков",
        },
        {
          icon: "/exchange/usdt.png",
          value: "22 $",
          label: "Сумма выводов",
        },
        {
          icon: "/mine-icons/concl.svg",
          value: "6",
          label: "Количество друзей",
        },
        {
          icon: "/mine-icons/bitcoin.svg",
          value: "243 000",
          label: "Добыто биткоинов",
        },
        {
          icon: "/mine-icons/bitcoin.svg",
          value: "2320",
          label: "Доход с друзей",
        },
        {
          icon: "/profile/ai.png",
          value: "58$",
          label: "Добыто ИИ-агентом",
        },
      ],
    },
    {
      id: 6,
      userName: "Kirill",
      avatar: "/friends/avatar.png",
      cover: "/friends/avatar.png",
      btc: 1640,
      usd: "($82)",
      place: 6,
      balanceBtc: 2620,
      balanceEnergy: 8,
      aiAgentActive: false,
      stats: [
        {
          icon: "/mine-icons/wallet.png",
          value: "168",
          label: "Найдено кошельков",
        },
        {
          icon: "/exchange/usdt.png",
          value: "19 $",
          label: "Сумма выводов",
        },
        {
          icon: "/mine-icons/concl.svg",
          value: "4",
          label: "Количество друзей",
        },
        {
          icon: "/mine-icons/bitcoin.svg",
          value: "220 000",
          label: "Добыто биткоинов",
        },
        {
          icon: "/mine-icons/bitcoin.svg",
          value: "2180",
          label: "Доход с друзей",
        },
        {
          icon: "/profile/ai.png",
          value: "41$",
          label: "Добыто ИИ-агентом",
        },
      ],
    },
    {
      id: 7,
      userName: "Olga",
      avatar: "/friends/avatar.png",
      cover: "/friends/avatar.png",
      btc: 1580,
      usd: "($79)",
      place: 7,
      balanceBtc: 2540,
      balanceEnergy: 8,
      aiAgentActive: true,
      stats: [
        {
          icon: "/mine-icons/wallet.png",
          value: "150",
          label: "Найдено кошельков",
        },
        {
          icon: "/exchange/usdt.png",
          value: "18 $",
          label: "Сумма выводов",
        },
        {
          icon: "/mine-icons/concl.svg",
          value: "6",
          label: "Количество друзей",
        },
        {
          icon: "/mine-icons/bitcoin.svg",
          value: "204 000",
          label: "Добыто биткоинов",
        },
        {
          icon: "/mine-icons/bitcoin.svg",
          value: "2050",
          label: "Доход с друзей",
        },
        {
          icon: "/profile/ai.png",
          value: "54$",
          label: "Добыто ИИ-агентом",
        },
      ],
    },
    {
      id: 8,
      userName: "Andrey",
      avatar: "/friends/avatar.png",
      cover: "/friends/avatar.png",
      btc: 1475,
      usd: "($73)",
      place: 8,
      balanceBtc: 2460,
      balanceEnergy: 7,
      aiAgentActive: true,
      stats: [
        {
          icon: "/mine-icons/wallet.png",
          value: "142",
          label: "Найдено кошельков",
        },
        {
          icon: "/exchange/usdt.png",
          value: "16 $",
          label: "Сумма выводов",
        },
        {
          icon: "/mine-icons/concl.svg",
          value: "4",
          label: "Количество друзей",
        },
        {
          icon: "/mine-icons/bitcoin.svg",
          value: "198 000",
          label: "Добыто биткоинов",
        },
        {
          icon: "/mine-icons/bitcoin.svg",
          value: "1960",
          label: "Доход с друзей",
        },
        {
          icon: "/profile/ai.png",
          value: "47$",
          label: "Добыто ИИ-агентом",
        },
      ],
    },
    {
      id: 9,
      userName: "Irina",
      avatar: "/friends/avatar.png",
      cover: "/friends/avatar.png",
      btc: 1405,
      usd: "($70)",
      place: 9,
      balanceBtc: 2390,
      balanceEnergy: 7,
      aiAgentActive: false,
      stats: [
        {
          icon: "/mine-icons/wallet.png",
          value: "135",
          label: "Найдено кошельков",
        },
        {
          icon: "/exchange/usdt.png",
          value: "15 $",
          label: "Сумма выводов",
        },
        {
          icon: "/mine-icons/concl.svg",
          value: "5",
          label: "Количество друзей",
        },
        {
          icon: "/mine-icons/bitcoin.svg",
          value: "188 000",
          label: "Добыто биткоинов",
        },
        {
          icon: "/mine-icons/bitcoin.svg",
          value: "1885",
          label: "Доход с друзей",
        },
        {
          icon: "/profile/ai.png",
          value: "39$",
          label: "Добыто ИИ-агентом",
        },
      ],
    },
    {
      id: 10,
      userName: "Dmitry",
      avatar: "/friends/avatar.png",
      cover: "/friends/avatar.png",
      btc: 1360,
      usd: "($68)",
      place: 10,
      balanceBtc: 2310,
      balanceEnergy: 6,
      aiAgentActive: true,
      stats: [
        {
          icon: "/mine-icons/wallet.png",
          value: "128",
          label: "Найдено кошельков",
        },
        {
          icon: "/exchange/usdt.png",
          value: "14 $",
          label: "Сумма выводов",
        },
        {
          icon: "/mine-icons/concl.svg",
          value: "4",
          label: "Количество друзей",
        },
        {
          icon: "/mine-icons/bitcoin.svg",
          value: "179 000",
          label: "Добыто биткоинов",
        },
        {
          icon: "/mine-icons/bitcoin.svg",
          value: "1800",
          label: "Доход с друзей",
        },
        {
          icon: "/profile/ai.png",
          value: "36$",
          label: "Добыто ИИ-агентом",
        },
      ],
    },
  ];

  const [activeTab, setActiveTab] = useState("month");
  const [selectedLeader, setSelectedLeader] = useState(null);

  const handleTabClick = (tab) => () => setActiveTab(tab);
  const handleLeaderClick = (leader) => () => setSelectedLeader(leader);
  const handleLeaderKeyDown = (leader) => (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setSelectedLeader(leader);
    }
  };
  const closeModal = () => setSelectedLeader(null);

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
          <div className={styles.controlsLabel}>Твое место: 666</div>
        </div>
        <div className={styles.leadersList}>
          <div className={styles.listContainer}>
            {otherLeaders.map((leader) => (
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
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div
            className={styles.modalContent}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className={styles.modalClose}
              onClick={closeModal}
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
              <img src="/profile/avatar.svg" alt={selectedLeader.userName} />
              <div className={styles.modalGradientTop}></div>
              <div className={styles.modalGradientBottom}></div>
              <div className={styles.modalHeaderInfo}>
                <div className={styles.modalName}>
                  {selectedLeader.userName}
                </div>
                <div className={styles.modalBalances}>
                  <span className={styles.modalBalanceLabel}>Балансы:</span>
                  <div className={styles.modalBalanceItem}>
                    <img
                      src="/mine-icons/bitcoin.svg"
                      alt="btc"
                      className={styles.modalBalanceIcon}
                    />
                    <span className={styles.modalBalanceValue}>
                      {selectedLeader.balanceBtc}
                    </span>
                  </div>
                  <div className={styles.modalBalanceDivider}></div>
                  <div className={styles.modalBalanceItem}>
                    <img
                      src="/mine-icons/energy.svg"
                      alt="energy"
                      className={styles.modalBalanceIcon}
                    />
                    <span className={styles.modalBalanceValue}>
                      {selectedLeader.balanceEnergy}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className={`${styles.modalAgentButton} ${
                    selectedLeader.aiAgentActive
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
                    AI - agent{" "}
                    {selectedLeader.aiAgentActive ? "активен" : "не активен"}
                  </span>
                  <svg
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
              <div className={styles.modalPlace}>
                Место в списке: {selectedLeader.place}
              </div>

              <div className={styles.modalStatsTitle}>Статистика игрока</div>
              <div className={styles.modalStatsGrid}>
                {selectedLeader.stats.map((stat, index) => (
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
      )}
    </div>
  );
};

export default LeadersPage;
