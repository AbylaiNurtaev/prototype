import React, { useEffect, useState } from "react";
import { TadsWidget } from "react-tads-widget";
import styles from "./BannerClickPopup.module.scss";
import { Task } from "./Task";
import providerManager from "../services/adProviders/ProviderManager.js";

const BannerClickPopup = ({ task, onClose, onReward }) => {
  // По умолчанию показываем Tads (наивысший приоритет)
  const [useTads, setUseTads] = useState(true);
  const [tadsProvider, setTadsProvider] = useState(null);
  const [tadsRewarded, setTadsRewarded] = useState(false); // Флаг, что Tads уже наградил

  useEffect(() => {
    // Инициализируем Tads провайдер
    const initTads = async () => {
      await providerManager.initialize();
      const provider = providerManager.getProvider("tads");
      if (provider) {
        setTadsProvider(provider);
      }
    };
    initTads();
  }, []);

  if (!task) return null;

  const handleTadsReward = () => {
    console.log("✅ Tads CPC задание выполнено - клик на рекламу");
    // Устанавливаем флаг, что Tads уже наградил - Adsgram не должен показываться
    setTadsRewarded(true);
    if (tadsProvider) {
      tadsProvider.onReward();
    }
    if (onReward) {
      onReward(task, "tads");
    }
  };

  const handleTadsNotFound = () => {
    console.warn("❌ Tads: реклама не найдена, переключаемся на Adsgram");
    if (tadsProvider) {
      tadsProvider.onAdsNotFound();
    }
    // Если Tads не нашел рекламу И еще не наградил, пробуем Adsgram
    if (!tadsRewarded) {
      setUseTads(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
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

        <div className={styles.taskContainer}>
          {useTads && !tadsRewarded ? (
            <TadsWidget
              id="972"
              type="static"
              debug={false}
              onClickReward={handleTadsReward}
              onAdsNotFound={handleTadsNotFound}
            />
          ) : !tadsRewarded ? (
            <Task
              blockId="task-18088"
              debug="true"
              onReward={(detail) => {
                console.log("✅ Adsgram CPC задание выполнено:", detail);
                if (onReward) {
                  onReward(task, "adsgram-cpc");
                }
              }}
              rewardText={`${task.energy} энергии`}
              buttonText="Кликнуть на баннер"
              claimText="Забрать награду"
              doneText="Выполнено"
            />
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default BannerClickPopup;
