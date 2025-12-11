import axiosInstance from "./axios";

// Для тестирования - полный initData из Telegram
const TEST_INIT_DATA =
  "user=%7B%22id%22%3A5056024242%2C%22first_name%22%3A%22%3C%5C%2Fabeke%3E%22%2C%22last_name%22%3A%22%22%2C%22username%22%3A%22abylaikak%22%2C%22language_code%22%3A%22ru%22%2C%22allows_write_to_pm%22%3Atrue%2C%22photo_url%22%3A%22https%3A%5C%2F%5C%2Ft.me%5C%2Fi%5C%2Fuserpic%5C%2F320%5C%2FAj3hfrbNq8PfLLKvsSp3-WizcXTc3HO8Vynsw3R1a1A5spK3fDmZERABNoOGLEQN.svg%22%7D&chat_instance=-4908992446394523843&chat_type=private&auth_date=1735556539&signature=pgNJfzcxYGAcJCJ_jnsYEsmiTJJxOP2tNKb941-fT7QcsUQ2chSkFcItG8KvjR_r3nH0vem4bxtlltuyX-IwBQ&hash=c0b510163f5b1dea53172644df35e63458216a9d5d9a10413af4f5b0204bb493";

/**
 * Получает initData из Telegram WebApp или использует тестовые данные
 */
export const getInitData = () => {
  const tg = window?.Telegram?.WebApp;

  // В режиме разработки или если нет Telegram - используем тестовые данные
  if (!tg || !tg.initData) {
    console.log("🔧 Используем тестовый initData для разработки");
    return TEST_INIT_DATA;
  }

  return tg.initData;
};

/**
 * Получает startup_code (реферальный код) из Telegram WebApp
 */
export const getStartupCode = () => {
  const tg = window?.Telegram?.WebApp;
  return tg?.initDataUnsafe?.start_param || "";
};

/**
 * Логин пользователя
 * @param {boolean} testMode - Режим тестирования
 */
export const loginUser = async (testMode = true) => {
  const initData = getInitData();
  const startupCode = getStartupCode() || "default";

  try {
    const response = await axiosInstance.post(
      `/users/login/${startupCode}`,
      null,
      {
        params: {
          initData: initData,
          ...(testMode && { test: "true" }),
        },
      }
    );

    return response.data;
    console.log(response.data);
  } catch (error) {
    throw error;
  }
};

/**
 * Получение баланса пользователя
 * @param {boolean} testMode - Режим тестирования
 */
