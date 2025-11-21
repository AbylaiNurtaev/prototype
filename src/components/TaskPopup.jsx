import React, { useState, useEffect } from "react";
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

  // Обработчик для баннеров (клики и просмотры)
  const handleBannerAction = async () => {
    if (isLoadingBanner) return;

    setIsLoadingBanner(true);
    try {
      // Определяем тип действия
      const action =
        details.action || (taskType === "banners-cpc" ? "click" : "view");

      // Выбираем провайдера: сначала проверяем в данных, если нет - используем fallback
      let preferredProvider =
        details.banner_provider ||
        details.provider ||
        apiData.banner_provider ||
        provider ||
        viewDetails.provider;

      // Логируем начало обработки
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log(
        `🎯 БАННЕР - ${
          preferredProvider ? preferredProvider.toUpperCase() : "AUTO"
        }`
      );
      console.log(`   Задание: ${task.name} (ID: ${task.id})`);
      console.log(
        `   Тип: ${action === "click" ? "Клик (CPC)" : "Просмотр (CPM)"}`
      );
      console.log(
        `   Прогресс: ${apiData.user_progress}/${apiData.target_progress}`
      );
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

      // Инициализируем менеджер провайдеров
      await providerManager.initialize();

      // Получаем провайдер и загружаем рекламу
      let selectedProvider = null;
      let adData = null;

      if (preferredProvider) {
        // Пробуем использовать предпочтительный провайдер
        const provider = providerManager.getProvider(preferredProvider);
        if (provider) {
          const isAvailable = await provider.isAdAvailable();
          if (isAvailable) {
            selectedProvider = preferredProvider;
            adData = await provider.loadAd();
          }
        }
      }

      // Если предпочтительный провайдер не доступен, используем fallback
      if (!adData) {
        console.log("📡 Поиск доступного провайдера...");

        // Пробуем найти доступный провайдер
        const providerList = providerManager.getProvidersForAction(action);
        console.log(`📋 Проверяем провайдеров: ${providerList.join(", ")}`);

        const checkedProviders = [];
        for (const providerName of providerList) {
          const provider = providerManager.getProvider(providerName);
          if (!provider) {
            console.log(`⚠️ Провайдер ${providerName} не найден в менеджере`);
            checkedProviders.push({ name: providerName, status: "not_found" });
            continue;
          }

          try {
            console.log(`🔍 Проверяем ${providerName}...`);
            const isAvailable = await provider.isAdAvailable();
            checkedProviders.push({
              name: providerName,
              status: isAvailable ? "available" : "unavailable",
              reason: isAvailable
                ? "OK"
                : "SDK не загружен или реклама недоступна",
            });

            if (isAvailable) {
              console.log(`✅ ${providerName} доступен, загружаем рекламу...`);
              try {
                selectedProvider = providerName;
                adData = await provider.loadAd();
                console.log(`✅ Реклама успешно загружена от ${providerName}`);
                break;
              } catch (loadError) {
                console.error(
                  `❌ Ошибка загрузки рекламы от ${providerName}:`,
                  loadError
                );
                checkedProviders[checkedProviders.length - 1].status =
                  "load_error";
                checkedProviders[checkedProviders.length - 1].reason =
                  loadError.message;
                adData = null;
                selectedProvider = null;
                continue;
              }
            } else {
              console.log(`❌ ${providerName} недоступен`);
            }
          } catch (error) {
            console.error(`❌ [${providerName}] Ошибка проверки:`, error);
            checkedProviders.push({
              name: providerName,
              status: "error",
              reason: error.message,
            });
            continue;
          }
        }

        // Логируем результаты проверки всех провайдеров
        console.log("📊 Результаты проверки провайдеров:", checkedProviders);
      }

      if (!adData || !selectedProvider) {
        console.error("❌ Не удалось загрузить рекламу");
        console.error("💡 Возможные причины:");
        console.error("   1. SDK провайдеров не загружены в браузер");
        console.error("   2. Нет доступной рекламы у провайдеров");
        console.error("   3. Провайдеры не настроены (нет API ключей)");
        console.error(
          "💡 Решение: загрузите SDK провайдеров в index.html или через loadSDK()"
        );

        if (onTaskFailed) {
          onTaskFailed();
        }
        return;
      }

      console.log(`✅ Реклама загружена от ${selectedProvider}:`);
      console.log("Данные рекламы:", adData);

      // Сохраняем данные рекламы в стейт для отображения
      const bannerInfo = {
        title: adData.title || "",
        description: adData.description || "",
        image_url: adData.image_url || "",
        link: adData.link || "",
        provider: selectedProvider,
        action: action,
        taskId: task.id,
        adData: adData, // Сохраняем полные данные для показа
      };

      console.log("Сохраняем в state:", bannerInfo);
      setBannerData(bannerInfo);
    } catch (error) {
      console.error("❌ Ошибка обработки рекламы:", error);
      if (onTaskFailed) {
        onTaskFailed();
      }
    } finally {
      setIsLoadingBanner(false);
    }
  };

  // Обработчик клика по загруженному баннеру
  const handleBannerClick = async () => {
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
    const action = details.action; // "click" или "view"
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

          {!bannerData ? (
            // Показываем до загрузки баннера
            <>
              <div className={styles.iconContainer}>
                <img
                  src={task.icon}
                  alt={task.name}
                  className={styles.taskIcon}
                />
              </div>

              <div className={styles.taskTitle}>{task.name}</div>

              <div className={styles.bannerDescription}>
                {actionText} и получи{" "}
                <span style={{ color: "#FFD700" }}>{task.energy} энергии</span>
              </div>

              <div className={styles.bannerProgress}>
                Прогресс: {task.progress}
              </div>

              <div className={styles.buttonsContainer}>
                <button
                  className={styles.subscribeButton}
                  style={{ width: "100%" }}
                  onClick={handleBannerAction}
                  disabled={isLoadingBanner}
                >
                  {isLoadingBanner ? "Загрузка..." : "Загрузить рекламу"}
                </button>
              </div>
            </>
          ) : (
            // Показываем загруженный баннер
            <>
              <div className={styles.taskTitle}>
                {bannerData.title || task.name}
              </div>

              {bannerData.image_url && (
                <div style={{ width: "100%", marginBottom: "20px" }}>
                  <img
                    src={bannerData.image_url}
                    alt={bannerData.title}
                    style={{
                      width: "100%",
                      borderRadius: "12px",
                      objectFit: "cover",
                      maxHeight: "200px",
                    }}
                  />
                </div>
              )}

              {bannerData.description && (
                <div
                  className={styles.bannerDescription}
                  style={{ marginBottom: "20px" }}
                >
                  {bannerData.description}
                </div>
              )}

              <div className={styles.bannerProgress}>
                Прогресс: {task.progress}
              </div>

              <div className={styles.buttonsContainer}>
                <button
                  className={styles.subscribeButton}
                  style={{ width: "100%" }}
                  onClick={handleBannerClick}
                  disabled={isLoadingBanner}
                >
                  {isLoadingBanner ? "Обработка..." : buttonText}
                </button>
              </div>
            </>
          )}
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
