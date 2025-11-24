import React, { useEffect, useState, useRef } from "react";
import { TadsWidget } from "react-tads-widget";
import styles from "./BannerClickPopup.module.scss";
import { Task } from "./Task";
import providerManager from "../services/adProviders/ProviderManager.js";

const BannerClickPopup = ({ task, onClose, onReward }) => {
  // Приоритет: Barza -> Tads -> AdsgramCPC
  const [currentProvider, setCurrentProvider] = useState("barza"); // Начинаем с Barza
  const [providerRewarded, setProviderRewarded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef(null);

  // Скрываем кнопки Adsgram через глобальные стили
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .banner-click-popup adsgram-task [slot="button"],
      .banner-click-popup adsgram-task [slot="claim"],
      .banner-click-popup adsgram-task [slot="done"],
      .banner-click-popup adsgram-task [slot="reward"],
      .banner-click-popup adsgram-task button,
      .banner-click-popup adsgram-task .button,
      .banner-click-popup adsgram-task .button_claim,
      .banner-click-popup adsgram-task .button_done,
      .banner-click-popup adsgram-task .reward {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        height: 0 !important;
        width: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
        position: absolute !important;
        left: -9999px !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    // Ускоряем проверку провайдеров - проверяем параллельно
    const checkProviders = async () => {
      await providerManager.initialize();

      // Ускоряем проверку - проверяем все провайдеры параллельно
      const [barzaProvider, tadsProvider] = await Promise.all([
        providerManager.getProvider("barza"),
        providerManager.getProvider("tads"),
      ]);

      // Проверяем доступность параллельно
      const [isBarzaAvailable, isTadsAvailable] = await Promise.all([
        barzaProvider ? barzaProvider.isAdAvailable() : Promise.resolve(false),
        tadsProvider ? tadsProvider.isAdAvailable() : Promise.resolve(false),
      ]);

      // Выбираем первый доступный по приоритету
      if (isBarzaAvailable) {
        console.log("[BannerClickPopup] Barza доступен, показываем его");
        setCurrentProvider("barza");
        // isLoading останется true до загрузки баннера
        return;
      }

      if (isTadsAvailable) {
        console.log("[BannerClickPopup] Tads доступен, показываем его");
        setCurrentProvider("tads");
        // Даем время на загрузку
        setTimeout(() => setIsLoading(false), 1500);
        return;
      }

      // Если ни Barza, ни Tads недоступны, используем Adsgram
      console.log("[BannerClickPopup] Используем Adsgram как fallback");
      setCurrentProvider("adsgram-cpc");
      // Даем время на загрузку
      setTimeout(() => setIsLoading(false), 1500);
    };

    checkProviders();
  }, []);

  // Обработка для Barza (рендерим баннер)
  useEffect(() => {
    if (
      currentProvider === "barza" &&
      !providerRewarded &&
      containerRef.current
    ) {
      const barzaProvider = providerManager.getProvider("barza");
      if (barzaProvider) {
        // Загружаем и показываем рекламу Barza
        barzaProvider.start().then((result) => {
          if (result.success) {
            const adElement = barzaProvider.getAdElement();
            if (
              adElement &&
              containerRef.current &&
              !containerRef.current.contains(adElement)
            ) {
              containerRef.current.appendChild(adElement);
              setIsLoading(false);

              // Слушаем клик на баннер Barza
              const handleBarzaClick = () => {
                console.log("✅ Barza CPC задание выполнено - клик на рекламу");
                setProviderRewarded(true);
                if (onReward) {
                  onReward(task, "barza");
                }
                barzaProvider.cleanup();
              };

              // Добавляем обработчик клика на элемент
              adElement.addEventListener("click", handleBarzaClick);

              return () => {
                adElement.removeEventListener("click", handleBarzaClick);
              };
            }
          } else {
            // Barza не нашел рекламу, пробуем следующий провайдер
            console.warn(
              "[BannerClickPopup] Barza не нашел рекламу, пробуем Tads"
            );
            setCurrentProvider("tads");
            setIsLoading(false);
          }
        });
      }
    }
  }, [currentProvider, providerRewarded, task, onReward]);

  // Скрываем скелетон когда баннер загрузился (для Tads и Adsgram)
  useEffect(() => {
    if (currentProvider === "tads" || currentProvider === "adsgram-cpc") {
      // Даем немного времени на загрузку баннера
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentProvider]);

  if (!task) return null;

  const handleTadsReward = () => {
    console.log("✅ Tads CPC задание выполнено - клик на рекламу");
    setProviderRewarded(true);
    if (onReward) {
      onReward(task, "tads");
    }
  };

  const handleTadsNotFound = () => {
    console.warn("❌ Tads: реклама не найдена, пробуем Adsgram");
    setCurrentProvider("adsgram-cpc");
  };

  const handleAdsgramReward = (detail) => {
    console.log("✅ Adsgram CPC задание выполнено:", detail);
    setProviderRewarded(true);
    if (onReward) {
      onReward(task, "adsgram-cpc");
    }
  };

  return (
    <div className={`${styles.overlay} banner-click-popup`} onClick={onClose}>
      <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M11.575 12.975L6.675 17.875C6.49167 18.0583 6.25833 18.15 5.975 18.15C5.69167 18.15 5.45833 18.0583 5.275 17.875C5.09167 17.6917 5 17.4583 5 17.175C5 16.8917 5.09167 16.6583 5.275 16.475L10.175 11.575L5.275 6.675C5.09167 6.49167 5 6.25833 5 5.975C5 5.69167 5.09167 5.45833 5.275 5.275C5.45833 5.09167 5.69167 5 5.975 5C6.25833 5 6.49167 5.09167 6.675 5.275L11.575 10.175L16.475 5.275C16.6583 5.09167 16.8917 5 17.175 5C17.4583 5 17.6917 5.09167 17.875 5.275C18.0583 5.45833 18.15 5.69167 18.15 5.975C18.15 6.25833 18.0583 6.49167 17.875 6.675L12.975 11.575L17.875 16.475C18.0583 16.6583 18.15 16.8917 18.15 17.175C18.15 17.4583 18.0583 17.6917 17.875 17.875C17.6917 18.0583 17.4583 18.15 17.175 18.15C16.8917 18.15 16.6583 18.0583 16.475 17.875L11.575 12.975Z"
              fill="white"
            />
          </svg>
        </button>

        <div className={styles.contentWrapper}>
          <div className={styles.title}>Кликни на баннер</div>
          <div className={styles.description}>
            Нажми на рекламу и получи{" "}
            <span className={styles.energy}>{task?.energy || 0} энергии</span>
          </div>
        </div>

        <div className={styles.taskContainer} ref={containerRef}>
          {isLoading ? (
            <div className={styles.skeleton}>
              <div className={styles.skeletonIcon}></div>
              <div className={styles.skeletonText}>
                <div className={styles.skeletonLine}></div>
                <div className={styles.skeletonLineShort}></div>
              </div>
            </div>
          ) : (
            <>
              {!providerRewarded &&
                currentProvider === "barza" &&
                // Barza рендерится через getAdElement()
                null}
              {!providerRewarded && currentProvider === "tads" && (
                <TadsWidget
                  id="972"
                  type="static"
                  debug={false}
                  onClickReward={handleTadsReward}
                  onAdsNotFound={handleTadsNotFound}
                />
              )}
              {!providerRewarded && currentProvider === "adsgram-cpc" && (
                <Task
                  blockId="task-18088"
                  debug="true"
                  onReward={handleAdsgramReward}
                />
              )}
              {!currentProvider && !providerRewarded && (
                // Показываем Tads по умолчанию, если система провайдеров еще не определила
                <TadsWidget
                  id="972"
                  type="static"
                  debug={false}
                  onClickReward={handleTadsReward}
                  onAdsNotFound={handleTadsNotFound}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BannerClickPopup;
