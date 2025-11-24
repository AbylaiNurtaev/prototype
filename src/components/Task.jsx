import { useEffect, useRef, useState } from "react";
import styles from "./Task.module.css";

export const Task = ({
  debug,
  blockId,
  onReward,
  rewardText,
  buttonText,
  claimText,
  doneText,
}) => {
  const taskRef = useRef(null);
  const containerRef = useRef(null);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    if (!containerRef.current || !customElements.get("adsgram-task")) {
      return;
    }

    // Создаем элемент adsgram-task
    const adsgramElement = document.createElement("adsgram-task");
    adsgramElement.setAttribute("data-block-id", blockId);
    adsgramElement.setAttribute("data-debug", debug || "false");
    adsgramElement.className = styles.task;

    // Добавляем только reward слот (если нужен)
    if (rewardText) {
      const rewardSlot = document.createElement("span");
      rewardSlot.setAttribute("slot", "reward");
      rewardSlot.className = styles.reward;
      rewardSlot.textContent = rewardText;
      adsgramElement.appendChild(rewardSlot);
    }

    containerRef.current.appendChild(adsgramElement);
    taskRef.current = adsgramElement;

    // Проверяем, когда баннер загрузился, чтобы показать кнопку
    const checkBannerLoaded = () => {
      const banner = adsgramElement.querySelector(
        "img, iframe, video, canvas, a"
      );
      if (banner) {
        setShowButton(true);
      }
    };

    // Проверяем сразу и через небольшую задержку
    checkBannerLoaded();
    const checkInterval = setInterval(checkBannerLoaded, 500);

    // Обработчик события reward
    const handler = (event) => {
      // event.detail contains your block id
      console.log(`✅ Reward received, detail = ${event.detail}`);
      if (onReward) {
        onReward(event.detail);
      }
    };

    adsgramElement.addEventListener("reward", handler);

    return () => {
      clearInterval(checkInterval);
      adsgramElement.removeEventListener("reward", handler);
      if (
        containerRef.current &&
        containerRef.current.contains(adsgramElement)
      ) {
        containerRef.current.removeChild(adsgramElement);
      }
    };
  }, [blockId, debug, onReward, rewardText]);

  // Обработчик клика на кнопку "Выполнить"
  const handleButtonClick = () => {
    if (taskRef.current) {
      // Ищем кликабельный элемент баннера и кликаем по нему
      const clickableElement = taskRef.current.querySelector("a, img, iframe");
      if (clickableElement) {
        if (clickableElement.tagName === "A") {
          clickableElement.click();
        } else if (clickableElement.tagName === "IMG") {
          // Если это img, ищем родительский a или кликаем напрямую
          const parentLink = clickableElement.closest("a");
          if (parentLink) {
            parentLink.click();
          } else {
            // Если нет ссылки, триггерим событие клика
            clickableElement.click();
          }
        }
      }
    }
  };

  if (!customElements.get("adsgram-task")) {
    return null;
  }

  return (
    <div className={styles.taskContainer}>
      <div ref={containerRef} className={styles.taskContainer} />
      {showButton && (
        <button className={styles.executeButton} onClick={handleButtonClick}>
          Выполнить
        </button>
      )}
    </div>
  );
};
