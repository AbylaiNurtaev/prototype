import React, { useCallback, useEffect, useRef, useState } from "react";
import styles from "./exchangePage.module.scss";

const ExchangePage = ({ onInputFocus }) => {
  const RATE_BTC_TO_USDT = 0.00012; // 100 BTC = 0.012 USDT
  const [btcValue, setBtcValue] = useState("");
  const [usdtValue, setUsdtValue] = useState("");
  const btcRef = useRef(null);
  const usdtRef = useRef(null);

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
    setUsdtValue((num * RATE_BTC_TO_USDT).toFixed(6));
  }, []);

  const handleUsdtChange = useCallback((e) => {
    const raw = e.target.value;
    setUsdtValue(raw);
    const num = parseNumber(raw);
    if (num === null) {
      setBtcValue("");
      return;
    }
    setBtcValue((num / RATE_BTC_TO_USDT).toFixed(6));
  }, []);

  const handleFocus = useCallback(() => {
    if (onInputFocus) onInputFocus(true);
  }, [onInputFocus]);

  const handleBlur = useCallback(() => {
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
      <div className={styles.exchangeCard}>
        {/* Заголовок */}
        <h2 className={styles.title}>Обменяйте игровую валюту на usdt</h2>

        {/* Инпуты с автоконвертацией */}
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

        {/* Кнопка вывода */}
        <button className={styles.withdrawButton}>Вывод</button>

        {/* Текущий курс */}
        <div className={styles.rateContainer}>
          <p className={styles.rateLabel}>Текущий курс вывода:</p>
          <div className={styles.rateValue}>
            <img
              className={styles.rateIcon}
              src="/exchange/btc.svg"
              alt="BTC"
            />
            <span>100</span>
            <span>=</span>
            <img
              className={styles.rateIcon}
              src="/exchange/usdt.png"
              alt="USDT"
            />
            <span>0.012 $</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExchangePage;
