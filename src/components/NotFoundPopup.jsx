import React from "react";
import styles from "./NotFoundPopup.module.scss";

const NotFoundPopup = ({ onClose, onRetry }) => {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
        <img
          src="/mine-icons/popupbgfail.png"
          alt="Not Found"
          className={styles.failImage}
        />

        <h2 className={styles.title}>Не найдено</h2>

        <button className={styles.retryButton} onClick={onRetry}>
          Попробовать еще
        </button>
      </div>
    </div>
  );
};

export default NotFoundPopup;
