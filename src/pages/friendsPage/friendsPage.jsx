import React, { useState } from "react";
import styles from "./friendsPage.module.scss";
import ToastNotification from "../../components/ToastNotification";

const FriendsPage = () => {
  const [showToast, setShowToast] = useState(false);
  const [isButtonDark, setIsButtonDark] = useState(false);

  const handleCopyClick = () => {
    // Копирование ссылки (можете добавить реальную логику копирования)
    const linkToCopy = window.location.href;
    navigator.clipboard.writeText(linkToCopy);

    // Затемнение кнопки на секунду
    setIsButtonDark(true);
    setTimeout(() => {
      setIsButtonDark(false);
    }, 1000);

    // Показ уведомления
    setShowToast(true);
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageContent}>
        <div className={styles.inviteContainer}>
          <div className={styles.inviteButton}>Пригласить друга</div>
          <div
            className={`${styles.copyButton} ${
              isButtonDark ? styles.copyButtonDark : ""
            }`}
            onClick={handleCopyClick}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15.24 2H11.346C9.582 2 8.184 2 7.091 2.148C5.965 2.3 5.054 2.62 4.336 3.341C3.617 4.062 3.298 4.977 3.147 6.107C3 7.205 3 8.608 3 10.379V16.217C3 17.725 3.92 19.017 5.227 19.559C5.16 18.649 5.16 17.374 5.16 16.312V11.302C5.16 10.021 5.16 8.916 5.278 8.032C5.405 7.084 5.691 6.176 6.425 5.439C7.159 4.702 8.064 4.415 9.008 4.287C9.888 4.169 10.988 4.169 12.265 4.169H15.335C16.611 4.169 17.709 4.169 18.59 4.287C18.3261 3.61329 17.8653 3.03474 17.2678 2.62678C16.6702 2.21883 15.9635 2.00041 15.24 2Z"
                fill="white"
              />
              <path
                d="M6.6001 11.397C6.6001 8.67101 6.6001 7.30801 7.4441 6.46101C8.2871 5.61401 9.6441 5.61401 12.3601 5.61401H15.2401C17.9551 5.61401 19.3131 5.61401 20.1571 6.46101C21.0011 7.30801 21.0001 8.67101 21.0001 11.397V16.217C21.0001 18.943 21.0001 20.306 20.1571 21.153C19.3131 22 17.9551 22 15.2401 22H12.3601C9.6451 22 8.2871 22 7.4441 21.153C6.6001 20.306 6.6001 18.943 6.6001 16.217V11.397Z"
                fill="white"
              />
            </svg>
          </div>
        </div>
        <div className={styles.prototypeText}>prototype</div>

        <div className={styles.friendsCard}>
          {showToast && (
            <ToastNotification
              onClose={() => setShowToast(false)}
              duration={4000}
            />
          )}
          <div className={styles.friendsCard__content}>
            <svg
              width="28"
              height="25"
              viewBox="0 0 28 25"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5.44444 8.29032C5.44444 7.72691 5.55509 7.16901 5.77007 6.64849C5.98505 6.12796 6.30015 5.655 6.69738 5.25661C7.0946 4.85821 7.56618 4.54219 8.08519 4.32658C8.60419 4.11097 9.16046 4 9.72222 4C10.284 4 10.8403 4.11097 11.3593 4.32658C11.8783 4.54219 12.3498 4.85821 12.7471 5.25661C13.1443 5.655 13.4594 6.12796 13.6744 6.64849C13.8894 7.16901 14 7.72691 14 8.29032C14 8.85374 13.8894 9.41163 13.6744 9.93216C13.4594 10.4527 13.1443 10.9256 12.7471 11.324C12.3498 11.7224 11.8783 12.0385 11.3593 12.2541C10.8403 12.4697 10.284 12.5806 9.72222 12.5806C9.16046 12.5806 8.60419 12.4697 8.08519 12.2541C7.56618 12.0385 7.0946 11.7224 6.69738 11.324C6.30015 10.9256 5.98505 10.4527 5.77007 9.93216C5.55509 9.41163 5.44444 8.85374 5.44444 8.29032ZM3 21.1613C3 17.4379 6.00972 14.4194 9.72222 14.4194C13.4347 14.4194 16.4444 17.4379 16.4444 21.1613V21.3911C16.4444 22.2798 15.7264 23 14.8403 23H4.60417C3.71806 23 3 22.2798 3 21.3911V21.1613ZM19.5 5.83871C20.4725 5.83871 21.4051 6.22615 22.0927 6.9158C22.7804 7.60545 23.1667 8.54082 23.1667 9.51613C23.1667 10.4914 22.7804 11.4268 22.0927 12.1165C21.4051 12.8061 20.4725 13.1935 19.5 13.1935C18.5275 13.1935 17.5949 12.8061 16.9073 12.1165C16.2196 11.4268 15.8333 10.4914 15.8333 9.51613C15.8333 8.54082 16.2196 7.60545 16.9073 6.9158C17.5949 6.22615 18.5275 5.83871 19.5 5.83871ZM19.5 15.0323C22.5365 15.0323 25 17.503 25 20.5484V21.4065C25 22.2875 24.2896 23 23.4111 23H17.8806C18.1326 22.5212 18.2778 21.9734 18.2778 21.3911V21.1613C18.2778 19.1885 17.6132 17.3728 16.5017 15.9248C17.3649 15.3617 18.3962 15.0323 19.5 15.0323Z"
                fill="white"
              />
            </svg>
            <div className={styles.friendsCard__title}>Ваши друзья</div>
            <div className={styles.friendsCard__subtitle}>
              Приглашайте друзей в приложение и получайте 20% от их дохода на
              свой баланс
            </div>
          </div>
        </div>
        <div className={styles.cardsContainer}>
          <div className={styles.card}>
            <div className={styles.iconText}>
              <img src="/mine-icons/bitcoin.svg" alt="" />
              <span>3280</span>
            </div>
            <div className={styles.titleContainer}>
              <div className={styles.title}>Заработано</div>
              <div className={styles.subtitle}>
                <p>Больше чем у 73% пользователей</p>
              </div>
            </div>
          </div>
          <div className={styles.card}>
            <div className={styles.iconText}>
              <svg
                width="20"
                height="18"
                viewBox="0 0 20 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3.38889 5.16129C3.38889 4.74614 3.47439 4.33506 3.64051 3.95152C3.80663 3.56797 4.05011 3.21947 4.35706 2.92592C4.66401 2.63237 5.02841 2.39951 5.42946 2.24064C5.83051 2.08177 6.26035 2 6.69444 2C7.12854 2 7.55838 2.08177 7.95943 2.24064C8.36047 2.39951 8.72488 2.63237 9.03182 2.92592C9.33877 3.21947 9.58226 3.56797 9.74838 3.95152C9.9145 4.33506 10 4.74614 10 5.16129C10 5.57644 9.9145 5.98752 9.74838 6.37106C9.58226 6.75461 9.33877 7.10311 9.03182 7.39666C8.72488 7.69021 8.36047 7.92307 7.95943 8.08194C7.55838 8.24081 7.12854 8.32258 6.69444 8.32258C6.26035 8.32258 5.83051 8.24081 5.42946 8.08194C5.02841 7.92307 4.66401 7.69021 4.35706 7.39666C4.05011 7.10311 3.80663 6.75461 3.64051 6.37106C3.47439 5.98752 3.38889 5.57644 3.38889 5.16129ZM1.5 14.6452C1.5 11.9016 3.82569 9.67742 6.69444 9.67742C9.56319 9.67742 11.8889 11.9016 11.8889 14.6452V14.8145C11.8889 15.4694 11.334 16 10.6493 16H2.73958C2.05486 16 1.5 15.4694 1.5 14.8145V14.6452ZM14.25 3.35484C15.0014 3.35484 15.7221 3.64032 16.2535 4.14848C16.7848 4.65665 17.0833 5.34587 17.0833 6.06452C17.0833 6.78317 16.7848 7.47238 16.2535 7.98055C15.7221 8.48871 15.0014 8.77419 14.25 8.77419C13.4986 8.77419 12.7779 8.48871 12.2465 7.98055C11.7152 7.47238 11.4167 6.78317 11.4167 6.06452C11.4167 5.34587 11.7152 4.65665 12.2465 4.14848C12.7779 3.64032 13.4986 3.35484 14.25 3.35484ZM14.25 10.129C16.5964 10.129 18.5 11.9496 18.5 14.1935V14.8258C18.5 15.475 17.951 16 17.2722 16H12.9986C13.1934 15.6472 13.3056 15.2435 13.3056 14.8145V14.6452C13.3056 13.1915 12.792 11.8536 11.9332 10.7867C12.6002 10.3718 13.397 10.129 14.25 10.129Z"
                  fill="#5264CE"
                />
              </svg>
              <span>6</span>
            </div>
            <div className={styles.titleContainer}>
              <div className={styles.title}>Друзей</div>
              <div className={styles.subtitle}>
                <p>Больше чем у 89% пользователей</p>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.friendsList}>
          <div className={styles.listTitle}>
            Список друзей <span>(6)</span>
          </div>
          <div className={styles.listContainer}>
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className={styles.listItem}>
                <div className={styles.nameContainer}>
                  <img
                    className={styles.avatar}
                    src="friends/avatar.png"
                    alt=""
                  />
                  <div className={styles.name}>Damir Podchasov</div>
                </div>
                <div className={styles.btcContainer}>
                  <img src="/mine-icons/bitcoin.svg" alt="" />
                  <span>200</span>
                  <p className={styles.btcText}>(0.1$)</p>
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

export default FriendsPage;
