import React, { useState, useEffect } from "react";
import styles from "./profilePage.module.scss";

const ProfilePage = () => {
  const [userPhoto, setUserPhoto] = useState("/profile/avatar.svg");
  const [userName, setUserName] = useState("user");

  useEffect(() => {
    const tg = window?.Telegram?.WebApp;

    if (tg) {
      tg.ready();
      const user = tg.initDataUnsafe?.user;

      if (user) {
        if (user.photo_url) {
          // Пытаемся получить фото в более высоком разрешении
          let photoUrl = user.photo_url;

          // Telegram иногда предоставляет URL с разными размерами
          // Пробуем заменить размер на больший (если есть паттерн /160/ на /640/)
          if (photoUrl.includes("/160/")) {
            photoUrl = photoUrl.replace("/160/", "/640/");
          } else if (photoUrl.includes("size=small")) {
            photoUrl = photoUrl.replace("size=small", "size=big");
          }

          setUserPhoto(photoUrl);
        }

        // Получаем имя пользователя
        const displayName = user.first_name || user.username || "user";
        setUserName(displayName);
      }
    }
  }, []);

  return (
    <div className={styles.profilePage}>
      <div className={styles.avatarSection}>
        <img src={userPhoto} alt="User Avatar" />

        <div className={styles.infoContainer}>
          <div className={styles.userName}>{userName}</div>

          <div className={styles.balanceSection}>
            <div className={styles.balanceLabel}>Балансы:</div>
            <div className={styles.balanceValues}>
              <div className={styles.balanceItem}>
                <img
                  src="/mine-icons/bitcoin.svg"
                  alt="bitcoin"
                  className={styles.balanceIcon}
                />
                <span className={styles.balanceNumber}>3280</span>
              </div>
              <div className={styles.balanceDivider}></div>
              <div className={styles.balanceItem}>
                <img
                  src="/mine-icons/energy.svg"
                  alt="energy"
                  className={styles.balanceIcon}
                />
                <span className={styles.balanceNumber}>12</span>
              </div>
            </div>
          </div>

          <button className={styles.agentButton}>
            <img
              src="/mine-icons/ai-agent.svg"
              alt="ai-agent"
              className={styles.agentIcon}
            />
            <span className={styles.agentText}>AI - agent активен</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g opacity="0.5">
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M8.00015 1.33337C4.31828 1.33337 1.3335 4.31812 1.3335 8.00003C1.3335 11.6819 4.31828 14.6667 8.00015 14.6667C11.6821 14.6667 14.6668 11.6819 14.6668 8.00003C14.6668 4.31812 11.6821 1.33337 8.00015 1.33337ZM8.83496 5.33337C8.83496 5.81675 8.48303 6.16672 8.00693 6.16672C7.51159 6.16672 7.16828 5.81672 7.16828 5.32412C7.16828 4.85069 7.52087 4.50006 8.00693 4.50006C8.48303 4.50006 8.83496 4.85069 8.83496 5.33337ZM7.33496 7.33337H8.66828V11.3334H7.33496V7.33337Z"
                  fill="white"
                />
              </g>
            </svg>
          </button>
        </div>
      </div>

      <div className={styles.infoSection}>
        <img
          src="/profile/shineProfile.svg"
          alt="shine"
          className={styles.shine}
        />
      </div>
    </div>
  );
};

export default ProfilePage;