export const getBalance = async (testMode = true) => {
  const initData = getInitData();

  try {
    const response = await axiosInstance.get("/users/balance", {
      params: {
        initData: initData,
        ...(testMode && { test: "true" }),
      },
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Получение Live Feed для терминала
 * @param {boolean} testMode - Режим тестирования
 */
export const getLiveFeed = async (testMode = true) => {
  const initData = getInitData();

  try {
    const response = await axiosInstance.get("/console/live-feed", {
      params: {
        initData: initData,
        ...(testMode && { test: "true" }),
      },
    });
    return response.data;
  } catch (error) {
    console.error("❌ Ошибка получения Live Feed:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Получение истории консоли
 * @param {boolean} testMode - Режим тестирования
 */
export const getConsoleHistory = async (testMode = true) => {
  const initData = getInitData();

  try {
    const response = await axiosInstance.get("/console/history", {
      params: {
        initData: initData,
        ...(testMode && { test: "true" }),
      },
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Начать поиск через консоль
 * @param {boolean} testMode - Режим тестирования
 */
export const consoleSearch = async (testMode = true) => {
  const initData = getInitData();

  try {
    const response = await axiosInstance.post("/console/search", null, {
      params: {
        initData: initData,
        ...(testMode && { test: "true" }),
      },
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Получение заданий по провайдеру
 * @param {string} provider - Провайдер (banners, sponsors)
 * @param {boolean} testMode - Режим тестирования
 */
export const getTasks = async (provider, testMode = true) => {
  const initData = getInitData();

  try {
    const response = await axiosInstance.get(`/tasks/${provider}/get`, {
      params: {
        initData: initData,
        ...(testMode && { test: "true" }),
      },
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Получение внешних заданий
 * @param {string} provider - Провайдер (subgram, flyer)
 * @param {boolean} testMode - Режим тестирования
 */
export const getExternalTasks = async (provider, testMode = true) => {
  const initData = getInitData();

  try {
    const response = await axiosInstance.get(
      `/tasks-external/${provider}/get`,
      {
        params: {
          initData: initData,
          ...(testMode && { test: "true" }),
        },
      }
    );

    if (provider === "subgram" || provider === "flyer") {
      console.log(
        `🧲 Внешние задания (${provider}):`,
        response.data?.tasks || response.data
      );
    }

    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Проверить внешнее задание
 * @param {string} provider - Провайдер (subgram, flyer)
 * @param {number} taskId - ID задания
 * @param {boolean} testMode - Режим тестирования
 */
export const checkExternalTask = async (provider, taskId, testMode = true) => {
  const initData = getInitData();

  try {
    const response = await axiosInstance.post(
      `/tasks-external/${provider}/check/${taskId}`,
      null,
      {
        params: {
          initData: initData,
          ...(testMode && { test: "true" }),
        },
      }
    );

    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Забрать награду за внешнее задание
 * @param {string} provider - Провайдер (subgram, flyer)
 * @param {number} taskId - ID задания
 * @param {boolean} testMode - Режим тестирования
 */
export const claimExternalTask = async (provider, taskId, testMode = true) => {
  const initData = getInitData();

  try {
    const response = await axiosInstance.post(
      `/tasks-external/${provider}/claim/${taskId}`,
      null,
      {
        params: {
          initData: initData,
          ...(testMode && { test: "true" }),
        },
      }
    );

    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Проверить и забрать обычное задание (banners, sponsors)
 * @param {number} taskId - ID задания
 * @param {boolean} testMode - Режим тестирования
 */
export const claimTask = async (taskId, testMode = true) => {
  const initData = getInitData();

  try {
    const response = await axiosInstance.post(`/tasks/claim/${taskId}`, null, {
      params: {
        initData: initData,
        ...(testMode && { test: "true" }),
      },
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Подтверждение просмотра/клика рекламы
 * @param {number} taskId - ID задания
 * @param {string} provider - Провайдер
 * @param {boolean} testMode - Режим тестирования
 */
export const confirmBannerView = async (taskId, provider, testMode = true) => {
  const initData = getInitData();

  try {
    const response = await axiosInstance.post(
      `/banners/${taskId}/${provider}`,
      null,
      {
        params: {
          initData: initData,
          ...(testMode && { test: "true" }),
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      `❌ Ошибка подтверждения баннера ${provider}:`,
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Получение курса обмена (сколько стоит 1 USDT к игровой валюте)
 * @param {boolean} testMode - Режим тестирования
 */
export const getExchangeRate = async (testMode = true) => {
  const initData = getInitData();

  try {
    const response = await axiosInstance.get("/users/exchange-rate", {
      params: {
        initData: initData,
        ...(testMode && { test: "true" }),
      },
    });

    return response.data;
  } catch (error) {
    console.error(
      "❌ Ошибка получения курса обмена:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Вывод средств (обмен игровой валюты на USDT)
 * @param {number} amount - Сумма в игровой валюте (BTC)
 * @param {boolean} testMode - Режим тестирования
 */
export const withdrawFunds = async (amount, testMode = true) => {
  const initData = getInitData();

  try {
    const response = await axiosInstance.post(
      "/users/withdraws",
      { amount }, // Request body как JSON
      {
        params: {
          initData: initData,
          ...(testMode && { test: "true" }),
        },
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "❌ Ошибка вывода средств:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Получение таблицы лидеров
 * @param {"all"|"month"} filter - Фильтр таблицы
 * @param {boolean} testMode - Режим тестирования
 */
export const getLeaders = async (filter = "month", testMode = true) => {
  const initData = getInitData();

  try {
    console.log("📊 [API] Загружаем лидеров", { filter });

    const response = await axiosInstance.get("/leaders", {
      params: {
        initData: initData,
        filter,
        ...(testMode && { test: "true" }),
      },
    });

    console.log("🏆 [API] Ответ лидеров:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "❌ Ошибка получения таблицы лидеров:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Реферальная информация пользователя
 * @param {boolean} testMode - Режим тестирования
 */
export const getReferralInfo = async (testMode = true) => {
  const initData = getInitData();

  try {
    console.log("🤝 [API] Загружаем данные рефералок");

    const response = await axiosInstance.get("/ref/user", {
      params: {
        initData: initData,
        ...(testMode && { test: "true" }),
      },
    });

    console.log("🔗 [API] Реферальные данные:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "❌ Ошибка получения реферальных данных:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Заявка на получение реферальной награды при входе
 * @param {boolean} testMode - Режим тестирования
 */
export const claimReferralReward = async (testMode = true) => {
  const initData = getInitData();

  try {
    console.log("🪙 [API] Отправляем запрос /ref/claim");

    const response = await axiosInstance.post("/ref/claim", null, {
      params: {
        initData: initData,
        ...(testMode && { test: "true" }),
      },
    });

    console.log("✅ [API] /ref/claim ответ:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "❌ Ошибка запроса /ref/claim:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Получение информации о пользователе по user_id
 * @param {number|string} userId - ID пользователя
 * @param {boolean} testMode - Режим тестирования
 */
export const getUserInfo = async (userId, testMode = true) => {
  const initData = getInitData();

  try {
    console.log(`👤 [API] Загружаем информацию о пользователе ${userId}`);
    console.log(`🔗 [API] Путь: /info/${userId}`);

    // Пробуем путь /info/{user_id} согласно документации
    const response = await axiosInstance.get(`/info/${userId}`, {
      params: {
        initData: initData,
        ...(testMode && { test: "true" }),
      },
    });

    console.log(`✅ [API] Информация о пользователе ${userId}:`, response.data);
    return response.data;
  } catch (error) {
    console.error(
      `❌ Ошибка получения информации о пользователе ${userId}:`,
      error.response?.status,
      error.response?.data || error.message
    );
    console.error(
      `❌ [API] Полный URL: ${axiosInstance.defaults.baseURL}/info/${userId}`
    );
    throw error;
  }
};
