# Настройка BunnyCDN для SPA (Single Page Application)

## Проблема
При обновлении страницы на маршрутах типа `/mining`, `/profile` и т.д. возникает ошибка 404, так как сервер не находит файл по этому пути.

## Решение

### Вариант 1: Настройка через панель управления BunnyCDN (Рекомендуется)

1. Войдите в панель управления BunnyCDN
2. Перейдите в раздел вашей зоны `btc-prototype`
3. Найдите раздел **"Edge Rules"** или **"Rules"**
4. Создайте новое правило:

   **Условие:**
   - Если запрашиваемый URL не является существующим файлом (не заканчивается на `.js`, `.css`, `.png`, `.svg`, `.jpg`, `.ico` и т.д.)

   **Действие:**
   - Перенаправить на `/index.html` с кодом 200 (не 301/302!)

5. Сохраните правило

### Вариант 2: Использование BunnyCDN API

Если у вас есть доступ к API, можно настроить правило через API:

```bash
curl -X POST "https://api.bunny.net/pullzone/{zoneId}/edgerules" \
  -H "AccessKey: YOUR_ACCESS_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "ActionType": 0,
    "TriggerMatchingType": 0,
    "Triggers": [
      {
        "Type": 0,
        "PatternMatchingType": 0,
        "PatternMatches": ["*"],
        "Parameter1": ""
      }
    ],
    "ActionParameter1": "/index.html",
    "ActionParameter2": "200"
  }'
```

### Вариант 3: Файл _redirects

Файл `_redirects` уже создан и загружен на сервер. Некоторые CDN автоматически читают этот файл, но BunnyCDN может не поддерживать его напрямую.

## Проверка

После настройки:
1. Откройте приложение: `https://btc-prototype.b-cdn.net/`
2. Перейдите на любой маршрут (например, `/mining`)
3. Обновите страницу (F5 или Cmd+R)
4. Страница должна загрузиться без ошибки 404

## Альтернативное решение

Если настройка правил не работает, можно использовать Hash Router вместо Browser Router в React Router, но это изменит URL (будет `/#/mining` вместо `/mining`).

