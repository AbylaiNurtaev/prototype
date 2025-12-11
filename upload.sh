#!/bin/bash

ZONE_NAME="btc-prototype"
ACCESS_KEY="32543b6b-4807-4604-b17325c86cf1-6d23-492c"
DIST_DIR="./dist"

# Читаем версию из package.json
VERSION=$(node -p "require('./package.json').version")
echo "📦 Версия билда: $VERSION"
echo "🚀 Начинаем загрузку файлов..."
echo ""

# Счетчики для статистики
UPLOADED=0
FAILED=0

# Загружаем файлы
while IFS= read -r file; do
  REL_PATH="${file#$DIST_DIR/}"

  # Загружаем файл ТОЛЬКО в корень (одна актуальная версия на проде)
  echo "📤 Uploading: $REL_PATH"
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -T "$file" \
    -H "AccessKey: $ACCESS_KEY" \
    "https://storage.bunnycdn.com/$ZONE_NAME/$REL_PATH")

  if [ "$HTTP_CODE" -eq 201 ] || [ "$HTTP_CODE" -eq 200 ]; then
    UPLOADED=$((UPLOADED + 1))
    echo "  ✅ Успешно (HTTP $HTTP_CODE)"
  else
    FAILED=$((FAILED + 1))
    echo "  ❌ Ошибка (HTTP $HTTP_CODE)"
  fi

  echo ""
done < <(find "$DIST_DIR" -type f)

echo "✅ Загрузка завершена!"
echo "📊 Статистика:"
echo "   Версия: v$VERSION"
echo "   Загружено успешно: $UPLOADED"
echo "   Ошибок: $FAILED"

