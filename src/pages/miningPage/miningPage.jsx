import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import styles from "../Page.module.scss";
import FoundPopup from "../../components/FoundPopup";
import NotFoundPopup from "../../components/NotFoundPopup";
import {
  getBalance,
  getLiveFeed,
  getConsoleHistory,
  consoleSearch,
} from "../../services/api";

const MiningPage = ({ showPopup, setShowPopup }) => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("token_finder");
  const [isScanning, setIsScanning] = useState(false);
  const [showNotFoundPopup, setShowNotFoundPopup] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const SLIDE_GAP = 20;
  const sliderContainerRef = React.useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);

  const [isTouching, setIsTouching] = useState(false);
  const touchStartXRef = React.useRef(0);
  const [touchDelta, setTouchDelta] = useState(0);

  const [terminalLogs, setTerminalLogs] = useState([]);
  const terminalRef = React.useRef(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const scrollTimeoutRef = React.useRef(null);

  const [liveFeedMessages, setLiveFeedMessages] = useState([]);
  const isTerminalInitialized = React.useRef(false); // Флаг инициализации терминала
  const isLiveFeedLoadingRef = React.useRef(false); // Защита от одновременных загрузок лайв-ленты

  const [tgUser, setTgUser] = useState(null);
  const [startParam, setStartParam] = useState(null);
  const [rawInitData, setRawInitData] = useState(null);

  const [inputCode, setInputCode] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const [foundAmount, setFoundAmount] = useState(0); // Количество найденных BTC
  const inputRef = React.useRef(null);
  const addFinalMessagesRef = React.useRef(null);
  const typingTimersRef = React.useRef([]); // Массив для хранения активных таймеров печати

  // Баланс пользователя
  const [balance, setBalance] = useState({
    btc: 0,
    energy: 0,
  });

  // Загрузка начальных данных: баланс, live feed, история консоли
  useEffect(() => {
    // Защита от повторного вызова (React Strict Mode)
    if (isTerminalInitialized.current) {
      console.log("⚠️ Терминал уже инициализирован, пропускаем");
      return;
    }

    // Ждем пока загрузится tgUser из Telegram
    if (!tgUser) {
      console.log("⏳ Ждем загрузки данных Telegram...");
      return;
    }

    isTerminalInitialized.current = true;

    const fetchInitialData = async () => {
      try {
        console.log("🔄 МАЙНИНГ: Начинаем загрузку баланса...");

        // Загружаем баланс
        const balanceData = await getBalance();
        console.log("💰 МАЙНИНГ: Баланс получен от API:", balanceData);
        console.log("💰 МАЙНИНГ: balanceData.wallet:", balanceData?.wallet);
        console.log("💰 МАЙНИНГ: BTC:", balanceData?.wallet?.btc);
        console.log("💰 МАЙНИНГ: Light (energy):", balanceData?.wallet?.light);

        if (balanceData && balanceData.wallet) {
          const btcValue = parseFloat(balanceData.wallet.btc || 0);
          const energyValue = parseFloat(balanceData.wallet.light || 0);

          console.log(
            "💰 МАЙНИНГ: Устанавливаем баланс - BTC:",
            btcValue,
            "Energy:",
            energyValue
          );

          setBalance({
            btc: btcValue,
            energy: energyValue,
          });
        } else {
          console.warn("⚠️ МАЙНИНГ: balanceData.wallet отсутствует!");
        }

        // Загружаем Live Feed один раз при монтировании
        await updateLiveFeed();

        // Загружаем историю консоли (только для лога, не показываем в терминале)
        const historyData = await getConsoleHistory();
        console.log("📜 История консоли из API:");
        console.log(historyData);

        // Формируем начальные приветственные сообщения с реальным username из Telegram
        const username = tgUser.username || `user${tgUser.id}` || "username";
        const displayName =
          tgUser.first_name ||
          tgUser.username ||
          tgUser.last_name ||
          "Пользователь";
        const btcBalance = parseFloat(balanceData?.wallet?.btc || 0);
        const energyBalance = parseFloat(balanceData?.wallet?.light || 0);

        console.log("👤 Используем Telegram username:", username);

        const initialMessages = [
          "[BOOT] Подключение к BTC Prototype...",
          `[AUTH] Пользователь: @${username} — проверка доступа...`,
          "[OK] Соединение установлено",
          `[DATA] Игровой баланс: ${btcBalance}₿ • Энергия: ${energyBalance}`,
          "[INFO] Готово к поиску. Нажми «Поиск», чтобы начать скан.",
        ];

        // Анимированное добавление начальных сообщений
        let messageIndex = 0;
        const addInitialMessage = () => {
          if (messageIndex < initialMessages.length) {
            setTerminalLogs((prev) => [initialMessages[messageIndex], ...prev]);
            messageIndex++;
            setTimeout(addInitialMessage, 500);
          }
        };

        // Запускаем анимацию через 1 секунду
        setTimeout(addInitialMessage, 1000);
      } catch (error) {
        console.error("❌ Ошибка загрузки данных:", error);
      }
    };

    fetchInitialData();
  }, [tgUser]);

  // Функция обновления лайв-ленты
  const updateLiveFeed = async () => {
    // Защита от одновременных загрузок
    if (isLiveFeedLoadingRef.current) {
      console.log("⏳ Лайв-лента уже загружается, пропускаем");
      return;
    }

    try {
      isLiveFeedLoadingRef.current = true;
      const liveFeedData = await getLiveFeed();

      // Фильтруем и сразу показываем все валидные сообщения без очереди
      if (liveFeedData && Array.isArray(liveFeedData)) {
        // Фильтруем только валидные сообщения
        const validMessages = liveFeedData.filter((msg) => {
          if (!msg || typeof msg !== "object") return false;
          const amount = Number(msg.amount || 0);
          const address = msg.adress || msg.address;
          return amount > 0 && !!address;
        });

        // Убираем дубликаты по адресу и сумме
        const uniqueMessages = validMessages.filter((msg, index, self) => {
          const address = msg.adress || msg.address;
          const amount = msg.amount;
          return (
            index ===
            self.findIndex(
              (m) => (m.adress || m.address) === address && m.amount === amount
            )
          );
        });

        // Сразу устанавливаем все сообщения без очереди
        setLiveFeedMessages(uniqueMessages.slice(0, 50)); // Ограничиваем до 50
      }
    } catch (error) {
      console.error("❌ Ошибка обновления Live Feed:", error);
    } finally {
      isLiveFeedLoadingRef.current = false;
    }
  };

  // Обновление лайв-ленты при переходе на страницу майнинга
  useEffect(() => {
    if (location.pathname === "/mining") {
      updateLiveFeed();
    }
  }, [location.pathname]);

  // Обновление лайв-ленты после успешного BTC поиска
  useEffect(() => {
    if (showPopup && foundAmount > 0) {
      // Обновляем лайв-ленту когда показывается попап с найденным BTC
      updateLiveFeed();
    }
  }, [showPopup, foundAmount]);

  useEffect(() => {
    console.log("🚀 МАЙНИНГ: useEffect для загрузки Telegram user запущен");
    const tg = window?.Telegram?.WebApp;

    console.log("🔍 Debug - tg exists:", !!tg);

    if (!tg) {
      const fallbackUser = {
        username: "username_telegram",
        first_name: "Пользователь",
        id: 12345,
      };
      setTgUser(fallbackUser);
      console.log(
        "🔧 МАЙНИНГ: Development mode - Fallback user:",
        fallbackUser
      );
      return;
    }

    tg.ready();
    tg.expand?.();

    console.log("🔍 Debug - tg.initDataUnsafe:", tg.initDataUnsafe);
    console.log("🔍 Debug - tg.initDataUnsafe?.user:", tg.initDataUnsafe?.user);
    console.log("🔍 Debug - full tg object:", tg);

    const u = tg.initDataUnsafe?.user || tg.webAppInitData?.user || null;

    console.log("🔍 Debug - user object:", u);

    // Если нет user data от Telegram - используем fallback
    if (!u) {
      console.log("⚠️ МАЙНИНГ: User data not available - используем fallback");
      const fallbackUser = {
        username: "username_telegram",
        first_name: "Пользователь",
        id: 12345,
      };
      setTgUser(fallbackUser);
      console.log("🔧 МАЙНИНГ: Fallback user установлен:", fallbackUser);
    } else {
      setTgUser(u);
      console.log("👤 Telegram User Info:", {
        username: u.username || "не указан",
        first_name: u.first_name,
        last_name: u.last_name,
        id: u.id,
        language_code: u.language_code,
        is_premium: u.is_premium,
      });
    }

    setStartParam(tg.initDataUnsafe?.start_param ?? null);
    setRawInitData(tg.initData ?? null);
    console.log(
      "🔗 Start Param:",
      tg.initDataUnsafe?.start_param || "отсутствует"
    );
    console.log("📦 Init Data:", tg.initData ?? "отсутствует");
  }, []);

  const uiUser = useMemo(() => {
    if (!tgUser) {
      console.log("⚠️ uiUser: tgUser is null, using fallback");
      return { displayName: "Пользователь", username: "username_telegram" };
    }

    console.log("✅ uiUser: tgUser exists", tgUser);

    const displayName =
      tgUser.first_name || tgUser.username || tgUser.last_name || "name";
    const username =
      tgUser.username || `user${tgUser.id}` || "username_telegram";

    console.log("✅ uiUser final:", { displayName, username });

    return {
      displayName,
      username,
    };
  }, [tgUser]);

  // Генерация случайных сообщений удалена - используем только данные из API

  const scrollToTop = () => {
    if (terminalRef.current && !isUserScrolling)
      terminalRef.current.scrollTop = 0;
  };

  const handleTerminalScroll = () => {
    setIsUserScrolling(true);
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(
      () => setIsUserScrolling(false),
      2000
    );
  };

  // Этот useEffect больше не нужен - данные загружаются из API
  // Live Feed и Console History приходят из /api/console/live-feed и /api/console/history

  useEffect(() => {
    scrollToTop();
  }, [terminalLogs, liveFeedMessages]);

  // useEffect для генерации случайных сообщений удален - используем только данные из API

  useEffect(() => {
    const updateWidth = () => {
      if (sliderContainerRef.current)
        setContainerWidth(sliderContainerRef.current.clientWidth);
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const onTouchStart = (e) => {
    if (!sliderContainerRef.current) return;
    setIsTouching(true);
    touchStartXRef.current = e.touches[0].clientX;
    setTouchDelta(0);
  };
  const onTouchMove = (e) => {
    if (!isTouching) return;
    setTouchDelta(e.touches[0].clientX - touchStartXRef.current);
  };
  const onTouchEnd = () => {
    if (!isTouching) return;
    const threshold = 40;
    const delta = touchDelta;
    setIsTouching(false);
    setTouchDelta(0);
    if (delta < -threshold && currentSlide < 1) setCurrentSlide(1);
    else if (delta > threshold && currentSlide > 0) setCurrentSlide(0);
  };

  const getProgressBar = (percent) => {
    if (percent === undefined || percent === null || isNaN(percent)) return "";
    const numPercent = Number(percent);
    if (numPercent < 0) return "";
    if (numPercent > 100) return "";
    const blocks = 8;
    const filled = Math.floor((numPercent / 100) * blocks);
    const progressBar = "█".repeat(filled) + "░".repeat(blocks - filled);
    return `${progressBar} ${numPercent}%`;
  };

  const generateRandomCode = () => {
    const chars = "0123456789ABCDEF";
    const length = 8; // Фиксированная длина для стабильности
    let hash = "";
    for (let i = 0; i < length; i++) {
      hash += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `${hash}`;
  };

  // Функция для очистки всех таймеров печати
  const clearTypingTimers = () => {
    typingTimersRef.current.forEach((timerId) => {
      clearTimeout(timerId);
    });
    typingTimersRef.current = [];
    setIsTyping(false);
    setInputCode("");
  };

  const typeCode = (code, totalDuration, onComplete) => {
    if (isTyping || !code) return;

    // Очищаем предыдущие таймеры, если есть
    clearTypingTimers();

    // Проверяем, что code - это строка и не пустая
    const codeStr = String(code || "");
    if (!codeStr || codeStr.length === 0) return;

    setIsTyping(true);
    setInputCode("");

    let index = 0;
    const totalLength = codeStr.length;
    const allChars = "0123456789ABCDEF";

    // Рассчитываем время на каждый символ
    const timePerChar = totalDuration / totalLength;

    const typeChar = () => {
      if (index < totalLength) {
        const targetChar = codeStr[index];

        // Рассчитываем количество попыток на основе доступного времени
        const attemptDuration = 60; // ms на одну попытку (быстрее анимация)
        const pauseAfterChar = 60; // ms пауза после символа
        const availableTime = timePerChar - pauseAfterChar;
        const maxAttempts = Math.max(
          3,
          Math.floor(availableTime / attemptDuration)
        );

        let attempts = 0;

        const tryChar = () => {
          if (attempts < maxAttempts) {
            // Показываем случайный символ
            const randomChar =
              allChars[Math.floor(Math.random() * allChars.length)];
            setInputCode(() => {
              const baseCode = codeStr.substring(0, index);
              return baseCode + randomChar;
            });
            attempts++;
            const timerId = setTimeout(tryChar, attemptDuration);
            typingTimersRef.current.push(timerId);
          } else {
            // Устанавливаем правильный символ
            index++;
            setInputCode(() => {
              return codeStr.substring(0, index);
            });

            // Проверяем, нужно ли продолжать
            if (index < totalLength) {
              const timerId = setTimeout(typeChar, pauseAfterChar);
              typingTimersRef.current.push(timerId);
            } else {
              setIsTyping(false);
              typingTimersRef.current = [];
              if (onComplete) {
                onComplete();
              }
            }
          }
        };

        tryChar();
      }
    };

    const initialTimerId = setTimeout(typeChar, 300);
    typingTimersRef.current.push(initialTimerId);
  };

  const renderLiveMessage = (msg, index) => {
    // Если msg - объект из API
    if (typeof msg === "object" && msg !== null) {
      const username =
        msg.user_data?.username || msg.user_data?.name || `user#${msg.user_id}`;
      const amount = msg.amount || 0;
      const address = msg.adress || msg.address || "";

      // Форматируем адрес: первые 4 и последние 2 символа
      const shortAddress =
        address.length > 6
          ? `${address.substring(0, 4)}..${address.substring(
              address.length - 2
            )}`
          : address;

      // Форматируем время из created_at
      let timeStr = "[--:--]";
      if (msg.created_at) {
        try {
          const date = new Date(msg.created_at);
          const hours = String(date.getHours()).padStart(2, "0");
          const minutes = String(date.getMinutes()).padStart(2, "0");
          timeStr = `[${hours}:${minutes}]`;
        } catch (e) {
          console.error("Ошибка парсинга даты:", e);
        }
      }

      // Формат: [19:26] > @username: 298₿ | 0x01..4z
      const before = `${timeStr} > @${username}: `;
      const after = ` | ${shortAddress}`;

      return (
        <div key={index} className={styles.logLine}>
          {before}
          <span className={styles.amountHighlight}>{amount}₿</span>
          {after}
        </div>
      );
    }

    // Если msg - строка (для обратной совместимости)
    if (typeof msg === "string") {
      const match = msg.match(/^(.*?)(\d+)₿(.*)$/);
      if (!match) {
        return (
          <div key={index} className={styles.logLine}>
            {msg}
          </div>
        );
      }
      const [, before, amount, after] = match;
      return (
        <div key={index} className={styles.logLine}>
          {before}
          <span className={styles.amountHighlight}>{amount}₿</span>
          {after}
        </div>
      );
    }

    // Fallback
    return (
      <div key={index} className={styles.logLine}>
        {String(msg)}
      </div>
    );
  };

  const startScan = async () => {
    if (isScanning) return;
    setIsScanning(true);
    setShowPopup(false);

    // Сразу обновляем баланс энергии (тратим 1 энергию)
    setBalance((prev) => ({
      ...prev,
      energy: Math.max(0, prev.energy - 1),
    }));

    const username = uiUser.username || "username";
    const displayName = uiUser.displayName || "Пользователь";

    // Сначала вызываем API для проверки
    try {
      const searchData = await consoleSearch();
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("🔍 РЕЗУЛЬТАТ ПОИСКА (/api/console/search):");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("📊 Полный объект:", searchData);
      console.log("📊 Status:", searchData?.status);
      console.log("📊 Wallet:", searchData?.wallet);
      console.log("📊 Amount:", searchData?.wallet?.amount);
      console.log("📊 Address:", searchData?.wallet?.adress);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

      // Проверяем, если статус "lose" или wallet пустой - генерируем рандомный код и показываем попап "Не найдено"
      const isWalletEmpty =
        !searchData?.wallet ||
        Object.keys(searchData.wallet || {}).length === 0;
      if (searchData?.status === "lose" || isWalletEmpty) {
        // Генерируем рандомный адрес для анимации
        const generateRandomAddress = () => {
          const chars = "0123456789abcdef";
          const prefix = "x0";
          let address = prefix;
          for (let i = 0; i < 10; i++) {
            address += chars[Math.floor(Math.random() * chars.length)];
          }
          return address;
        };

        const randomAddress = generateRandomAddress();
        setGeneratedCode(randomAddress);
        setFoundAmount(0);

        // Запускаем анимацию подбора рандомного кода
        const prepMessages = ["[SCAN] Подключение к узлам..."];
        let messageIndex = 0;
        const addPrepMessage = () => {
          if (messageIndex < prepMessages.length) {
            setTerminalLogs((prev) => [prepMessages[messageIndex], ...prev]);
            messageIndex++;
            setTimeout(addPrepMessage, 500);
          } else {
            setTerminalLogs((prev) => [
              `[NET] Синхронизация узлов ${getProgressBar(0)}`,
              ...prev,
            ]);

            const progressSteps = [0, 13, 28, 35, 50, 69, 72, 96, 100];
            let progressIndex = 0;
            const progressStepDuration = 400;
            const totalSyncDuration =
              progressSteps.length * progressStepDuration;

            // Запускаем подбор рандомного кода
            setTimeout(() => {
              // Чуть ускоряем подбор: завершаем раньше, чем дойдет прогресс до 100%
              typeCode(randomAddress, totalSyncDuration * 0.85, () => {
                // Подбор завершён, показываем попап "Не найдено"
                setIsScanning(false);
                setShowNotFoundPopup(true);
              });
            }, 300);

            const updateProgress = () => {
              if (progressIndex < progressSteps.length) {
                const currentPercent = progressSteps[progressIndex];
                setTerminalLogs((prev) => {
                  const newLogs = [...prev];
                  const netLineIndex = newLogs.findIndex(
                    (log) =>
                      log &&
                      typeof log === "string" &&
                      log.startsWith("[NET] Синхронизация узлов")
                  );
                  if (netLineIndex !== -1) {
                    newLogs[
                      netLineIndex
                    ] = `[NET] Синхронизация узлов ${getProgressBar(
                      currentPercent
                    )}`;
                  }
                  return newLogs;
                });
                progressIndex++;
                setTimeout(updateProgress, progressStepDuration);
              }
            };
            updateProgress();
          }
        };
        addPrepMessage();
        return;
      }

      // Берем реальный адрес и количество из API
      const walletAddress = searchData?.wallet?.adress || "x01unknown";
      const foundBtc = searchData?.wallet?.amount || 0;

      setGeneratedCode(walletAddress); // Сохраняем адрес для попапа
      setFoundAmount(foundBtc); // Сохраняем количество для попапа

      console.log("💎 Найденный адрес:", walletAddress);
      console.log("💰 Найденная сумма:", foundBtc, "BTC");

      // Если API вернул успешный результат - запускаем анимацию терминала
      const prepMessages = ["[SCAN] Подключение к узлам..."];

      let messageIndex = 0;
      const addPrepMessage = () => {
        if (messageIndex < prepMessages.length) {
          setTerminalLogs((prev) => [prepMessages[messageIndex], ...prev]);
          messageIndex++;
          setTimeout(addPrepMessage, 500);
        } else {
          setTerminalLogs((prev) => [
            `[NET] Синхронизация узлов ${getProgressBar(0)}`,
            ...prev,
          ]);

          const progressSteps = [0, 13, 28, 35, 50, 69, 72, 96, 100];
          let progressIndex = 0;

          // Рассчитываем общее время синхронизации
          const progressStepDuration = 400; // ms на каждый шаг
          const totalSyncDuration = progressSteps.length * progressStepDuration;

          // Запускаем подбор кода (реальный адрес) параллельно с синхронизацией
          setTimeout(() => {
            // Чуть ускоряем подбор: завершаем раньше, чем дойдет прогресс до 100%
            typeCode(walletAddress, totalSyncDuration * 0.85, () => {
              // Подбор кода завершён
            });
          }, 300);

          // Обновляем баланс после успешного поиска
          const refreshBalance = async () => {
            try {
              const balanceData = await getBalance();
              if (balanceData) {
                setBalance({
                  btc: parseFloat(balanceData.wallet?.btc || 0),
                  energy: parseFloat(balanceData.wallet?.light || 0),
                });
              }
            } catch (error) {
              console.error("❌ Ошибка обновления баланса:", error);
            }
          };
          refreshBalance();

          // Создаём финальные сообщения с данными из API
          const finalMessages = [
            "[HASH] Проверка блоков... ОК",
            "[DETECT] Найден активный адрес",
            `[ADDR] ${walletAddress}`,
            `[BALANCE] ${foundBtc} BTC`,
            `[BOT] Отличная находка, ${displayName}.`,
            "[INFO] Поиск завершён",
          ];

          // Сохраняем функцию для вызова после закрытия попапа
          addFinalMessagesRef.current = () => {
            let finalIndex = 0;
            const addFinal = () => {
              if (finalIndex < finalMessages.length) {
                setTerminalLogs((prev) => [finalMessages[finalIndex], ...prev]);
                finalIndex++;
                setTimeout(addFinal, 600);
              }
            };
            setTimeout(addFinal, 300);
          };

          const updateProgress = () => {
            if (progressIndex < progressSteps.length) {
              const currentPercent = progressSteps[progressIndex];
              setTerminalLogs((prev) => {
                const newLogs = [...prev];
                const netLineIndex = newLogs.findIndex(
                  (log) =>
                    log &&
                    typeof log === "string" &&
                    log.startsWith("[NET] Синхронизация узлов")
                );
                if (netLineIndex !== -1) {
                  newLogs[
                    netLineIndex
                  ] = `[NET] Синхронизация узлов ${getProgressBar(
                    currentPercent
                  )}`;
                }
                return newLogs;
              });
              progressIndex++;
              if (progressIndex < progressSteps.length) {
                setTimeout(updateProgress, progressStepDuration);
              } else {
                // Синхронизация и подбор кода завершены одновременно
                // Сразу показываем попап
                setTimeout(() => {
                  setIsScanning(false);
                  setShowPopup(true);
                }, 500);
              }
            }
          };

          setTimeout(updateProgress, 300);
        }
      };

      setTimeout(addPrepMessage, 300);
    } catch (error) {
      console.error("❌ Ошибка при поиске:", error);

      // В случае ошибки НЕ запускаем анимацию терминала
      // Просто показываем попап "Не найдено"
      setIsScanning(false);
      setShowNotFoundPopup(true);

      // Добавляем сообщение об ошибке в терминал
      setTerminalLogs((prev) => [
        "[ERROR] Поиск не дал результатов",
        "[INFO] Попробуйте еще раз",
        ...prev,
      ]);
    }
  };

  return (
    <div className={styles.page}>
      <img
        src="/profile/shineProfile.png"
        alt="shine"
        className={styles.shine}
      />
      <div className={styles.pageContent}>
        <div className={styles.prototypeText}>prototype</div>

        <div className={styles.balanceSection}>
          <div className={styles.balanceLabel}>Балансы</div>
          <div className={styles.balanceValues}>
            <div className={styles.balanceItem}>
              <img
                src="/mine-icons/bitcoin.svg"
                alt="bitcoin"
                className={styles.balanceIcon}
              />
              <span className={styles.balanceNumber}>{balance.btc}</span>
            </div>
            <div className={styles.balanceDivider}></div>
            <div className={styles.balanceItem}>
              <img
                src="/mine-icons/energy.png"
                alt="energy"
                className={styles.balanceIcon}
              />
              <span className={styles.balanceNumber}>{balance.energy}</span>
            </div>
          </div>
        </div>

        <div className={styles.welcomeSlider}>
          <div className={styles.welcomeCard}>
            <div className={styles.welcomeContent}>
              <div className={styles.symbolsRow}>
                <span className={styles.symbol}>#</span>
                <span className={styles.symbol}>$</span>
                <span className={styles.symbol}>%</span>
              </div>
              <div className={styles.welcomeText}>
                Удачного поиска, <br />
                {uiUser.displayName}!
              </div>
              <div className={styles.usernameText}>@{uiUser.username}</div>
            </div>
            <div className={styles.largeHash}>
              <img src="/mine-icons/reshetka.png" alt="hash" />
            </div>
          </div>
        </div>

        <div className={styles.buttonsContainer}>
          <button className={styles.primaryButton}>
            <img
              src="/mine-icons/ai-agent.svg"
              alt="ai-agent"
              className={styles.buttonIcon}
            />
            <span className={styles.buttonText}>AI-agent</span>
          </button>
          <button
            className={styles.secondaryButton}
            onClick={(e) => {
              e.preventDefault();
              const tg = window?.Telegram?.WebApp;
              const channelLink = "https://t.me/+hfu5I7llBuliYzI6";

              if (tg) {
                // Используем Telegram WebApp API для открытия ссылки
                if (tg.openTelegramLink) {
                  tg.openTelegramLink(channelLink);
                } else if (tg.openLink) {
                  tg.openLink(channelLink);
                }
              } else {
                // Fallback для dev режима
                window.open(channelLink, "_blank", "noopener,noreferrer");
              }
            }}
          >
            <img
              src="/mine-icons/tg.svg"
              alt="telegram"
              className={styles.buttonIcon}
            />
            <span className={styles.buttonText}>Телеграм</span>
          </button>
          <button className={styles.secondaryButton}>
            <img
              src="/mine-icons/concl.svg"
              alt="conclusions"
              className={styles.buttonIcon}
            />
            <span className={styles.buttonText}>Выводы</span>
          </button>
        </div>

        <div className={styles.terminalContainer}>
          <div className={styles.terminalTabs}>
            <div
              className={`${styles.tab} ${
                activeTab === "token_finder" ? styles.activeTab : ""
              }`}
              onClick={() => setActiveTab("token_finder")}
            >
              <img
                src="/mine-icons/token-finder.svg"
                alt="token-finder"
                className={styles.tabIcon}
              />
              <span className={styles.tabText}>BTC поиск</span>
            </div>
            <div
              className={`${styles.tab} ${
                activeTab === "live_feed" ? styles.activeTab : ""
              }`}
              onClick={() => setActiveTab("live_feed")}
            >
              <img
                src="/mine-icons/live.svg"
                alt="live"
                className={styles.liveFeedIcon}
              />
              <span className={styles.tabText}>Лайв лента</span>
            </div>
          </div>

          <div className={styles.terminalContent}>
            <div
              className={styles.terminalLogs}
              ref={terminalRef}
              onScroll={handleTerminalScroll}
            >
              {activeTab === "token_finder"
                ? terminalLogs
                    .filter((log) => log && log.trim() !== "")
                    .map((log, index) => (
                      <div key={index} className={styles.logLine}>
                        {log}
                      </div>
                    ))
                : liveFeedMessages
                    .slice(0, 20) // Рендерим только первые 20 для оптимизации
                    .map((msg, index) => renderLiveMessage(msg, index))}
              {/* Пустой элемент для верхнего отступа в консоли (в column-reverse он будет сверху) */}
              <div className={styles.terminalLogsSpacer}></div>
            </div>

            <div className={styles.terminalInput}>
              <div
                className={`${styles.inputField} ${
                  activeTab === "live_feed" ? styles.fullWidthInput : ""
                }`}
              >
                <span className={styles.prompt}>$</span>
                <div className={styles.inputWrapper}>
                  {!isTyping && !inputCode && (
                    <div className={styles.cursor}></div>
                  )}
                  <input
                    ref={inputRef}
                    type="text"
                    className={styles.terminalInputField}
                    value={inputCode ? String(inputCode) : ""}
                    readOnly
                    placeholder=""
                  />
                </div>
              </div>

              {activeTab === "token_finder" && (
                <button
                  className={styles.searchButton}
                  onClick={startScan}
                  disabled={isScanning}
                >
                  {isScanning ? (
                    <div className={styles.loadingDots}>
                      <div className={styles.dot}></div>
                      <div className={styles.dot}></div>
                      <div className={styles.dot}></div>
                      <div className={styles.dot}></div>
                    </div>
                  ) : (
                    <img
                      src="/mine-icons/search-button.png"
                      alt="search"
                      className={styles.searchButtonImage}
                    />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showPopup && (
        <FoundPopup
          onClose={() => {
            clearTypingTimers();
            setShowPopup(false);
            setGeneratedCode("");
            setFoundAmount(0);
            // Вызываем финальные сообщения после закрытия попапа
            if (addFinalMessagesRef.current) {
              addFinalMessagesRef.current();
            }
          }}
          walletAddress={generatedCode || "x01unknown"}
          collectedAmount={foundAmount || 0}
        />
      )}

      {showNotFoundPopup && (
        <NotFoundPopup
          onClose={() => {
            clearTypingTimers();
            setShowNotFoundPopup(false);
          }}
          onRetry={() => {
            clearTypingTimers();
            setShowNotFoundPopup(false);
          }}
        />
      )}
    </div>
  );
};

export default MiningPage;
