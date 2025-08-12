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

$shipmentRequest = new App\ShipmentRequest();
$requestNumber = $_GET['number'] ?? '';
$phone = $_GET['phone'] ?? '';
$request = null;
$requests = null;
$error = '';

if ($requestNumber && $_SERVER['REQUEST_METHOD'] === 'GET' && $requestNumber) {
    $request = $shipmentRequest->getByRequestNumber($requestNumber);
    if (!$request) {
        $error = 'Заявка с таким номером не найдена';
    }
}

if ($phone && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $phone = $_POST['phone'] ?? '';
    if ($phone) {
        $requests = $shipmentRequest->getByPhone($phone);
        if (empty($requests)) {
            $error = 'Заявки с указанным номером телефона не найдены';
        }
    }
}
?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Отследить заявку - ХРОМ-KZ Логистика</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link href="../assets/style.css" rel="stylesheet">
</head>
<body class="chrome-gradient min-h-screen">
    <div class="container mx-auto px-4 py-8">
        <div class="max-w-4xl mx-auto">
            <div class="text-center mb-8">
                <img class="h-12 w-auto mx-auto mb-4" src="../attached_assets/1571623_1754335361197.png" alt="ХРОМ-KZ">
                <h1 class="text-3xl font-bold text-white">Отслеживание заявки</h1>
                <p class="text-white opacity-90 mt-2">Узнайте статус вашей доставки</p>
            </div>

            <!-- Поиск по номеру заявки -->
            <div class="glass-card p-6 mb-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Поиск по номеру заявки</h3>
                <form method="GET" class="flex gap-4">
                    <input type="text" name="number" placeholder="Введите номер заявки (например: AST-2025-001)" 
                           value="<?= htmlspecialchars($requestNumber) ?>"
                           class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-chrome-blue">
                    <button type="submit" class="btn-primary">Найти</button>
                </form>
            </div>

            <!-- Поиск по телефону -->
            <div class="glass-card p-6 mb-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Поиск по номеру телефона</h3>
                <form method="POST" class="flex gap-4">
                    <input type="tel" name="phone" placeholder="Введите номер телефона" 
                           value="<?= htmlspecialchars($phone) ?>"
                           class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-chrome-blue">
                    <button type="submit" class="btn-primary">Найти</button>
                </form>
            </div>

            <?php if ($error): ?>
                <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                    <?= htmlspecialchars($error) ?>
                </div>
            <?php endif; ?>

            <?php if ($request): ?>
                <!-- Информация о заявке -->
                <div class="glass-card p-6">
                    <div class="flex justify-between items-start mb-6">
                        <div>
                            <h2 class="text-2xl font-bold text-gray-900">Заявка <?= htmlspecialchars($request['request_number']) ?></h2>
                            <p class="text-gray-600"><?= $request['type'] === 'local' ? 'Местная доставка' : 'Междугородняя доставка' ?></p>
                        </div>
                        <div class="text-right">
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
                            <span class="inline-flex px-3 py-1 text-sm font-semibold rounded-full <?= $statusClasses[$request['status']] ?>">
                                <?= $statusNames[$request['status']] ?>
                            </span>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 class="text-lg font-semibold text-gray-900 mb-3">Отправитель</h3>
                            <p class="text-gray-700"><strong>Имя:</strong> <?= htmlspecialchars($request['sender_name']) ?></p>
                            <p class="text-gray-700"><strong>Телефон:</strong> <?= htmlspecialchars($request['sender_phone']) ?></p>
                            <p class="text-gray-700"><strong>Адрес:</strong> <?= htmlspecialchars($request['sender_address']) ?></p>
                        </div>

                        <div>
                            <h3 class="text-lg font-semibold text-gray-900 mb-3">Получатель</h3>
                            <p class="text-gray-700"><strong>Имя:</strong> <?= htmlspecialchars($request['recipient_name']) ?></p>
                            <p class="text-gray-700"><strong>Телефон:</strong> <?= htmlspecialchars($request['recipient_phone']) ?></p>
                            <p class="text-gray-700"><strong>Адрес:</strong> <?= htmlspecialchars($request['recipient_address']) ?></p>
                        </div>
                    </div>

                    <div class="mt-6 pt-6 border-t border-gray-200">
                        <h3 class="text-lg font-semibold text-gray-900 mb-3">Информация о грузе</h3>
                        <p class="text-gray-700 mb-2"><strong>Описание:</strong> <?= htmlspecialchars($request['cargo_description']) ?></p>
                        <div class="flex flex-wrap gap-4 text-sm text-gray-600">
                            <span><strong>Вес:</strong> <?= number_format($request['cargo_weight'], 1) ?> кг</span>
                            <?php if ($request['cargo_volume'] > 0): ?>
                                <span><strong>Объем:</strong> <?= number_format($request['cargo_volume'], 3) ?> м³</span>
                            <?php endif; ?>
                            <?php if ($request['price_kzt']): ?>
                                <span><strong>Стоимость:</strong> <?= number_format($request['price_kzt'], 0) ?> ₸</span>
                            <?php endif; ?>
                        </div>
                    </div>

                    <div class="mt-6 pt-6 border-t border-gray-200 text-sm text-gray-500">
                        <p><strong>Дата создания:</strong> <?= date('d.m.Y H:i', strtotime($request['created_at'])) ?></p>
                        <?php if ($request['updated_at'] != $request['created_at']): ?>
                            <p><strong>Последнее обновление:</strong> <?= date('d.m.Y H:i', strtotime($request['updated_at'])) ?></p>
                        <?php endif; ?>
                    </div>
                </div>
            <?php endif; ?>

            <?php if ($requests && !empty($requests)): ?>
                <!-- Список заявок по телефону -->
                <div class="glass-card">
                    <div class="px-6 py-4 border-b border-gray-200">
                        <h2 class="text-xl font-bold text-gray-900">Найденные заявки</h2>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Номер</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Тип</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действие</th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                                <?php foreach ($requests as $req): ?>
                                    <tr class="hover:bg-gray-50">
                                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-chrome-blue">
                                            <?= htmlspecialchars($req['request_number']) ?>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <?= $req['type'] === 'local' ? 'Местная' : 'Междугородняя' ?>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full <?= $statusClasses[$req['status']] ?>">
                                                <?= $statusNames[$req['status']] ?>
                                            </span>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <?= date('d.m.Y', strtotime($req['created_at'])) ?>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm">
                                            <a href="?number=<?= urlencode($req['request_number']) ?>" 
                                               class="text-chrome-blue hover:text-chrome-dark">Подробнее</a>
                                        </td>
                                    </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                </div>
            <?php endif; ?>

            <div class="text-center mt-8">
                <a href="/" class="btn-outline">← Вернуться на главную</a>
            </div>
        </div>
    </div>
</body>
</html>