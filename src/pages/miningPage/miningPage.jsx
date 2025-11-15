import React, { useState, useEffect, useMemo } from "react";
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
  const liveFeedQueueRef = React.useRef([]); // Очередь новых сообщений из API
  const isTerminalInitialized = React.useRef(false); // Флаг инициализации терминала

  const [tgUser, setTgUser] = useState(null);
  const [startParam, setStartParam] = useState(null);
  const [rawInitData, setRawInitData] = useState(null);

  const [inputCode, setInputCode] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const inputRef = React.useRef(null);
  const addFinalMessagesRef = React.useRef(null);

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
    isTerminalInitialized.current = true;

    const fetchInitialData = async () => {
      try {
        // Загружаем баланс
        const balanceData = await getBalance();
        console.log("💰 Баланс загружен:", balanceData);

        if (balanceData) {
          setBalance({
            btc: balanceData.btc || balanceData.bitcoin || 0,
            energy: balanceData.energy || 0,
          });
        }

        // Загружаем Live Feed
        const liveFeedData = await getLiveFeed();
        console.log("📡 Live Feed загружен, получено записей:", liveFeedData?.length || 0);

        // Добавляем начальные данные в очередь для постепенного появления
        if (liveFeedData && Array.isArray(liveFeedData)) {
          liveFeedQueueRef.current = [...liveFeedData];
          console.log("📥 Начальная очередь:", liveFeedQueueRef.current.length);
        }

        // Загружаем историю консоли
        const historyData = await getConsoleHistory();
        console.log("📜 История консоли загружена");
        console.log("📜 Данные истории:", historyData);
        console.log("📜 Тип данных:", typeof historyData);
        console.log("📜 Это массив?:", Array.isArray(historyData));

        // Формируем начальные приветственные сообщения
        const username = uiUser?.username || "username";
        const displayName = uiUser?.displayName || "Пользователь";
        const btcBalance = balanceData?.btc || balanceData?.bitcoin || 0;
        const energyBalance = balanceData?.energy || 0;

        const initialMessages = [
          "[BOOT] Подключение к BTC Prototype...",
          `[AUTH] Пользователь: @${username} — проверка доступа...`,
          "[OK] Соединение установлено",
          `[DATA] Игровой баланс: ${btcBalance}₿ • Энергия: ${energyBalance}`,
          "[INFO] Готово к поиску. Нажми «Поиск», чтобы начать скан.",
        ];

        // Сохраняем историю из API если есть
        let apiHistory = [];
        if (historyData && Array.isArray(historyData)) {
          apiHistory = historyData.map((item) => {
            if (typeof item === 'string') {
              return item;
            }
            if (typeof item === 'object' && item !== null) {
              return `[${item.type || 'INFO'}] ${item.message || JSON.stringify(item)}`;
            }
            return String(item);
          });
        }

        // Анимированное добавление начальных сообщений
        // Сначала показываем историю из API если есть
        if (apiHistory.length > 0) {
          setTerminalLogs(apiHistory);
        }

        // Потом добавляем начальные сообщения по одному
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
  }, []);

  // Автоматическое обновление Live Feed каждые 10 секунд
  useEffect(() => {
    const updateLiveFeed = async () => {
      try {
        const liveFeedData = await getLiveFeed();
        console.log("🔄 Получено записей из API:", liveFeedData?.length || 0);

        // Добавляем новые записи в очередь
        if (liveFeedData && Array.isArray(liveFeedData)) {
          liveFeedQueueRef.current = [
            ...liveFeedQueueRef.current,
            ...liveFeedData,
          ];
          console.log("📥 В очереди записей:", liveFeedQueueRef.current.length);
        }
      } catch (error) {
        console.error("❌ Ошибка обновления Live Feed:", error);
      }
    };

    // Обновляем каждые 10 секунд
    const intervalId = setInterval(updateLiveFeed, 10000);

    // Очищаем интервал при размонтировании
    return () => clearInterval(intervalId);
  }, []);

  // Добавление записей из очереди по одной каждые 1-2 секунды
  useEffect(() => {
    const addMessageFromQueue = () => {
      if (liveFeedQueueRef.current.length > 0) {
        const nextMessage = liveFeedQueueRef.current.shift();
        
        setLiveFeedMessages((prev) => {
          const newMessages = [nextMessage, ...prev];
          // Ограничиваем до 50 записей для оптимизации
          return newMessages.slice(0, 50);
        });
        
        console.log("✅ Добавлено сообщение в Live Feed");
      }
    };

    // Добавляем по одной записи каждые 1-2 секунды
    const getRandomDelay = () => Math.random() * 1000 + 1000; // 1-2 секунды
    
    let timeoutId;
    const scheduleNext = () => {
      timeoutId = setTimeout(() => {
        addMessageFromQueue();
        scheduleNext();
      }, getRandomDelay());
    };
    
    scheduleNext();

    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    const tg = window?.Telegram?.WebApp;

    console.log("🔍 Debug - tg exists:", !!tg);

    if (!tg) {
      const fallbackUser = {
        username: "username_telegram",
        first_name: "Пользователь",
      };
      setTgUser(fallbackUser);
      console.log("🔧 Development mode - Fallback user:", fallbackUser);
      return;
    }

    tg.ready();
    tg.expand?.();

    console.log("🔍 Debug - tg.initDataUnsafe:", tg.initDataUnsafe);
    console.log("🔍 Debug - tg.initDataUnsafe?.user:", tg.initDataUnsafe?.user);
    console.log("🔍 Debug - full tg object:", tg);

    const u = tg.initDataUnsafe?.user || tg.webAppInitData?.user || null;

    console.log("🔍 Debug - user object:", u);

    setTgUser(u);
    setStartParam(tg.initDataUnsafe?.start_param ?? null);
    setRawInitData(tg.initData ?? null);

    if (u) {
      console.log("👤 Telegram User Info:", {
        username: u.username || "не указан",
        first_name: u.first_name,
        last_name: u.last_name,
        id: u.id,
        language_code: u.language_code,
        is_premium: u.is_premium,
      });
      console.log(
        "🔗 Start Param:",
        tg.initDataUnsafe?.start_param || "отсутствует"
      );
      console.log("📦 Init Data:", tg.initData ?? "отсутствует");
    } else {
      console.log(
        "⚠️ User data not available - initDataUnsafe?.user is null/undefined"
      );
    }
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

  const typeCode = (code, totalDuration, onComplete) => {
    if (isTyping || !code) return;

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
        const attemptDuration = 80; // ms на одну попытку
        const pauseAfterChar = 100; // ms пауза после символа
        const availableTime = timePerChar - pauseAfterChar;
        const maxAttempts = Math.max(
          5,
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
            setTimeout(tryChar, attemptDuration);
          } else {
            // Устанавливаем правильный символ
            index++;
            setInputCode(() => {
              return codeStr.substring(0, index);
            });

            // Проверяем, нужно ли продолжать
            if (index < totalLength) {
              setTimeout(typeChar, pauseAfterChar);
            } else {
              setIsTyping(false);
              if (onComplete) {
                onComplete();
              }
            }
          }
        };

        tryChar();
      }
    };

    setTimeout(typeChar, 300);
  };

  const renderLiveMessage = (msg, index) => {
    // Если msg - объект из API
    if (typeof msg === 'object' && msg !== null) {
      const username = msg.user_data?.username || msg.user_data?.name || `user#${msg.user_id}`;
      const amount = msg.amount || 0;
      const address = msg.adress || msg.address || '';
      
      // Форматируем адрес: первые 4 и последние 2 символа
      const shortAddress = address.length > 6 
        ? `${address.substring(0, 4)}..${address.substring(address.length - 2)}`
        : address;
      
      // Форматируем время из created_at
      let timeStr = '[--:--]';
      if (msg.created_at) {
        try {
          const date = new Date(msg.created_at);
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          timeStr = `[${hours}:${minutes}]`;
        } catch (e) {
          console.error('Ошибка парсинга даты:', e);
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
    if (typeof msg === 'string') {
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

    const username = uiUser.username || "username";
    const displayName = uiUser.displayName || "Пользователь";

    // Генерируем случайный код заранее для использования в input и в сообщении
    const randomCode = generateRandomCode();
    setGeneratedCode(randomCode); // Сохраняем код для передачи в попап

    // Сначала вызываем API для проверки
    try {
      const searchData = await consoleSearch();
      console.log("✅ Данные поиска получены:", searchData);

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

          // Запускаем подбор кода параллельно с синхронизацией
          setTimeout(() => {
            typeCode(randomCode, totalSyncDuration, () => {
              // Подбор кода завершён
            });
          }, 300);

          // Обновляем баланс из ответа API
          if (searchData && searchData.balance) {
            setBalance({
              btc: parseFloat(searchData.balance) || 0,
              energy: balance.energy, // Энергия остается прежней
            });
          }

          // Создаём финальные сообщения с данными из API
          const collectedAmount = searchData?.collected_amount || searchData?.amount || "0";
          const finalMessages = [
            "[HASH] Проверка блоков... ОК",
            "[DETECT] Найден активный адрес",
            `[ADDR] ${randomCode}`,
            `[BALANCE] ${collectedAmount} BTC`,
            `[BOT] Отличная находка, ${displayName}.`,
            "[INFO] Поиск завершён",
          ];

          // Сохраняем функцию для вызова после закрытия попапа
          addFinalMessagesRef.current = () => {
            let finalIndex = 0;
            const addFinal = () => {
              if (finalIndex < finalMessages.length) {
                setTerminalLogs((prev) => [
                  finalMessages[finalIndex],
                  ...prev,
                ]);
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
        src="/profile/shineProfile.svg"
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
                src="/mine-icons/energy.svg"
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
              <div className={styles.usernameText}>
                @{uiUser.username}
                {process.env.NODE_ENV === "development" && (
                  <div
                    style={{
                      fontSize: "10px",
                      color: "#888",
                      marginTop: "4px",
                    }}
                  >
                    Debug: {tgUser ? "has data" : "no data"}
                  </div>
                )}
              </div>
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
          <button className={styles.secondaryButton}>
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
                    <>
                      <span className={styles.searchText}>Поиск</span>
                      <img
                        src="/mine-icons/energywhite.svg"
                        alt="energy"
                        className={styles.lightningIcon}
                      />
                      <span className={styles.searchNumber}>1</span>
                    </>
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
            setShowPopup(false);
            setInputCode("");
            setGeneratedCode("");
            // Вызываем финальные сообщения после закрытия попапа
            if (addFinalMessagesRef.current) {
              addFinalMessagesRef.current();
            }
          }}
          walletAddress={generatedCode || "4f3a9b2Sas..."}
          collectedAmount={257}
        />
      )}

      {showNotFoundPopup && (
        <NotFoundPopup
          onClose={() => {
            setShowNotFoundPopup(false);
          }}
          onRetry={() => {
            setShowNotFoundPopup(false);
          }}
        />
      )}
    </div>
  );
};

export default MiningPage;
