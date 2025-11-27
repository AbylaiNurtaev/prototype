import { useEffect, useRef } from "react";
import styles from "./Task.module.css";

export const Task = ({ debug, blockId, onReward, rewardText }) => {
  const taskRef = useRef(null);
  const containerRef = useRef(null);

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
      adsgramElement.removeEventListener("reward", handler);
      if (
        containerRef.current &&
        containerRef.current.contains(adsgramElement)
      ) {
        containerRef.current.removeChild(adsgramElement);
      }
    };
  }, [blockId, debug, onReward, rewardText]);

  if (!customElements.get("adsgram-task")) {
    return null;
  }

  return (
    <div className={styles.taskContainer}>
      <div ref={containerRef} className={styles.taskContainer} />
    </div>
  );
};
