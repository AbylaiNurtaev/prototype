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

          // Пробуем все возможные варианты получения большего разрешения
          if (photoUrl.includes("/160/")) {
            photoUrl = photoUrl.replace("/160/", "/640/");
          } else if (photoUrl.includes("/userpic/")) {
            // Telegram CDN - пробуем максимальный размер
            photoUrl = photoUrl.replace(/\/\d+$/, "/640");
          } else if (photoUrl.includes("size=small")) {
            photoUrl = photoUrl.replace("size=small", "size=big");
          } else if (photoUrl.includes("?")) {
            // Добавляем параметр размера если есть query params
            photoUrl = photoUrl + "&size=640";
          }

          console.log("Photo URL:", photoUrl);
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
        <img src={userPhoto} alt="User Avatar" crossOrigin="anonymous" />

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

        <div className={styles.statsContainer}>
          <div className={styles.statsTitle}>Моя статистика</div>

          <div className={styles.cardsScroll}>
            <div className={styles.statsCard}>
              <div className={styles.iconText}>
                <img src="/mine-icons/bitcoin.svg" alt="bitcoin" />
              </div>
              <div className={styles.titleContainer}>
                <div className={styles.cardTitle}>8999</div>
                <div className={styles.cardSubtitle}>
                  <p>Добыто биткоинов</p>
                </div>
              </div>
            </div>

            <div className={styles.statsCard}>
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
              </div>
              <div className={styles.titleContainer}>
                <div className={styles.cardTitle}>6</div>
                <div className={styles.cardSubtitle}>
                  <p>Количество друзей</p>
                </div>
              </div>
            </div>

            <div className={styles.statsCard}>
              <div className={styles.iconText}>
                <img src="/exchange/usdt.png" alt="energy" />
              </div>
              <div className={styles.titleContainer}>
                <div className={styles.cardTitle}>27 $</div>
                <div className={styles.cardSubtitle}>
                  <p>Сумма выводов</p>
                </div>
              </div>
            </div>

            <div className={styles.statsCard}>
              <div className={styles.iconText}>
                <img src="/mine-icons/bitcoin.svg" alt="bitcoin" />
              </div>
              <div className={styles.titleContainer}>
                <div className={styles.cardTitle}>За сегодня</div>
                <div className={styles.cardSubtitle}>
                  <p>Найдено биткоинов</p>
                </div>
              </div>
            </div>

            <div className={styles.statsCard}>
              <div className={styles.iconText}>
                <svg
                  width="26"
                  height="23"
                  viewBox="0 0 26 23"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1 19.9677C1 15.8524 4.28333 12.5161 8.33333 12.5161C12.3833 12.5161 15.6667 15.8524 15.6667 19.9677V20.2218C15.6667 21.204 14.8833 22 13.9167 22H2.75C1.78333 22 1 21.204 1 20.2218V19.9677ZM19 13.1935C22.3125 13.1935 25 15.9244 25 19.2903V20.2387C25 21.2125 24.225 22 23.2667 22H17.2333C17.5083 21.4707 17.6667 20.8653 17.6667 20.2218V19.9677C17.6667 17.7873 16.9417 15.7804 15.7292 14.18C16.6708 13.5576 17.7958 13.1935 19 13.1935Z"
                    fill="#5264CE"
                  />
                  <path
                    d="M22.3465 5.97745C22.2634 4.97434 21.4084 4.62898 20.3154 4.51404L20.3378 3.13123L19.4931 3.11856L19.4718 4.4671L18.7993 4.46388L18.8225 3.10517L17.9779 3.09301L17.956 4.48054L17.4205 4.47933L17.4193 4.47421L16.2511 4.4556L16.238 5.35869C16.238 5.35869 16.8615 5.35987 16.8532 5.36612C17.1956 5.37413 17.3009 5.57346 17.3306 5.74191L17.3103 7.32385L17.3997 7.33212L17.3079 7.33413L17.2742 9.54728C17.2601 9.6531 17.1932 9.82412 16.9529 9.81655C16.9655 9.82873 16.3435 9.81316 16.3435 9.81316L16.1588 10.8157L17.2579 10.8315L17.8604 10.8468L17.8373 12.2497L18.6817 12.2614L18.6995 10.8748L19.3794 10.8909L19.357 12.2742L20.2016 12.2864L20.2202 10.8845C21.6427 10.8249 22.644 10.4848 22.7859 9.15122C22.9 8.07778 22.4026 7.59498 21.5988 7.38336C22.0939 7.14636 22.405 6.70843 22.3419 5.97852L22.3465 5.97745ZM21.1201 8.9612C21.1068 10.0111 19.3094 9.86096 18.7392 9.85704L18.7673 7.99648C19.3393 8.00859 21.1369 7.86622 21.1189 8.95608L21.1201 8.9612ZM20.7642 6.33233C20.7529 7.28464 19.2518 7.15275 18.7782 7.14677L18.8029 5.46128C19.2816 5.46658 20.7808 5.34046 20.7642 6.33233Z"
                    fill="#5264CE"
                  />
                  <path
                    d="M12.3555 4.45059C12.2591 3.28808 11.2683 2.88783 10.0016 2.75463L10.0276 1.15208L9.04866 1.1374L9.02398 2.70024L8.24457 2.6965L8.2715 1.12188L7.29269 1.10779L7.26731 2.71581L6.64665 2.7144L6.64527 2.70847L5.29139 2.68691L5.27624 3.7335C5.27624 3.7335 5.99882 3.73488 5.98926 3.74211C6.38601 3.7514 6.50811 3.98241 6.54243 4.17763L6.519 6.01094L6.62255 6.02053L6.51616 6.02286L6.47718 8.58769C6.46079 8.71033 6.38325 8.90853 6.10481 8.89976C6.11936 8.91387 5.39852 8.89583 5.39852 8.89583L5.18453 10.0576L6.45825 10.076L7.15649 10.0937L7.12965 11.7196L8.10832 11.7331L8.12896 10.1262L8.91685 10.1448L8.89095 11.748L9.86976 11.762L9.89127 10.1374C11.5398 10.0683 12.7003 9.67414 12.8647 8.1287C12.997 6.88467 12.4205 6.32516 11.489 6.07991C12.0627 5.80525 12.4232 5.29773 12.3501 4.45183L12.3555 4.45059ZM10.9342 7.90848C10.9187 9.12522 8.83577 8.95122 8.17498 8.94667L8.20744 6.79046C8.87044 6.80449 10.9537 6.6395 10.9328 7.90255L10.9342 7.90848ZM10.5217 4.86186C10.5086 5.9655 8.76892 5.81266 8.22014 5.80572L8.24869 3.8524C8.80355 3.85854 10.541 3.71238 10.5217 4.86186Z"
                    fill="#5264CE"
                  />
                </svg>
              </div>
              <div className={styles.titleContainer}>
                <div className={styles.cardTitle}>3280</div>
                <div className={styles.cardSubtitle}>
                  <p>Доход с друзей</p>
                </div>
              </div>
            </div>

            <div className={styles.statsCard}>
              <div className={styles.iconText}>
                <img src="/mine-icons/wallet.svg" alt="wallet" />
              </div>
              <div className={styles.titleContainer}>
                <div className={styles.cardTitle}>193</div>
                <div className={styles.cardSubtitle}>
                  <p>Найдено кошельков</p>
                </div>
              </div>
            </div>

            <div className={styles.statsCard}>
              <div className={styles.iconText}>
                <img src="/profile/ai.png" alt="ai-agent" />
              </div>
              <div className={styles.titleContainer}>
                <div className={styles.cardTitle}>89$</div>
                <div className={styles.cardSubtitle}>
                  <p>Добыто ИИ-агентом</p>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.statsTitle}>Статистика проекта</div>

          <div className={styles.cardsScroll}>
            <div className={styles.statsCard}>
              <div className={styles.iconText}>
                <img src="/mine-icons/wallet.svg" alt="wallet" />
              </div>
              <div className={styles.titleContainer}>
                <div className={styles.cardTitle}>45,892</div>
                <div className={styles.cardSubtitle}>
                  <p>Найдено кошельков</p>
                </div>
              </div>
            </div>

            <div className={styles.statsCard}>
              <div className={styles.iconText}>
                <img src="/exchange/usdt.png" alt="usdt" />
              </div>
              <div className={styles.titleContainer}>
                <div className={styles.cardTitle}>12,547 $</div>
                <div className={styles.cardSubtitle}>
                  <p>Сумма выводов</p>
                </div>
              </div>
            </div>

            <div className={styles.statsCard}>
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
              </div>
              <div className={styles.titleContainer}>
                <div className={styles.cardTitle}>28,934</div>
                <div className={styles.cardSubtitle}>
                  <p>Количество игроков</p>
                </div>
              </div>
            </div>

            <div className={styles.statsCard}>
              <div className={styles.iconText}>
                <img src="/mine-icons/bitcoin.svg" alt="bitcoin" />
              </div>
              <div className={styles.titleContainer}>
                <div className={styles.cardTitle}>2,847,592</div>
                <div className={styles.cardSubtitle}>
                  <p>Добыто биткоинов</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
