#!/bin/bash

# Скрипт для настройки Edge Rules в BunnyCDN для SPA
# ВАЖНО: Нужен API ключ Pull Zone, а не Storage ключ!

PULL_ZONE_ID="YOUR_PULL_ZONE_ID"  # ID вашей Pull Zone из панели BunnyCDN
API_KEY="YOUR_PULL_ZONE_API_KEY"  # API ключ Pull Zone (не Storage ключ!)

echo "Настройка Edge Rules для SPA в BunnyCDN..."

# Создание правила: перенаправление всех запросов на index.html
curl -X POST "https://api.bunny.net/pullzone/$PULL_ZONE_ID/edgerules/addOrUpdate" \
  -H "AccessKey: $API_KEY" \
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
    "ActionParameter2": "200",
    "Description": "SPA fallback - redirect all non-file requests to index.html"
  }'

echo ""
echo "Правило создано! Проверьте в панели BunnyCDN."

