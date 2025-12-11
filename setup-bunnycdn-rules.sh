#!/bin/bash

# Скрипт для автоматической настройки Edge Rules в BunnyCDN
# Использование: ./setup-bunnycdn-rules.sh

ZONE_NAME="btc-prototype"
API_KEY="32543b6b-4807-4604-b17325c86cf1-6d23-492c"  # Твой API ключ из BunnyCDN

echo "🔧 Настройка Edge Rules для BunnyCDN..."
echo ""

# Получаем ID зоны
echo "📡 Получаем информацию о зоне..."
ZONE_ID=$(curl -s -X GET "https://api.bunny.net/pullzone?name=$ZONE_NAME" \
  -H "AccessKey: $API_KEY" | grep -o '"Id":[0-9]*' | grep -o '[0-9]*')

if [ -z "$ZONE_ID" ]; then
  echo "❌ Не удалось найти зону $ZONE_NAME"
  echo "💡 Убедись, что API ключ правильный и зона существует"
  exit 1
fi

echo "✅ Зона найдена: ID = $ZONE_ID"
echo ""

# Получаем текущие Edge Rules
echo "📋 Получаем текущие Edge Rules..."
CURRENT_RULES=$(curl -s -X GET "https://api.bunny.net/pullzone/$ZONE_ID" \
  -H "AccessKey: $API_KEY")

echo "Текущие правила:"
echo "$CURRENT_RULES" | grep -A 5 "EdgeRules" || echo "Правил не найдено"
echo ""

# Создаем новое Edge Rule для SPA
echo "➕ Создаем Edge Rule для SPA (перенаправление на index.html)..."

# Формируем JSON для Edge Rule
RULE_JSON=$(cat <<EOF
{
  "Guid": "",
  "ActionType": 0,
  "ActionParameter1": "/index.html",
  "ActionParameter2": "",
  "Triggers": [
    {
      "Type": 0,
      "PatternMatchingType": 1,
      "Pattern": "\\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|json|xml|txt|pdf|zip)$",
      "Parameter1": "",
      "Parameter2": ""
    }
  ],
  "Enabled": true,
  "Description": "SPA Rewrite Rule - Redirect to index.html for non-static files"
}
EOF
)

# Добавляем Edge Rule через API
RESPONSE=$(curl -s -X POST "https://api.bunny.net/pullzone/$ZONE_ID/edgerules/addOrUpdate" \
  -H "AccessKey: $API_KEY" \
  -H "Content-Type: application/json" \
  -d "$RULE_JSON")

echo "Ответ от API:"
echo "$RESPONSE"
echo ""

if echo "$RESPONSE" | grep -q "Success\|success\|true"; then
  echo "✅ Edge Rule успешно добавлен!"
else
  echo "⚠️  Возможно, правило уже существует или произошла ошибка"
  echo "💡 Проверь панель BunnyCDN вручную"
fi

echo ""
echo "📝 Инструкция для ручной настройки:"
echo "1. Зайди в https://bunny.net"
echo "2. Pull Zones → $ZONE_NAME → Edge Rules"
echo "3. Добавь правило:"
echo "   - Условие: URL Does not match \\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|json|xml|txt|pdf|zip)$"
echo "   - Действие: Rewrite → /index.html"
echo ""
