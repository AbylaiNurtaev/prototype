import React, { useState, useEffect, useCallback, useRef } from "react";
import styles from "./TaskPopup.module.scss";
import {
  checkExternalTask,
  claimExternalTask,
  claimTask,
  confirmBannerView,
} from "../services/api";
import providerManager from "../services/adProviders/ProviderManager";

const TaskPopup = ({ task, onClose, onTaskCompleted, onTaskFailed }) => {
  if (!task) return null;

  const [isChecking, setIsChecking] = useState(false);
  const [isLoadingBanner, setIsLoadingBanner] = useState(false);
  const [bannerData, setBannerData] = useState(null);
  const adsgramTaskRef = useRef(null);
  const adsgramContainerRef = useRef(null);

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

  // Обработчик успешного просмотра рекламы
  const handleBannerReward = useCallback(async () => {
    try {
      // Подтверждаем просмотр/клик на бэкенде
      const action =
        details.action || (taskType === "banners-cpc" ? "click" : "view");

      await confirmBannerView(task.id, "adsgram-cpc", false);

      // Обновляем прогресс задания
      const updatedProgress = (apiData.user_progress || 0) + 1;
      const targetProgress = apiData.target_progress || 1;

      if (updatedProgress >= targetProgress) {
        // Задание выполнено, забираем награду
        await claimTask(task.id, false);
        if (onTaskCompleted) {
          onTaskCompleted(task.id, false);
        }
      } else {
        // Обновляем прогресс
        if (onTaskCompleted) {
          onTaskCompleted(task.id, false);
        }
      }
    } catch (error) {
      console.error("❌ Ошибка подтверждения просмотра:", error);
      if (onTaskFailed) {
        onTaskFailed();
      }
    }
  }, [
    task.id,
    taskType,
    details.action,
    apiData.user_progress,
    apiData.target_progress,
    onTaskCompleted,
    onTaskFailed,
  ]);

  // Инициализация компонента adsgram-task
  useEffect(() => {
    if (!isBanner || !adsgramContainerRef.current) return;

    const container = adsgramContainerRef.current;

    // Определяем blockId в зависимости от типа задания
    // Для CPC заданий используется формат "task-XXXXX", для CPM - просто цифры
    const blockId = taskType === "banners-cpc" ? "task-18088" : "18010";

    // Создаем элемент adsgram-task
    const adsgramElement = document.createElement("adsgram-task");
    adsgramElement.setAttribute("data-block-id", blockId);
    adsgramElement.setAttribute("data-debug", "true");
    adsgramElement.setAttribute("data-debug-console", "false");
    adsgramElement.className = "task";
    adsgramElement.style.display = "none";

    container.appendChild(adsgramElement);
    adsgramTaskRef.current = adsgramElement;

    // Обработчик успешного просмотра рекламы
    const handleReward = () => {
      console.log("✅ Реклама просмотрена успешно!");
      handleBannerReward();
    };

    // Обработчик ошибки
    const handleError = (event) => {
      console.error("❌ Ошибка при показе рекламы:", event.detail);
      if (onTaskFailed) {
        onTaskFailed();
      }
    };

    // Подписываемся на события
    adsgramElement.addEventListener("adsgram:reward", handleReward);
    adsgramElement.addEventListener("adsgram:error", handleError);

    return () => {
      adsgramElement.removeEventListener("adsgram:reward", handleReward);
      adsgramElement.removeEventListener("adsgram:error", handleError);
      if (container.contains(adsgramElement)) {
        container.removeChild(adsgramElement);
      }
    };
  }, [isBanner, taskType, handleBannerReward, onTaskFailed]);

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
        const checkResult = await checkExternalTask(provider, task.id);
        console.log("🔍 Результат проверки внешнего задания:", checkResult);

        // Если задание в обработке (WAITING), закрываем попап и обновляем список
        if (checkResult?.status === "WAITING") {
          console.log("⏳ Задание отправлено в обработку");
          // Обновляем статус задания на WAITING
          if (onTaskCompleted) {
            onTaskCompleted(task.id, true); // true = WAITING статус
          }
          return;
        }

        const result = await claimExternalTask(provider, task.id);
        console.log("✅ Внешнее задание выполнено:", result);
      } else {
        // Для обычных заданий (banners, sponsors)
        const result = await claimTask(task.id);
        console.log("✅ Задание выполнено:", result);
      }

      // Вызываем колбэк для показа toast и обновления списка
      // Колбэк сам закроет попап
      if (onTaskCompleted) {
        onTaskCompleted(task.id);
      }
    } catch (error) {
      console.error("❌ Ошибка проверки задания:", error);

      // Вызываем колбэк для показа toast с ошибкой
      // Колбэк сам закроет попап
      if (onTaskFailed) {
        onTaskFailed();
      }
    } finally {
      setIsChecking(false);
    }
  };

  // Обработчик для баннеров (клики и просмотры) - используем компонент adsgram-task
  const handleBannerAction = async () => {
    if (isLoadingBanner || !adsgramTaskRef.current) return;

    setIsLoadingBanner(true);
    try {
      console.log("🎯 Показываем рекламу через Adsgram компонент");
      console.log(`   Задание: ${task.name} (ID: ${task.id})`);

      // Запускаем показ рекламы через компонент adsgram-task
      const adsgramElement = adsgramTaskRef.current;

      // Пробуем разные способы запуска рекламы
      if (adsgramElement && typeof adsgramElement.show === "function") {
        await adsgramElement.show();
      } else if (adsgramElement && typeof adsgramElement.click === "function") {
        adsgramElement.click();
      } else {
        // Если методы не доступны, создаем событие
        const clickEvent = new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
        });
        adsgramElement.dispatchEvent(clickEvent);
      }
    } catch (error) {
      console.error("❌ Ошибка показа рекламы:", error);
      if (onTaskFailed) {
        onTaskFailed();
      }
    } finally {
      setIsLoadingBanner(false);
    }
  };

  // Обработчик клика по загруженному баннеру (не используется для Adsgram, но оставляем для совместимости)
  const handleBannerClick = async () => {
    // Для Adsgram реклама показывается сразу, этот метод не используется
    // Но оставляем для совместимости с другими типами заданий
    if (!bannerData || isLoadingBanner) return;

    setIsLoadingBanner(true);
    try {
      // Для заданий с Adsgram просто показываем рекламу
      await showAdsgramAd();
    } catch (error) {
      console.error("❌ Ошибка показа рекламы:", error);
      if (onTaskFailed) {
        onTaskFailed();
      }
    } finally {
      setIsLoadingBanner(false);
    }
  };

  // Старый метод для других провайдеров (оставляем для совместимости)
  const handleBannerClickOld = async () => {
    if (!bannerData || isLoadingBanner) return;

    setIsLoadingBanner(true);
    try {
      // Инициализируем менеджер провайдеров
      await providerManager.initialize();

      // Получаем провайдер и показываем рекламу через него
      const provider = providerManager.getProvider(bannerData.provider);
      if (!provider) {
        console.error(`❌ Провайдер ${bannerData.provider} не найден`);
        if (onTaskFailed) {
          onTaskFailed();
        }
        return;
      }

      // Используем сохраненные данные рекламы или загружаем заново
      const adData = bannerData.adData || (await provider.loadAd());
      console.log(`🔗 Показываем рекламу через ${bannerData.provider}...`);

      const result = await provider.showAd(adData);

      if (!result.success) {
        console.error("❌ Реклама не была показана успешно:", result);
        if (onTaskFailed) {
          onTaskFailed();
        }
        return;
      }

      // Подтверждаем просмотр/клик на бэкенде
      console.log(`\n📤 Подтверждение просмотра...`);
      const confirmResult = await confirmBannerView(
        bannerData.taskId,
        bannerData.provider
      );

      // Проверяем прогресс
      const newProgress =
        confirmResult?.user_progress || apiData.user_progress + 1;
      const targetProgress = apiData.target_progress || 1;
      const isFullyCompleted = newProgress >= targetProgress;

      console.log(
        `✅ Подтверждено! Прогресс: ${newProgress}/${targetProgress} ${
          isFullyCompleted ? "🎉 Завершено!" : "🔄 Продолжаем"
        }`
      );
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

      // Закрываем попап
      onClose();

      // Показываем toast об успехе
      if (isFullyCompleted) {
        if (onTaskCompleted) {
          onTaskCompleted(task.id, false);
        }
      }

      // Перезагружаем страницу заданий
      window.dispatchEvent(new Event("bannerCompleted"));
    } catch (error) {
      console.error("❌ Ошибка обработки рекламы:", error);
      if (onTaskFailed) {
        onTaskFailed();
      }
    } finally {
      setIsLoadingBanner(false);
    }
  };

  // Для баннеров
  if (isBanner) {
    // Определяем action: из details или из типа задания
    const action =
      details.action || (taskType === "banners-cpc" ? "click" : "view");
    const actionText =
      action === "click" ? "Кликни на баннер" : "Посмотри рекламу";
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
            {actionText} и получи{" "}
            <span style={{ color: "#FFD700" }}>{task.energy} энергии</span>
          </div>

          <div className={styles.bannerProgress}>Прогресс: {task.progress}</div>

          {/* Контейнер для компонента adsgram-task */}
          <div ref={adsgramContainerRef} style={{ display: "none" }} />

          <div className={styles.buttonsContainer}>
            <button
              className={styles.subscribeButton}
              style={{ width: "100%" }}
              onClick={handleBannerAction}
              disabled={isLoadingBanner}
            >
              {isLoadingBanner
                ? "Загрузка..."
                : action === "click"
                ? "Кликнуть на баннер"
                : "Посмотреть рекламу"}
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
  const taskPhoto = details.photo || details.icon || null;
  const taskLink = viewDetails.link || details.link || "#";
  const buttonText = details.button_start_task_text || "Подписаться";
  const isExternalProvider =
    task.apiData?.provider === "flyer" || task.apiData?.provider === "subgram";
  const showInitialAvatar = isExternalProvider && !taskPhoto;
  const fallbackInitial = showInitialAvatar
    ? (task.name?.trim()?.[0] || "?").toUpperCase()
    : null;

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
          {showInitialAvatar ? (
            <div className={styles.initialAvatar}>{fallbackInitial}</div>
          ) : (
            <img
              src={taskPhoto || "/tasks/check.png"}
              alt={task.name}
              className={styles.taskIcon}
            />
          )}
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
              window.open(taskLink, "_blank");
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
