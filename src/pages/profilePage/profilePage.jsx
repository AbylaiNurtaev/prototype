import React, { useState, useEffect } from "react";
import styles from "./profilePage.module.scss";

const ProfilePage = () => {
  const [userPhoto, setUserPhoto] = useState("/profile/avatar.svg");

  useEffect(() => {
    const tg = window?.Telegram?.WebApp;

    if (tg) {
      tg.ready();
      const user = tg.initDataUnsafe?.user;

      if (user && user.photo_url) {
        setUserPhoto(user.photo_url);
      }
    }
  }, []);

  return (
    <div className={styles.profilePage}>
      <div className={styles.avatarSection}>
        <img src={userPhoto} alt="User Avatar" />
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
