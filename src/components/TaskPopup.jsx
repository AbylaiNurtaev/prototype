import React from "react";
import styles from "./TaskPopup.module.scss";

const TaskPopup = ({ task, onClose }) => {
  if (!task) return null;

  const subtasks = [
    "Нажми «Подписаться» внизу экрана.",
    "Подпишись на канал",
    'Вернись сюда, нажми на кнопку "Проверить задание"',
    "Получи свою награду",
  ];

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
          <img src="/tasks/check.png" alt="check" className={styles.taskIcon} />
        </div>

        <div className={styles.taskTitle}>Подпишись на канал</div>

        <div className={styles.subtasksList}>
          {subtasks.map((subtask, index) => (
            <div key={index} className={styles.subtaskCard}>
              <div className={styles.subtaskNumber}>{index + 1}</div>
              <div className={styles.subtaskText}>{subtask}</div>
            </div>
          ))}
        </div>

        <div className={styles.buttonsContainer}>
          <button className={styles.subscribeButton}>Подписаться</button>
          <button className={styles.checkButton}>Проверить задание</button>
        </div>
      </div>
    </div>
  );
};

export default TaskPopup;
