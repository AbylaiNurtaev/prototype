import React, { useEffect } from "react";
import styles from "./LeaderPopup.module.scss";

const LeaderPopup = ({ leader, onClose }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  if (!leader) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
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
            src="/profile/avatar.svg"
            alt={leader.userName}
          />
          <div className={styles.modalHeaderInfo}>
            <div className={styles.modalName}>{leader.userName}</div>
            <div className={styles.modalBalances}>
              <span className={styles.modalBalanceLabel}>Балансы:</span>
              <div className={styles.modalBalanceItem}>
                <img
                  src="/mine-icons/bitcoin.svg"
                  alt="btc"
                  className={styles.modalBalanceIcon}
                />
                <span className={styles.modalBalanceValue}>
                  {leader.balanceBtc}
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
                  {leader.balanceEnergy}
                </span>
              </div>
            </div>
            <button
              type="button"
              className={`${styles.modalAgentButton} ${
                leader.aiAgentActive
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
                AI - agent {leader.aiAgentActive ? "активен" : "не активен"}
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
          <div className={styles.modalPlace}>
            Место в списке: {leader.place}
          </div>

          <div className={styles.modalStatsTitle}>Статистика игрока</div>
          <div className={styles.modalStatsGrid}>
            {leader.stats.map((stat, index) => (
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
  );
};

export default LeaderPopup;
