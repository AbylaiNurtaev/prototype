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
  const startupCode = getStartupCode() || "default"; // Если нет реферального кода - используем 'default'

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🔐 НАЧАЛО ЛОГИНА");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📦 InitData:", initData);
  console.log("🔑 Startup Code:", startupCode);
  console.log("🧪 Test Mode:", testMode);

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

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    return response.data;
  } catch (error) {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    throw error;
  }
};

/**
 * Получение баланса пользователя
 * @param {boolean} testMode - Режим тестирования
 */
export const getBalance = async (testMode = true) => {
  const initData = getInitData();

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("💰 ПОЛУЧЕНИЕ БАЛАНСА");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📦 InitData:", initData);
  console.log("🧪 Test Mode:", testMode);

  try {
    const response = await axiosInstance.get("/users/balance", {
      params: {
        initData: initData,
        ...(testMode && { test: "true" }),
      },
    });

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    return response.data;
  } catch (error) {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    throw error;
  }
};

/**
 * Получение Live Feed для терминала
 */
export const getLiveFeed = async () => {
  try {
    const response = await axiosInstance.get("/console/live-feed");
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Получение истории консоли
 * @param {boolean} testMode - Режим тестирования
 */
export const getConsoleHistory = async (testMode = true) => {
  const initData = getInitData();

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📜 ПОЛУЧЕНИЕ ИСТОРИИ КОНСОЛИ");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📦 InitData:", initData);
  console.log("🧪 Test Mode:", testMode);

  try {
    const response = await axiosInstance.get("/console/history", {
      params: {
        initData: initData,
        ...(testMode && { test: "true" }),
      },
    });

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    return response.data;
  } catch (error) {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
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
