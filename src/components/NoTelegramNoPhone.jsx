import React from "react";
import styles from "./NoTelegramNoPhone.module.scss";

const NoTelegramNoPhone = ({ reason }) => {
  const getMessage = () => {
    if (reason === "not-telegram") {
      return {
        title: "Приложение доступно только в Telegram",
        description:
          "Откройте это приложение через Telegram на мобильном устройстве",
      };
    } else if (reason === "not-mobile") {
      return {
        title: "Приложение доступно только на мобильных устройствах",
        description:
          "Пожалуйста, откройте это приложение на смартфоне или планшете",
      };
    }
    return {
      title: "Доступ ограничен",
      description:
        "Это приложение работает только в Telegram на мобильных устройствах",
    };
  };

  const message = getMessage();

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.icon}>
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
              fill="currentColor"
            />
          </svg>
        </div>
        <h1 className={styles.title}>{message.title}</h1>
        <p className={styles.description}>{message.description}</p>
      </div>
    </div>
  );
};

export default NoTelegramNoPhone;
