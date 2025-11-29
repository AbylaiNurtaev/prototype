import { useCallback, useEffect, useRef } from 'react';

/**
 * Хук для работы с Adexium рекламой
 * @param {Object} config - Конфигурация
 * @param {string} config.widgetId - ID виджета
 * @param {string} config.format - Формат рекламы ('interstitial' | 'push-like' | 'video')
 * @param {Function} config.onAdReceived - Колбэк при получении рекламы
 * @param {Function} config.onNoAdFound - Колбэк когда реклама не найдена
 * @param {Function} config.onReward - Колбэк при завершении просмотра рекламы
 * @returns {Function} Функция для запроса рекламы
 */
export function useAdexium({
  widgetId,
  onAdReceived,
  onNoAdFound,
  onReward,
  format = 'interstitial',
}) {
  const adexiumRef = useRef(null);

  const handleAdReceived = useCallback(
    (ad) => {
      if (adexiumRef.current) {
        adexiumRef.current.displayAd(ad);
      }
      if (onAdReceived) {
        onAdReceived(ad);
      }
    },
    [onAdReceived],
  );

  const handleNoAdFound = useCallback(() => {
    if (onNoAdFound) {
      onNoAdFound();
    }
  }, [onNoAdFound]);

  const handleAdPlaybackCompleted = useCallback(() => {
    if (onReward) {
      onReward();
    }
  }, [onReward]);

  useEffect(() => {
    if (!window.AdexiumWidget) {
      console.warn('[useAdexium] AdexiumWidget script not loaded');
      return;
    }

    const adexium = new window.AdexiumWidget({
      wid: widgetId,
      adFormat: format,
      debug: true,
    });

    adexiumRef.current = adexium;

    adexium.on('adReceived', handleAdReceived);
    adexium.on('noAdFound', handleNoAdFound);
    adexium.on('adPlaybackCompleted', handleAdPlaybackCompleted);

    return () => {
      adexium.off('adReceived', handleAdReceived);
      adexium.off('noAdFound', handleNoAdFound);
      adexium.off('adPlaybackCompleted', handleAdPlaybackCompleted);

      if (adexium.destroy) {
        adexium.destroy();
      }
      adexiumRef.current = null;
    };
  }, [widgetId, format, handleAdReceived, handleNoAdFound, handleAdPlaybackCompleted]);

  return useCallback(() => {
    if (adexiumRef.current) {
      adexiumRef.current.requestAd(format);
    }
  }, [format]);
}






