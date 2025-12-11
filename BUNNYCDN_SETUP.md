# Настройка BunnyCDN для SPA (Single Page Application)

## Проблема: 404 при обновлении страницы

BunnyCDN не поддерживает `.htaccess` файлы напрямую. Вместо этого нужно настроить **Edge Rules** в панели управления BunnyCDN.

## Решение: Edge Rules в BunnyCDN

### Шаг 1: Войди в панель BunnyCDN
1. Зайди на https://bunny.net
2. Перейди в **Pull Zones** → выбери зону `btc-prototype`

### Шаг 2: Настрой Edge Rules
1. Перейди в раздел **Edge Rules**
2. Нажми **Add Edge Rule**
3. Настрой правило:

**Условие (Condition):**
- **Type:** `URL`
- **Operator:** `Does not match`
- **Value:** `\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|json|xml|txt|pdf|zip)$`

**Действие (Action):**
- **Type:** `Rewrite`
- **Value:** `/index.html`

**Приоритет:** `1`

### Альтернативный вариант (через URL Rewrite)

Если Edge Rules не работают, используй **URL Rewrite**:

**Условие:**
- **Type:** `URL`
- **Operator:** `Does not match`
- **Value:** `\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|json|xml|txt|pdf|zip)$`

**Действие:**
- **Type:** `Rewrite`
- **Value:** `/index.html`

### Что это делает?

Правило перенаправляет все запросы, которые **НЕ** являются статическими файлами (JS, CSS, изображения и т.д.), на `/index.html`. Это позволяет React Router обрабатывать маршруты на клиенте.

### Примеры:

- ✅ `/` → `/index.html` (работает)
- ✅ `/mining` → `/index.html` (работает, React Router обработает)
- ✅ `/tasks` → `/index.html` (работает, React Router обработает)
- ✅ `/assets/index.js` → `/assets/index.js` (статический файл, не перенаправляется)
- ✅ `/mine-icons/energy.svg` → `/mine-icons/energy.svg` (статический файл, не перенаправляется)

## Файл .htaccess

Файл `.htaccess` создан в `public/.htaccess` и будет скопирован в `dist/` при билде. Он будет работать, если BunnyCDN использует Apache на бэкенде, но **Edge Rules** - более надежное решение для BunnyCDN.

## Проверка

После настройки Edge Rules:
1. Загрузи новый билд: `npm run build && ./upload.sh`
2. Открой приложение в браузере
3. Перейди на любую страницу (например, `/mining`)
4. Обнови страницу (F5 или Cmd+R)
5. Страница должна загрузиться без 404 ошибки
