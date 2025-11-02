import React, { useEffect } from "react";
import styles from "./FoundPopup.module.scss";

const FoundPopup = ({
  onClose,
  walletAddress = "0x4f3a9b2Sas...",
  collectedAmount = 257,
}) => {
  useEffect(() => {
    const preventZoom = (e) => {
      if (e.touches && e.touches.length > 1) {
        e.preventDefault();
      }
    };

    document.addEventListener("touchmove", preventZoom, { passive: false });
    document.addEventListener("touchend", preventZoom, { passive: false });

    return () => {
      document.removeEventListener("touchmove", preventZoom);
      document.removeEventListener("touchend", preventZoom);
    };
  }, []);

  return (
    <div className={styles.popupOverlay} onClick={onClose}>
      <div className={styles.popupContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.foundCard}>
          <div className={styles.imageContainer}>
            <img
              src="/mine-icons/found.png"
              alt="found"
              className={styles.foundImage}
            />
          </div>

          <div className={styles.foundTitle}>Найдено!</div>

          <div className={styles.infoContainer}>
            <div className={styles.walletInfo}>
              <div className={styles.walletIcon}>
                <img
                  src="/mine-icons/wallet.png"
                  height={22}
                  width={22}
                  alt="wallet"
                />
              </div>
              <span className={styles.walletAddress}>{walletAddress}</span>
            </div>

            <div className={styles.balanceInfo}>
              <div className={styles.balanceIcon}>
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 22 22"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M16.431 7.44117C16.2064 5.4838 14.5246 4.86241 12.395 4.707L12.3514 2L10.7105 2.0289L10.7542 4.66879L9.44823 4.70522L9.40764 2.04532L7.767 2.07522L7.81199 4.79143L6.77208 4.82309L6.76943 4.81316L4.5 4.85101L4.53159 6.61879C4.53159 6.61879 5.74226 6.58148 5.72663 6.59422C6.39185 6.58815 6.60898 6.97145 6.67711 7.29916L6.73764 10.3956L6.91164 10.4061L6.73352 10.4159L6.80781 14.7482C6.78703 14.9562 6.66791 15.295 6.20093 15.2955C6.22608 15.3185 5.01741 15.3276 5.01741 15.3276L4.72213 17.3008L6.85709 17.262L8.02789 17.2536L8.07141 20L9.71179 19.9691L9.65891 17.255L10.9799 17.2433L11.0238 19.9513L12.6645 19.9214L12.6121 17.1774C15.3702 16.9703 17.293 16.2412 17.4844 13.623C17.6383 11.5154 16.6419 10.6024 15.068 10.2395C16.0142 9.74431 16.5906 8.86769 16.4222 7.44357L16.431 7.44117ZM14.238 13.3571C14.2784 15.4121 10.7791 15.2326 9.67182 15.2612L9.60884 11.6191C10.7204 11.6064 14.2016 11.2136 14.2354 13.3471L14.238 13.3571ZM13.3812 8.2361C13.4193 10.1001 10.4963 9.93746 9.57652 9.95585L9.51805 6.65649C10.448 6.63644 13.3509 6.29438 13.3812 8.2361Z"
                    fill="#5264CE"
                  />
                </svg>
              </div>
              <span className={styles.balanceText}>
                Получилось собрать {collectedAmount}
              </span>
              <img
                src="/mine-icons/bitcoin.svg"
                alt="bitcoin"
                className={styles.balanceIconEnd}
              />
            </div>
          </div>

          <button className={styles.getButton} onClick={onClose}>
            <span className={styles.buttonText}>Получить</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FoundPopup;
