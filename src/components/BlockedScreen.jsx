import React from "react";
import styles from "./BlockedScreen.module.scss";

const BlockedScreen = () => {
  return (
    <div className={styles.blockedScreen}>
      <div className={styles.content}>
        <div className={styles.iconContainer}>
          <svg
            width="80"
            height="80"
            viewBox="0 0 80 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="40" cy="40" r="35" stroke="#FF4444" strokeWidth="4" />
            <path
              d="M25 25 L55 55 M55 25 L25 55"
              stroke="#FF4444"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <h1 className={styles.title}>Доступ заблокирован</h1>
        <p className={styles.message}>
          Вас заблокировали в Telegram Mini App
        </p>

        <div className={styles.details}>
          <p>Если вы считаете, что это ошибка,</p>
          <p>свяжитесь с поддержкой</p>
        </div>
      </div>
    </div>
  );
};

export default BlockedScreen;

