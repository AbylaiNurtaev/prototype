import React, { useState, useEffect } from "react";
import styles from "./tasksPage.module.scss";
import TaskPopup from "../../components/TaskPopup";
import SuccessToast from "../../components/SuccessToast";
import { getTasks, getExternalTasks } from "../../services/api";

const TasksPage = ({ onPopupStateChange }) => {
  const [selectedTask, setSelectedTask] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Загрузка заданий из API
  useEffect(() => {
    const loadTasks = async () => {
      try {
        console.log("📋 TasksPage: Загрузка заданий...");
        
        // Загружаем все типы заданий
        const [bannersResponse, sponsorsResponse, subgramResponse, flyerResponse] = await Promise.all([
          getTasks("banners"),
          getTasks("sponsors"),
          getExternalTasks("subgram"),
          getExternalTasks("flyer"),
        ]);

        console.log("🎯 Banners:", bannersResponse);
        console.log("💎 Sponsors:", sponsorsResponse);
        
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("🌐 ВНЕШНИЕ ЗАДАНИЯ - SUBGRAM:");
        console.log(subgramResponse);
        console.log("Тип:", typeof subgramResponse);
        console.log("Это массив?:", Array.isArray(subgramResponse));
        if (subgramResponse?.tasks) {
          console.log("Tasks:", subgramResponse.tasks);
          console.log("Количество:", subgramResponse.tasks.length);
        }
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("🌐 ВНЕШНИЕ ЗАДАНИЯ - FLYER:");
        console.log(flyerResponse);
        console.log("Тип:", typeof flyerResponse);
        console.log("Это массив?:", Array.isArray(flyerResponse));
        if (flyerResponse?.tasks) {
          console.log("Tasks:", flyerResponse.tasks);
          console.log("Количество:", flyerResponse.tasks.length);
        }
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

        // Извлекаем массивы заданий
        const bannerTasks = bannersResponse?.tasks || [];
        const sponsorTasks = sponsorsResponse?.tasks || [];
        const subgramTasks = subgramResponse?.tasks || [];
        const flyerTasks = flyerResponse?.tasks || [];

        // Объединяем задания
        const allTasks = [...bannerTasks, ...sponsorTasks, ...subgramTasks, ...flyerTasks];

        // Сортируем: сначала невыполненные, потом CLAIMED в конец
        const sortedTasks = allTasks.sort((a, b) => {
          const aIsClaimed = a.status === "CLAIMED";
          const bIsClaimed = b.status === "CLAIMED";
          
          if (aIsClaimed && !bIsClaimed) return 1;
          if (!aIsClaimed && bIsClaimed) return -1;
          return 0;
        });

        // Преобразуем данные API в формат UI
        const formattedTasks = sortedTasks.map((task) => {

          // Определяем тип задания
          const isExternal = task.provider === "flyer" || task.provider === "subgram";
          
          // Определяем иконку в зависимости от типа
          let icon = "/tasks/channeltask.png"; // по умолчанию
          
          if (isExternal) {
            // Для внешних заданий используем icon из details
            icon = task.details?.icon || "/tasks/channeltask.png";
          } else if (task.type === "banners-cpc") {
            icon = "/tasks/bannerclicktask.png";
          } else if (task.type === "banners-cpm") {
            icon = "/tasks/videotask.png";
          } else if (task.type === "sponsor-subs" || task.type === "sponsors-external") {
            // Для спонсоров используем фото из API если есть
            icon = task.details?.photo || "/tasks/channeltask.png";
          }

          return {
            id: task.id,
            name: task.view_details?.title || task.details?.name || "Задание",
            icon: icon,
            energy: task.rewards?.coins || 0,
            progress: `${task.user_progress || 0}/${task.target_progress || 1}`,
            // Сохраняем полные данные из API
            apiData: task,
          };
        });

        console.log("✅ Отформатированные задания:", formattedTasks);
        setTasks(formattedTasks);
      } catch (error) {
        console.error("❌ Ошибка загрузки заданий:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, []);

  // Обработчик успешного выполнения задания
  const handleTaskCompleted = (taskId) => {
    console.log("✅ Задание выполнено, ID:", taskId);
    
    // Показываем toast
    setShowSuccessToast(true);
    
    // Обновляем статус задания на CLAIMED и перемещаем в конец
    setTasks((prevTasks) => {
      const updatedTasks = prevTasks.map((task) => {
        if (task.id === taskId) {
          return {
            ...task,
            apiData: {
              ...task.apiData,
              status: "CLAIMED",
            },
          };
        }
        return task;
      });
      
      // Сортируем: CLAIMED в конец
      return updatedTasks.sort((a, b) => {
        const aIsClaimed = a.apiData?.status === "CLAIMED";
        const bIsClaimed = b.apiData?.status === "CLAIMED";
        
        if (aIsClaimed && !bIsClaimed) return 1;
        if (!aIsClaimed && bIsClaimed) return -1;
        return 0;
      });
    });
  };

  return (
    <div className={styles.page}>
      <img
        src="/profile/shineProfile.svg"
        alt="shine"
        className={styles.shine}
      />
      <div className={styles.pageContent}>
        <div className={styles.prototypeText}>prototype</div>

        <div className={styles.banner}>
          <div className={styles.bannerContent}>
            <img
              src="/tasks/energy.png"
              alt="energy"
              className={styles.bannerIcon}
            />
            <div className={styles.bannerTitle}>Энергия за активность</div>
            <div className={styles.bannerSubtitle}>
              Выполняй задания — получай энергию и находи биткоины в процессе.
            </div>
          </div>
          
          {showSuccessToast && (
            <SuccessToast onClose={() => setShowSuccessToast(false)} />
          )}
        </div>

        <div className={styles.tasksTitle}>Список заданий</div>

        <div className={styles.tasksList}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>
              Загрузка заданий...
            </div>
          ) : tasks.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>
              Нет доступных заданий
            </div>
          ) : (
            tasks.map((task) => (
            <div key={task.id} className={styles.taskCard}>
              <img
                src={task.icon}
                alt={task.name}
                className={styles.taskIcon}
              />
              <div className={styles.taskInfo}>
                <div className={styles.taskName}>{task.name}</div>
                <div className={styles.taskRewards}>
                  <div className={styles.rewardItem}>
                    <img src="/mine-icons/energy.svg" alt="energy" />
                    <span>{task.energy}</span>
                  </div>
                  {/* Показываем прогресс только для баннеров */}
                  {task.apiData?.type?.startsWith("banners-") && (
                    <div className={styles.rewardItem}>
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 15 15"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          opacity="0.2"
                          d="M8.40032 1.5V2.8C11.2739 3.151 13.3096 5.7445 12.9562 8.598C12.8117 9.74784 12.2852 10.817 11.4601 11.6364C10.6349 12.4557 9.55825 12.9785 8.40032 13.122V14.422C12.0005 14.032 14.586 10.821 14.1933 7.2525C13.8529 4.2235 11.4506 1.825 8.40032 1.5ZM7.09117 1.5C5.8082 1.617 4.59724 2.1175 3.60229 2.93L4.53833 3.931C5.27145 3.346 6.15513 2.969 7.09117 2.839V1.539M2.67934 3.8855C1.85794 4.87001 1.35388 6.07718 1.23273 7.35H2.54188C2.66625 6.427 3.03281 5.5495 3.61538 4.815L2.67934 3.8855ZM1.23927 8.65C1.37019 9.924 1.87421 11.1265 2.68588 12.1145L3.61538 11.185C3.03729 10.4503 2.66877 9.57471 2.54842 8.65H1.23927ZM4.51215 12.1405L3.60229 13.031C4.59395 13.8516 5.80778 14.3626 7.09117 14.5V13.2C6.15996 13.0805 5.27823 12.7146 4.53833 12.1405H4.51215ZM5.5071 11.12L6.10931 8.5915L4.14558 6.9145L6.73115 6.674L7.74574 4.3275L8.76033 6.7L11.3459 6.9145L9.38218 8.5915L9.98439 11.12L7.74574 9.781L5.5071 11.12Z"
                          fill="white"
                        />
                      </svg>
                      <span>{task.progress}</span>
                    </div>
                  )}
                </div>
              </div>
              <button
                className={styles.taskButton}
                onClick={() => {
                  setSelectedTask(task);
                  onPopupStateChange?.(true);
                }}
                disabled={task.apiData?.status === "CLAIMED"}
                style={{
                  opacity: task.apiData?.status === "CLAIMED" ? 0.5 : 1,
                  cursor: task.apiData?.status === "CLAIMED" ? "not-allowed" : "pointer",
                }}
              >
                {task.apiData?.status === "CLAIMED" ? "Выполнено" : "Выполнить"}
              </button>
            </div>
          )))}
        </div>
      </div>

      {selectedTask && (
        <TaskPopup
          task={selectedTask}
          onClose={() => {
            setSelectedTask(null);
            onPopupStateChange?.(false);
          }}
          onTaskCompleted={handleTaskCompleted}
        />
      )}
    </div>
  );
};

export default TasksPage;
