#!/bin/bash
# Запуск PHP сервера для ХРОМ-KZ Логистика

echo "Запуск PHP сервера ХРОМ-KZ Логистика..."
echo "Порт: 5000"
echo "URL: http://localhost:5000"
echo ""

# Проверка PHP
if ! command -v php &> /dev/null; then
    echo "Ошибка: PHP не установлен"
    exit 1
fi

# Проверка подключения к базе данных
if [ -z "$DATABASE_URL" ]; then
    echo "Предупреждение: DATABASE_URL не установлен"
fi

# Запуск сервера
php -S 0.0.0.0:5000 -t . index.php