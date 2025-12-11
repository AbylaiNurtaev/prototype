#!/bin/bash

ZONE_NAME="btc-prototype"
ACCESS_KEY="32543b6b-4807-4604-b17325c86cf1-6d23-492c"

echo "🧹 Очистка старых версионных папок с BunnyCDN..."
echo ""

# Получаем список всех объектов в Storage Zone
echo "📡 Получаем список файлов и папок..."
FILES_LIST=$(curl -s -X GET \
  -H "AccessKey: $ACCESS_KEY" \
  "https://storage.bunnycdn.com/$ZONE_NAME/")

if [ -z "$FILES_LIST" ]; then
  echo "❌ Не удалось получить список файлов"
  exit 1
fi

# Ищем все папки, начинающиеся с "v" и содержащие паттерн версии (v0.1.1/, v0.1.2/, и т.д.)
echo "🔍 Ищем версионные папки..."
VERSION_FOLDERS=$(echo "$FILES_LIST" | grep -oE 'v[0-9]+\.[0-9]+\.[0-9]+/' | sort -u)

if [ -z "$VERSION_FOLDERS" ]; then
  echo "✅ Версионных папок не найдено"
  exit 0
fi

echo "📋 Найдены следующие версионные папки:"
echo "$VERSION_FOLDERS"
echo ""

# Подсчитываем количество
FOLDER_COUNT=$(echo "$VERSION_FOLDERS" | wc -l | tr -d ' ')
echo "🗑️  Найдено папок для удаления: $FOLDER_COUNT"
echo ""

# Спрашиваем подтверждение
read -p "⚠️  Удалить все эти папки? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
  echo "❌ Отменено пользователем"
  exit 0
fi

# Удаляем каждую папку
DELETED=0
FAILED=0

for folder in $VERSION_FOLDERS; do
  echo "🗑️  Удаляем: $folder"
  
  # Удаляем папку (BunnyCDN удаляет рекурсивно)
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE \
    -H "AccessKey: $ACCESS_KEY" \
    "https://storage.bunnycdn.com/$ZONE_NAME/$folder")
  
  if [ "$HTTP_CODE" -eq 200 ] || [ "$HTTP_CODE" -eq 204 ]; then
    DELETED=$((DELETED + 1))
    echo "  ✅ Удалено (HTTP $HTTP_CODE)"
  else
    FAILED=$((FAILED + 1))
    echo "  ❌ Ошибка (HTTP $HTTP_CODE)"
  fi
done

echo ""
echo "✅ Очистка завершена!"
echo "📊 Статистика:"
echo "   Удалено успешно: $DELETED"
echo "   Ошибок: $FAILED"

