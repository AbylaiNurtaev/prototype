import React, { useState } from "react";
import styles from "./TaskPopup.module.scss";
import { checkExternalTask, claimExternalTask, claimTask } from "../services/api";

const TaskPopup = ({ task, onClose }) => {
  if (!task) return null;

  const [isChecking, setIsChecking] = useState(false);

  // Получаем данные из API
  const apiData = task.apiData || {};
  const details = apiData.details || {};
  const viewDetails = apiData.view_details || {};
  const taskType = apiData.type || "";
  const provider = apiData.provider || "";

  // Определяем тип задания
  const isBanner = taskType.startsWith("banners-");
  const isExternal = provider === "flyer" || provider === "subgram";
  const isSponsor = !isBanner && !isExternal;

  console.log("📋 TaskPopup - данные задания:", {
    task,
    apiData,
    taskType,
    provider,
    isBanner,
    isSponsor,
    isExternal,
  });

  // Обработчик проверки задания
  const handleCheckTask = async () => {
    if (isChecking) return;
    
    setIsChecking(true);
    try {
      console.log("🔄 Проверяем задание...");
      
      if (isExternal) {
        // Для внешних заданий: check -> claim
        await checkExternalTask(provider, task.id);
        const result = await claimExternalTask(provider, task.id);
        console.log("✅ Внешнее задание выполнено:", result);
      } else {
        // Для обычных заданий (banners, sponsors)
        const result = await claimTask(task.id);
        console.log("✅ Задание выполнено:", result);
      }
      
      alert("Задание выполнено! Награда получена.");
      onClose();
    } catch (error) {
      console.error("❌ Ошибка проверки задания:", error);
      alert("Ошибка при проверке задания. Попробуйте позже.");
    } finally {
      setIsChecking(false);
    }
  };

  // Для баннеров
  if (isBanner) {
    const action = details.action; // "click" или "view"
    const actionText = action === "click" ? "Кликни на баннер" : "Посмотри рекламу";
    const buttonText = action === "click" ? "Кликнуть" : "Смотреть";

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

          <div className={styles.iconContainer}>
            <img src={task.icon} alt={task.name} className={styles.taskIcon} />
          </div>

          <div className={styles.taskTitle}>{task.name}</div>

          <div className={styles.bannerDescription}>
            {actionText} и получи <span style={{color: "#FFD700"}}>{task.energy} энергии</span>
          </div>

          <div className={styles.bannerProgress}>
            Прогресс: {task.progress}
          </div>

          <div className={styles.buttonsContainer}>
            <button 
              className={styles.subscribeButton}
              style={{width: "100%"}}
            >
              {buttonText}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Для спонсоров и внешних заданий
  const subtasks = details.task_instructions || [
    "Нажми «Подписаться» внизу экрана.",
    "Подпишись на канал",
    'Вернись сюда, нажми на кнопку "Проверить задание"',
    "Получи свою награду",
  ];

  // Для внешних используем icon и link, для спонсоров - photo и link
  const taskPhoto = details.photo || details.icon || "/tasks/check.png";
  const taskLink = viewDetails.link || details.link || "#";
  const buttonText = details.button_start_task_text || "Подписаться";

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

        <div className={styles.iconContainer}>
          <img src={taskPhoto} alt={task.name} className={styles.taskIcon} />
        </div>

        <div className={styles.taskTitle}>{task.name}</div>

        <div className={styles.subtasksList}>
          {subtasks.map((subtask, index) => (
            <div key={index} className={styles.subtaskCard}>
              <div className={styles.subtaskNumber}>{index + 1}</div>
              <div className={styles.subtaskText}>{subtask}</div>
            </div>
          ))}
        </div>

        <div className={styles.buttonsContainer}>
          <button 
            className={styles.subscribeButton}
            onClick={() => {
              window.open(taskLink, '_blank');
            }}
          >
            {buttonText}
          </button>
          <button 
            className={styles.checkButton}
            onClick={handleCheckTask}
            disabled={isChecking}
          >
            {isChecking ? "Проверяем..." : "Проверить задание"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskPopup;
