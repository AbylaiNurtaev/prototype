import React, { useState, useEffect, useRef, useCallback } from "react";
import styles from "./tasksPage.module.scss";
import TaskPopup from "../../components/TaskPopup";
import SuccessToast from "../../components/SuccessToast";
import ErrorToast from "../../components/ErrorToast";
import { Task } from "../../components/Task";
import {
  getTasks,
  getExternalTasks,
  confirmBannerView,
  claimTask,
} from "../../services/api";
import { useAdsgram } from "../../hooks/useAdsgram";

const TasksPage = ({ onPopupStateChange }) => {
  const [selectedTask, setSelectedTask] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const pageRef = useRef(null);
  const [activeCPCTask, setActiveCPCTask] = useState(null); // Для отслеживания активного CPC задания

  // Функция загрузки заданий (нужна для handleBannerReward)
  const loadTasks = async () => {
    try {
      setLoading(true);

      let bannerTasks = [];
      let sponsorTasks = [];
      let subgramTasks = [];
      let flyerTasks = [];

      // Загружаем задания, но не падаем при ошибке API
      try {
        const [
          bannersResponse,
          sponsorsResponse,
          subgramResponse,
          flyerResponse,
        ] = await Promise.all([
          getTasks("banners").catch(() => ({ tasks: [] })),
          getTasks("sponsors").catch(() => ({ tasks: [] })),
          getExternalTasks("subgram").catch(() => ({ tasks: [] })),
          getExternalTasks("flyer").catch(() => ({ tasks: [] })),
        ]);

        // Логируем баннеры
        console.log("🎯 БАННЕРЫ:", bannersResponse);

        // Извлекаем массивы заданий
        bannerTasks = bannersResponse?.tasks || [];
        sponsorTasks = sponsorsResponse?.tasks || [];
        subgramTasks = subgramResponse?.tasks || [];
        flyerTasks = flyerResponse?.tasks || [];
      } catch (error) {
        console.error("❌ Ошибка загрузки заданий из API:", error);
        // Продолжаем работу даже если API не загрузился
      }

      // Если нет заданий типа banners-*, добавляем fallback задание
      const hasBannerTasks = bannerTasks.some((task) =>
        task.type?.startsWith("banners-")
      );
      if (!hasBannerTasks) {
        // Добавляем fallback задание "Посмотреть рекламу"
        bannerTasks.push({
          id: "fallback-ad-task",
          type: "banners-cpm",
          view_details: {
            title: "Посмотреть рекламу",
          },
          details: {
            action: "view",
          },
          rewards: {
            coins: 10,
          },
          user_progress: 0,
          target_progress: 1,
          status: "ACTIVE",
        });
      }

      // Объединяем задания
      const allTasks = [
        ...bannerTasks,
        ...sponsorTasks,
        ...subgramTasks,
        ...flyerTasks,
      ];

      // Сортируем: сначала невыполненные, потом завершенные и CLAIMED в конец
      const sortedTasks = allTasks.sort((a, b) => {
        const aIsCompleted =
          a.status === "CLAIMED" || a.user_progress >= a.target_progress;
        const bIsCompleted =
          b.status === "CLAIMED" || b.user_progress >= b.target_progress;

        if (aIsCompleted && !bIsCompleted) return 1;
        if (!aIsCompleted && bIsCompleted) return -1;
        return 0;
      });

      // Преобразуем данные API в формат UI
      const formattedTasks = sortedTasks.map((task) => {
        // Определяем тип задания
        const isExternal =
          task.provider === "flyer" || task.provider === "subgram";

        // Определяем иконку в зависимости от типа
        let icon = "/tasks/channeltask.png"; // по умолчанию

        if (isExternal) {
          // Для внешних заданий используем icon из details
          icon = task.details?.icon || "/tasks/channeltask.png";
        } else if (task.type === "banners-cpc") {
          icon = "/tasks/bannerclicktask.png";
        } else if (task.type === "banners-cpm") {
          icon = "/tasks/videotask.png";
        } else if (
          task.type === "sponsor-subs" ||
          task.type === "sponsors-external"
        ) {
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

      setTasks(formattedTasks);
    } catch (error) {
      console.error("❌ Ошибка загрузки заданий:", error);
    } finally {
      setLoading(false);
    }
  };

  // Обработчик успешного просмотра рекламы для заданий типа banners-*
  const handleBannerReward = useCallback(async (task) => {
    try {
      await confirmBannerView(task.id, "adsgram-cpc", false);

      const updatedProgress = (task.apiData?.user_progress || 0) + 1;
      const targetProgress = task.apiData?.target_progress || 1;

      if (updatedProgress >= targetProgress) {
        await claimTask(task.id, false);
      }

      // Перезагружаем задания
      loadTasks();
      setShowSuccessToast(true);
    } catch (error) {
      console.error("❌ Ошибка подтверждения просмотра:", error);
      setShowErrorToast(true);
    }
  }, []);

  // Хук для показа Adsgram рекламы
  const onAdReward = useCallback(
    (task) => {
      console.log("✅ Реклама просмотрена успешно!");
      handleBannerReward(task);
    },
    [handleBannerReward]
  );

  const onAdError = useCallback((result) => {
    console.error("❌ Ошибка при показе рекламы:", result);
    setShowErrorToast(true);
  }, []);

  // Обработчик клика на задание типа banners-* - показываем рекламу сразу
  const handleBannerTaskClick = useCallback(
    async (task) => {
      try {
        if (!window.Adsgram) {
          console.error("❌ Adsgram SDK не загружен");
          setShowErrorToast(true);
          return;
        }

        // Инициализируем Adsgram
        const adController = window.Adsgram.init({ blockId: "18088" });

        if (!adController) {
          console.error("❌ Не удалось инициализировать Adsgram");
          setShowErrorToast(true);
          return;
        }

        // Показываем рекламу
        await adController
          .show()
          .then(() => {
            // Реклама просмотрена успешно
            onAdReward(task);
          })
          .catch((result) => {
            // Ошибка при показе рекламы
            onAdError(result);
          });
      } catch (error) {
        console.error("❌ Ошибка показа рекламы:", error);
        setShowErrorToast(true);
      }
    },
    [onAdReward, onAdError]
  );

  // Загрузка заданий из API при монтировании и при повторном посещении страницы
  useEffect(() => {
    // Загружаем задания при монтировании
    loadTasks();

    // Обработчик события видимости страницы (когда пользователь возвращается на вкладку)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadTasks();
      }
    };

    // Обработчик события завершения просмотра баннера
    const handleBannerCompleted = () => {
      loadTasks();
    };

    // Обработчик фокуса на окне (когда пользователь возвращается на страницу)
    const handleFocus = () => {
      loadTasks();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("bannerCompleted", handleBannerCompleted);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("bannerCompleted", handleBannerCompleted);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  // Обработчик успешного выполнения задания
  const handleTaskCompleted = (taskId, isWaiting = false) => {
    // Закрываем попап
    setSelectedTask(null);
    onPopupStateChange?.(false);

    // Скроллим вверх к баннеру
    if (pageRef.current) {
      pageRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }

    // Показываем toast только если задание выполнено полностью
    if (!isWaiting) {
      setShowSuccessToast(true);
    }

    // Перезагружаем список заданий
    loadTasks();
  };

  // Обработчик ошибки при выполнении задания
  const handleTaskFailed = () => {
    // Закрываем попап
    setSelectedTask(null);
    onPopupStateChange?.(false);

    // Скроллим вверх к баннеру
    if (pageRef.current) {
      pageRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }

    // Показываем toast
    setShowErrorToast(true);
  };

  return (
    <div className={styles.page} ref={pageRef}>
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

          {showErrorToast && (
            <ErrorToast onClose={() => setShowErrorToast(false)} />
          )}
        </div>

        <div className={styles.tasksTitle}>Список заданий</div>

        <div className={styles.tasksList}>
          {loading ? (
            <div
              style={{ textAlign: "center", padding: "40px", color: "#888" }}
            >
              Загрузка заданий...
            </div>
          ) : tasks.length === 0 ? (
            <div
              style={{ textAlign: "center", padding: "40px", color: "#888" }}
            >
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
                {/* Для CPC заданий показываем компонент Task после клика на "Выполнить" */}
                {task.apiData?.type === "banners-cpc" &&
                activeCPCTask === task.id ? (
                  <Task
                    blockId="task-18088"
                    debug="true"
                    onReward={(detail) => {
                      console.log("✅ CPC задание выполнено:", detail);
                      onAdReward(task);
                      setActiveCPCTask(null);
                    }}
                    rewardText={`${task.energy} энергии`}
                    buttonText="Кликнуть на баннер"
                    claimText="Забрать награду"
                    doneText="Выполнено"
                  />
                ) : (
                  <button
                    className={styles.taskButton}
                    onClick={() => {
                      // Проверяем, достигнут ли прогресс
                      const isCompleted =
                        task.apiData?.user_progress >=
                        task.apiData?.target_progress;

                      if (
                        !isCompleted &&
                        task.apiData?.status !== "CLAIMED" &&
                        task.apiData?.status !== "WAITING"
                      ) {
                        // Для CPC заданий показываем компонент Task
                        if (task.apiData?.type === "banners-cpc") {
                          setActiveCPCTask(task.id);
                        }
                        // Для CPM заданий показываем рекламу сразу
                        else if (task.apiData?.type === "banners-cpm") {
                          handleBannerTaskClick(task);
                        }
                        // Для других заданий открываем попап
                        else {
                          setSelectedTask(task);
                          onPopupStateChange?.(true);
                        }
                      }
                    }}
                    disabled={
                      task.apiData?.user_progress >=
                        task.apiData?.target_progress ||
                      task.apiData?.status === "CLAIMED" ||
                      task.apiData?.status === "WAITING"
                    }
                    style={{
                      opacity:
                        task.apiData?.user_progress >=
                          task.apiData?.target_progress ||
                        task.apiData?.status === "CLAIMED"
                          ? 0.5
                          : 1,
                      cursor:
                        task.apiData?.user_progress >=
                          task.apiData?.target_progress ||
                        task.apiData?.status === "CLAIMED" ||
                        task.apiData?.status === "WAITING"
                          ? "not-allowed"
                          : "pointer",
                      background:
                        task.apiData?.status === "WAITING"
                          ? "rgba(82, 100, 206, 0.25)"
                          : "transparent",
                      border:
                        task.apiData?.status === "WAITING"
                          ? "none"
                          : "1px solid #5264ce",
                    }}
                  >
                    {task.apiData?.user_progress >=
                    task.apiData?.target_progress
                      ? "Выполнено"
                      : task.apiData?.status === "CLAIMED"
                      ? "Выполнено"
                      : task.apiData?.status === "WAITING"
                      ? "В обработке"
                      : "Выполнить"}
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {selectedTask && !selectedTask.apiData?.type?.startsWith("banners-") && (
        <TaskPopup
          task={selectedTask}
          onClose={() => {
            setSelectedTask(null);
            onPopupStateChange?.(false);
          }}
          onTaskCompleted={handleTaskCompleted}
          onTaskFailed={handleTaskFailed}
        />
      )}
    </div>
  );
};

export default TasksPage;
