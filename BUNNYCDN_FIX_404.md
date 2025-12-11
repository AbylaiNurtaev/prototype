# Исправление 404 ошибки на BunnyCDN

## Проблема
При обновлении страницы `/mining` или других маршрутов выдает 404 ошибку.

## Решение: Настройка Edge Rules в BunnyCDN

### Вариант 1: Через панель управления (Рекомендуется)

1. **Зайди в панель BunnyCDN:**
   - Открой https://bunny.net
   - Войди в свой аккаунт
   - Перейди в **Pull Zones**

2. **Выбери зону `btc-prototype`**

3. **Перейди в раздел "Edge Rules"** (в левом меню)

4. **Нажми "Add Edge Rule"**

5. **Настрой правило:**

   **General:**
   - **Description:** `SPA Rewrite - Redirect to index.html`
   - **Enabled:** ✅ (включено)

   **Conditions (Условия):**
   - Нажми "Add Condition"
   - **Type:** `Request URL`
   - **Operator:** `Does not match regex`
   - **Value:** `\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|json|xml|txt|pdf|zip|webp|mp4|mp3)$`

   **Actions (Действия):**
   - Нажми "Add Action"
   - **Type:** `Rewrite`
   - **Value:** `/index.html`

6. **Сохрани правило**

7. **Проверь:**
   - Открой приложение
   - Перейди на `/mining`
   - Обнови страницу (F5)
   - Должно работать без 404

### Вариант 2: Через URL Rewrite (Альтернатива)

Если Edge Rules не работают:

1. В той же зоне перейди в **"URL Rewrite"**
2. Добавь правило:
   - **Pattern:** `^(?!.*\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|json|xml|txt|pdf|zip|webp|mp4|mp3)$).*$`
   - **Rewrite To:** `/index.html`
   - **Type:** `Rewrite`

### Вариант 3: Временное решение - HashRouter

Если Edge Rules настроить не получается, можно временно использовать HashRouter:

В файле `src/main.jsx` замени:
```javascript
import { BrowserRouter } from "react-router-dom";
```
на:
```javascript
import { HashRouter } from "react-router-dom";
```

И замени:
```javascript
<BrowserRouter>
```
на:
```javascript
<HashRouter>
```

**Минусы:** URL будут выглядеть как `/#/mining` вместо `/mining`

### Проверка правильности настройки

После настройки Edge Rules проверь:

1. Открой DevTools (F12)
2. Перейди на вкладку Network
3. Перейди на страницу `/mining`
4. Обнови страницу (F5)
5. Проверь запрос к `/mining`:
   - Должен вернуть статус 200 (не 404)
   - Должен вернуть содержимое `index.html`

### Если не работает

1. **Проверь кэш:**
   - Очисти кэш BunnyCDN (Purge Cache)
   - Очисти кэш браузера (Ctrl+Shift+Delete)

2. **Проверь порядок правил:**
   - Edge Rules выполняются по порядку
   - Правило для SPA должно быть первым или иметь высокий приоритет

3. **Проверь формат регулярного выражения:**
   - Убедись, что используется правильный синтаксис regex
   - В BunnyCDN может быть свой формат

4. **Свяжись с поддержкой BunnyCDN:**
   - Если ничего не помогает, обратись в поддержку
   - Они помогут настроить правильные Edge Rules

