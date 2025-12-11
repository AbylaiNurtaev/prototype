# Настройка Edge Rules в BunnyCDN для исправления 404

## Проблема
При обновлении страницы `/mining` или других маршрутов выдает 404 ошибку, потому что BunnyCDN не знает, что нужно отдавать `index.html` для всех маршрутов SPA.

## Решение: Edge Rules

### Пошаговая инструкция:

1. **Зайди в панель BunnyCDN:**
   - Открой https://bunny.net
   - Войди в свой аккаунт

2. **Перейди в Pull Zones:**
   - В левом меню выбери **Pull Zones**
   - Найди и открой зону **`btc-prototype`**

3. **Открой раздел Edge Rules:**
   - В левом меню зоны выбери **Edge Rules**
   - Или перейди по прямой ссылке: `https://bunny.net/pullzone/edgerules?id=ТВОЙ_ID_ЗОНЫ`

4. **Добавь новое правило:**
   - Нажми кнопку **"Add Edge Rule"** или **"Create Rule"**

5. **Настрой правило:**

   **General Settings:**
   - **Description:** `SPA Rewrite - All routes to index.html`
   - **Enabled:** ✅ (включено)
   - **Priority:** `1` (высокий приоритет)

   **Conditions (Условия):**
   - Нажми **"Add Condition"**
   - **Type:** `Request URL`
   - **Operator:** `Does not match regex` (или `Does not match`)
   - **Value:** `\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|json|xml|txt|pdf|zip|webp|mp4|mp3|avi|mov|wmv|flv|swf|map)$`
   
   Это означает: "если URL НЕ заканчивается на статический файл"

   **Actions (Действия):**
   - Нажми **"Add Action"**
   - **Type:** `Rewrite` (или `URL Rewrite`)
   - **Value:** `/index.html`

6. **Сохрани правило:**
   - Нажми **"Save"** или **"Create"**

7. **Проверь порядок правил:**
   - Убедись, что новое правило находится **выше** других правил (если есть)
   - Правила выполняются сверху вниз

### Альтернативный вариант (если Edge Rules не работает):

Если в панели нет Edge Rules или они не работают, используй **URL Rewrite**:

1. В той же зоне перейди в **"URL Rewrite"**
2. Добавь правило:
   - **Pattern:** `^(?!.*\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|json|xml|txt|pdf|zip|webp|mp4|mp3)$).*$`
   - **Rewrite To:** `/index.html`
   - **Type:** `Rewrite`

### Что это делает?

Правило проверяет каждый запрос:
- Если это **НЕ** статический файл (JS, CSS, изображения и т.д.) → перенаправляет на `/index.html`
- Если это статический файл → отдает его как есть

### Примеры работы:

- ✅ Запрос `/mining` → BunnyCDN отдает `/index.html` → React Router обрабатывает маршрут
- ✅ Запрос `/tasks` → BunnyCDN отдает `/index.html` → React Router обрабатывает маршрут
- ✅ Запрос `/assets/index.js` → BunnyCDN отдает файл напрямую (не перенаправляет)
- ✅ Запрос `/mine-icons/energy.svg` → BunnyCDN отдает файл напрямую

### Проверка после настройки:

1. **Очисти кэш BunnyCDN:**
   - В панели зоны → **Cache** → **Purge Cache** → **Purge All**

2. **Проверь в браузере:**
   - Открой DevTools (F12)
   - Перейди на вкладку **Network**
   - Открой приложение
   - Перейди на `/mining`
   - Обнови страницу (F5)
   - Проверь запрос к `/mining`:
     - Должен вернуть статус **200** (не 404)
     - В ответе должен быть HTML из `index.html`

3. **Если не работает:**
   - Проверь, что правило **Enabled** (включено)
   - Проверь порядок правил (SPA правило должно быть первым)
   - Попробуй очистить кэш браузера (Ctrl+Shift+Delete)
   - Попробуй открыть в режиме инкогнито

### Скриншоты (примерный вид в панели):

**Edge Rules:**
```
┌─────────────────────────────────────┐
│ Description: SPA Rewrite            │
│ Enabled: ✅                         │
│ Priority: 1                         │
│                                     │
│ Conditions:                         │
│ ┌─────────────────────────────────┐ │
│ │ Type: Request URL               │ │
│ │ Operator: Does not match regex  │ │
│ │ Value: \.(js|css|png|...)$      │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Actions:                            │
│ ┌─────────────────────────────────┐ │
│ │ Type: Rewrite                   │ │
│ │ Value: /index.html               │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### Если ничего не помогает:

1. **Свяжись с поддержкой BunnyCDN:**
   - Они помогут настроить правильные Edge Rules
   - Может быть, у тебя другой тип аккаунта или зоны

2. **Проверь тип Pull Zone:**
   - Убедись, что это **Pull Zone**, а не Storage
   - Edge Rules работают только для Pull Zones

3. **Альтернатива:**
   - Можно использовать другой CDN (Cloudflare Pages, Netlify, Vercel)
   - Они автоматически поддерживают SPA роутинг

