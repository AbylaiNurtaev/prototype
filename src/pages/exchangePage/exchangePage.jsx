import React, { useCallback, useEffect, useRef, useState } from "react";
import styles from "./exchangePage.module.scss";
import { getExchangeRate, withdrawFunds } from "../../services/api";

const ExchangePage = ({ onInputFocus }) => {
  const [exchangeRate, setExchangeRate] = useState(0.012); // Курс обмена (1 BTC = X USDT)
  const [btcValue, setBtcValue] = useState("");
  const [usdtValue, setUsdtValue] = useState("");
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const btcRef = useRef(null);
  const usdtRef = useRef(null);

  // Загружаем курс обмена при монтировании
  useEffect(() => {
    const loadExchangeRate = async () => {
      try {
        console.log("🔄 Загружаем курс обмена из API...");
        const rateData = await getExchangeRate();
        console.log("📊 Ответ от /api/users/exchange-rate:", rateData);
        
        // Парсим курс из ответа API
        let rate = 0.012; // Значение по умолчанию
        
        if (rateData?.rate) {
          rate = parseFloat(rateData.rate);
        } else if (rateData?.exchange_rate) {
          rate = parseFloat(rateData.exchange_rate);
        } else if (rateData?.usdt_rate) {
          rate = parseFloat(rateData.usdt_rate);
        } else if (typeof rateData === "number") {
          rate = rateData;
        } else if (rateData && typeof rateData === "object") {
          // Пробуем найти числовое значение в объекте
          const values = Object.values(rateData).filter(v => typeof v === "number");
          if (values.length > 0) {
            rate = values[0];
          }
        }
        
        console.log(`✅ Установлен курс обмена: 1 BTC = ${rate} USDT`);
        setExchangeRate(rate);
      } catch (error) {
        console.error("❌ Ошибка загрузки курса обмена:", error);
        console.log("⚠️ Используем значение по умолчанию: 0.012");
        // Используем значение по умолчанию при ошибке
        setExchangeRate(0.012);
      }
    };
    loadExchangeRate();
  }, []);

  const parseNumber = (raw) => {
    if (raw === "" || raw === null || typeof raw === "undefined") return null;
    const normalized = String(raw).replace(",", ".");
    const num = Number(normalized);
    return Number.isNaN(num) ? null : num;
  };

  const handleBtcChange = useCallback((e) => {
    const raw = e.target.value;
    setBtcValue(raw);
    const num = parseNumber(raw);
    if (num === null) {
      setUsdtValue("");
      return;
    }
    setUsdtValue((num * exchangeRate).toFixed(6));
  }, [exchangeRate]);

  const handleUsdtChange = useCallback((e) => {
    const raw = e.target.value;
    setUsdtValue(raw);
    const num = parseNumber(raw);
    if (num === null) {
      setBtcValue("");
      return;
    }
    setBtcValue((num / exchangeRate).toFixed(6));
  }, [exchangeRate]);

  const handleWithdraw = useCallback(async () => {
    const num = parseNumber(btcValue);
    if (num === null || num <= 0) {
      alert("Введите корректную сумму для вывода");
      return;
    }

    setIsWithdrawing(true);
    try {
      const result = await withdrawFunds(num);
      console.log("✅ Вывод успешен:", result);
      // Очищаем поля после успешного вывода
      setBtcValue("");
      setUsdtValue("");
      alert("Запрос на вывод отправлен успешно!");
    } catch (error) {
      console.error("❌ Ошибка вывода:", error);
      alert("Ошибка при выводе средств. Попробуйте позже.");
    } finally {
      setIsWithdrawing(false);
    }
  }, [btcValue]);

  const handleFocus = useCallback(() => {
    setIsInputFocused(true);
    if (onInputFocus) onInputFocus(true);
  }, [onInputFocus]);

  const handleBlur = useCallback(() => {
    setIsInputFocused(false);
    if (onInputFocus) onInputFocus(false);
  }, [onInputFocus]);

  useEffect(() => {
    const btcInput = btcRef.current;
    const usdtInput = usdtRef.current;

    if (btcInput) {
      btcInput.addEventListener("focus", handleFocus);
      btcInput.addEventListener("blur", handleBlur);
    }

    if (usdtInput) {
      usdtInput.addEventListener("focus", handleFocus);
      usdtInput.addEventListener("blur", handleBlur);
    }

    return () => {
      if (btcInput) {
        btcInput.removeEventListener("focus", handleFocus);
        btcInput.removeEventListener("blur", handleBlur);
      }
      if (usdtInput) {
        usdtInput.removeEventListener("focus", handleFocus);
        usdtInput.removeEventListener("blur", handleBlur);
      }
    };
  }, [handleFocus, handleBlur]);
  return (
    <div className={styles.exchangePage}>
      <div className={styles.bgImage}></div>
      <div className={styles.bgBottom} />
      <div className={styles.prototypeText}>prototype</div>
      <div
        className={`${styles.exchangeCard} ${
          isInputFocused ? styles.lifted : ""
        }`}
      >
        <h2 className={styles.title}>Обменяйте игровую валюту на usdt</h2>

        <div className={styles.inputsContainer}>
          <div className={styles.inputGroup}>
            <img
              className={styles.inputIcon}
              src="/exchange/btc.svg"
              alt="BTC"
            />
            <input
              className={styles.input}
              id="btcAmount"
              name="btcAmount"
              autoComplete="off"
              min="0"
              step="any"
              type="number"
              inputMode="decimal"
              placeholder="Введите сумму"
              value={btcValue}
              onChange={handleBtcChange}
              ref={btcRef}
            />
          </div>
          <div className={styles.inputGroup}>
            <img
              className={styles.inputIcon}
              src="/exchange/usdt.png"
              alt="USDT"
            />
            <input
              className={styles.input}
              type="number"
              inputMode="decimal"
              id="usdtAmount"
              name="usdtAmount"
              autoComplete="off"
              min="0"
              step="any"
              placeholder="Сколько я получу.."
              value={usdtValue}
              onChange={handleUsdtChange}
              ref={usdtRef}
            />
          </div>
        </div>

        <button 
          className={styles.withdrawButton} 
          onClick={handleWithdraw}
          disabled={isWithdrawing || !btcValue || parseNumber(btcValue) <= 0}
        >
          {isWithdrawing ? "Обработка..." : "Вывод"}
        </button>

        <div className={styles.rateContainer}>
          <p className={styles.rateLabel}>Текущий курс вывода:</p>
          <div className={styles.rateValue}>
            <img
              className={styles.rateIcon}
              src="/exchange/btc.svg"
              alt="BTC"
            />
            <span>1</span>
            <span>=</span>
            <img
              className={styles.rateIcon}
              src="/exchange/usdt.png"
              alt="USDT"
            />
            <span>{exchangeRate.toFixed(6)} $</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExchangePage;
