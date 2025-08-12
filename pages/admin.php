<?php
session_start();

// Автозагрузка классов
spl_autoload_register(function ($class) {
    $class = str_replace('App\\', '', $class);
    $file = __DIR__ . '/../classes/' . $class . '.php';
    if (file_exists($file)) {
        require_once $file;
    }
});

require_once '../config/database.php';

$auth = new App\Auth();
$auth->requireManager();

$shipmentRequest = new App\ShipmentRequest();
$userManager = new App\UserManager();

// Получаем статистику
$stats = $shipmentRequest->getStats();
$userStats = $userManager->getUserStats();

// Получаем последние заявки
$filters = [
    'limit' => 10
];
$recentRequests = $shipmentRequest->getAll($filters);

$currentUser = $auth->getCurrentUser();
?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Административная панель - ХРОМ-KZ Логистика</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link href="../assets/style.css" rel="stylesheet">
</head>
<body class="bg-gray-50">
    <!-- Навигация -->
    <nav class="bg-white shadow-sm border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-16">
                <div class="flex items-center">
                    <img class="h-8 w-auto" src="../attached_assets/1571623_1754335361197.png" alt="ХРОМ-KZ">
                    <span class="ml-3 text-xl font-bold text-chrome-blue">ХРОМ-KZ</span>
                </div>
                
                <div class="flex items-center space-x-4">
                    <span class="text-sm text-gray-700">
                        Добро пожаловать, <strong><?= htmlspecialchars($currentUser['first_name'] . ' ' . $currentUser['last_name']) ?></strong>
                    </span>
                    <a href="/pages/logout.php" class="btn-outline text-sm">Выйти</a>
                </div>
            </div>
        </div>
    </nav>

    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <!-- Заголовок -->
        <div class="mb-8">
            <h1 class="text-3xl font-bold text-gray-900">Административная панель</h1>
            <p class="text-gray-600">Управление системой логистики</p>
        </div>

        <!-- Статистика -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div class="glass-card p-6">
                <div class="flex items-center">
                    <div class="w-12 h-12 bg-blue-500 text-white rounded-lg flex items-center justify-center">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                    </div>
                    <div class="ml-4">
                        <p class="text-2xl font-bold text-gray-900"><?= $stats['total'] ?></p>
                        <p class="text-gray-600">Всего заявок</p>
                    </div>
                </div>
            </div>

            <div class="glass-card p-6">
                <div class="flex items-center">
                    <div class="w-12 h-12 bg-green-500 text-white rounded-lg flex items-center justify-center">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </div>
                    <div class="ml-4">
                        <p class="text-2xl font-bold text-gray-900"><?= $stats['delivered'] ?></p>
                        <p class="text-gray-600">Доставлено</p>
                    </div>
                </div>
            </div>

            <div class="glass-card p-6">
                <div class="flex items-center">
                    <div class="w-12 h-12 bg-yellow-500 text-white rounded-lg flex items-center justify-center">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                    <div class="ml-4">
                        <p class="text-2xl font-bold text-gray-900"><?= $stats['in_transit'] ?></p>
                        <p class="text-gray-600">В пути</p>
                    </div>
                </div>
            </div>

            <div class="glass-card p-6">
                <div class="flex items-center">
                    <div class="w-12 h-12 bg-purple-500 text-white rounded-lg flex items-center justify-center">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                        </svg>
                    </div>
                    <div class="ml-4">
                        <p class="text-2xl font-bold text-gray-900"><?= $userStats['total'] ?></p>
                        <p class="text-gray-600">Пользователей</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Быстрые действия -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <a href="/pages/requests.php" class="glass-card p-6 hover:shadow-lg transition-shadow">
                <h3 class="text-lg font-semibold text-gray-900 mb-2">Управление заявками</h3>
                <p class="text-gray-600">Просмотр, редактирование и обработка всех заявок на доставку</p>
            </a>

            <a href="/pages/users.php" class="glass-card p-6 hover:shadow-lg transition-shadow">
                <h3 class="text-lg font-semibold text-gray-900 mb-2">Управление пользователями</h3>
                <p class="text-gray-600">Управление учетными записями сотрудников и администраторов</p>
            </a>

            <a href="/pages/analytics.php" class="glass-card p-6 hover:shadow-lg transition-shadow">
                <h3 class="text-lg font-semibold text-gray-900 mb-2">Аналитика и отчеты</h3>
                <p class="text-gray-600">Статистика работы и детальные отчеты по доставкам</p>
            </a>
        </div>

        <!-- Последние заявки -->
        <div class="glass-card">
            <div class="px-6 py-4 border-b border-gray-200">
                <h2 class="text-xl font-bold text-gray-900">Последние заявки</h2>
            </div>
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Номер</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Тип</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Отправитель</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата создания</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        <?php if (empty($recentRequests)): ?>
                            <tr>
                                <td colspan="5" class="px-6 py-4 text-center text-gray-500">Заявок пока нет</td>
                            </tr>
                        <?php else: ?>
                            <?php foreach ($recentRequests as $request): ?>
                                <tr class="hover:bg-gray-50">
                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-chrome-blue">
                                        <?= htmlspecialchars($request['request_number']) ?>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <?= $request['type'] === 'local' ? 'Местная' : 'Междугородняя' ?>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <?= htmlspecialchars($request['sender_name']) ?>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <?php
                                        $statusClasses = [
                                            'new' => 'bg-gray-100 text-gray-800',
                                            'processing' => 'bg-blue-100 text-blue-800',
                                            'assigned' => 'bg-yellow-100 text-yellow-800',
                                            'in_transit' => 'bg-purple-100 text-purple-800',
                                            'delivered' => 'bg-green-100 text-green-800',
                                            'cancelled' => 'bg-red-100 text-red-800'
                                        ];
                                        $statusNames = [
                                            'new' => 'Новая',
                                            'processing' => 'Обработка',
                                            'assigned' => 'Назначена',
                                            'in_transit' => 'В пути',
                                            'delivered' => 'Доставлена',
                                            'cancelled' => 'Отменена'
                                        ];
                                        ?>
                                        <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full <?= $statusClasses[$request['status']] ?>">
                                            <?= $statusNames[$request['status']] ?>
                                        </span>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <?= date('d.m.Y H:i', strtotime($request['created_at'])) ?>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</body>
</html>