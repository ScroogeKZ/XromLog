#!/bin/bash
# Скрипт для запуска PHP версии логистической системы

echo "🚀 Запуск ХРОМ Логистика (PHP версия)..."
echo "📄 URL: http://localhost:8080"
echo "👤 Админ: admin / admin123"
echo "👤 Сотрудник: employee1 / admin123"
echo ""

# Устанавливаем права на выполнение
chmod +x start-php.sh

# Проверяем наличие PHP
if ! command -v php &> /dev/null; then
    echo "❌ PHP не установлен. Установите PHP 8.0 или выше"
    exit 1
fi

# Проверяем наличие расширения PDO PostgreSQL
php -m | grep -i pdo_pgsql > /dev/null
if [ $? -ne 0 ]; then
    echo "⚠️  Предупреждение: Расширение PDO PostgreSQL не найдено"
    echo "   Убедитесь, что php-pgsql установлен"
fi

# Создаем папку для загрузок, если она не существует
mkdir -p uploads
chmod 755 uploads

echo "✅ Запуск PHP сервера на порту 8080..."
php -S 0.0.0.0:8080 php-server.php