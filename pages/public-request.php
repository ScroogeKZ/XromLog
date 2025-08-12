<?php
require_once '../config/database.php';

$type = $_GET['type'] ?? 'local';
$success = false;
$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $shipmentRequest = new App\ShipmentRequest();
        
        $data = [
            'type' => $_POST['type'],
            'sender_name' => $_POST['sender_name'],
            'sender_phone' => $_POST['sender_phone'],
            'sender_address' => $_POST['sender_address'],
            'recipient_name' => $_POST['recipient_name'],
            'recipient_phone' => $_POST['recipient_phone'],
            'recipient_address' => $_POST['recipient_address'],
            'cargo_description' => $_POST['cargo_description'],
            'cargo_weight' => floatval($_POST['cargo_weight']),
            'cargo_volume' => floatval($_POST['cargo_volume'] ?? 0),
            'cargo_length' => floatval($_POST['cargo_length'] ?? 0),
            'cargo_width' => floatval($_POST['cargo_width'] ?? 0),
            'cargo_height' => floatval($_POST['cargo_height'] ?? 0)
        ];
        
        $result = $shipmentRequest->create($data);
        $success = true;
        $requestNumber = $result['request_number'];
        
    } catch (Exception $e) {
        $error = $e->getMessage();
    }
}
?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Создать заявку - ХРОМ-KZ Логистика</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link href="../assets/style.css" rel="stylesheet">
</head>
<body class="chrome-gradient min-h-screen">
    <div class="container mx-auto px-4 py-8">
        <div class="max-w-2xl mx-auto">
            <div class="text-center mb-8">
                <img class="h-12 w-auto mx-auto mb-4" src="../attached_assets/1571623_1754335361197.png" alt="ХРОМ-KZ">
                <h1 class="text-3xl font-bold text-white">
                    <?= $type === 'local' ? 'Местная доставка (Астана)' : 'Междугородняя доставка' ?>
                </h1>
            </div>

            <?php if ($success): ?>
                <div class="glass-card p-8 mb-6">
                    <div class="text-center">
                        <div class="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>
                        <h2 class="text-2xl font-bold text-green-700 mb-2">Заявка успешно создана!</h2>
                        <p class="text-lg text-gray-700 mb-4">Номер заявки: <strong class="text-chrome-blue"><?= htmlspecialchars($requestNumber) ?></strong></p>
                        <p class="text-gray-600 mb-6">Сохраните номер заявки для отслеживания статуса доставки.</p>
                        
                        <div class="space-y-3">
                            <a href="/pages/track.php?number=<?= urlencode($requestNumber) ?>" 
                               class="btn-primary block">Отследить заявку</a>
                            <a href="/" class="btn-outline block">На главную</a>
                        </div>
                    </div>
                </div>
            <?php else: ?>
                <form method="POST" class="glass-card p-8">
                    <?php if ($error): ?>
                        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                            <?= htmlspecialchars($error) ?>
                        </div>
                    <?php endif; ?>

                    <input type="hidden" name="type" value="<?= htmlspecialchars($type) ?>">

                    <!-- Информация об отправителе -->
                    <div class="mb-8">
                        <h3 class="text-lg font-semibold text-gray-900 mb-4">Информация об отправителе</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Имя отправителя *</label>
                                <input type="text" name="sender_name" required 
                                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-chrome-blue">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Телефон отправителя *</label>
                                <input type="tel" name="sender_phone" required placeholder="+7 (XXX) XXX-XX-XX"
                                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-chrome-blue">
                            </div>
                        </div>
                        <div class="mt-4">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Адрес отправления *</label>
                            <textarea name="sender_address" required rows="2" 
                                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-chrome-blue"></textarea>
                        </div>
                    </div>

                    <!-- Информация о получателе -->
                    <div class="mb-8">
                        <h3 class="text-lg font-semibold text-gray-900 mb-4">Информация о получателе</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Имя получателя *</label>
                                <input type="text" name="recipient_name" required 
                                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-chrome-blue">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Телефон получателя *</label>
                                <input type="tel" name="recipient_phone" required placeholder="+7 (XXX) XXX-XX-XX"
                                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-chrome-blue">
                            </div>
                        </div>
                        <div class="mt-4">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Адрес получения *</label>
                            <textarea name="recipient_address" required rows="2" 
                                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-chrome-blue"></textarea>
                        </div>
                    </div>

                    <!-- Информация о грузе -->
                    <div class="mb-8">
                        <h3 class="text-lg font-semibold text-gray-900 mb-4">Информация о грузе</h3>
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Описание груза *</label>
                            <textarea name="cargo_description" required rows="3" 
                                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-chrome-blue"
                                      placeholder="Опишите что перевозите..."></textarea>
                        </div>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Вес (кг) *</label>
                                <input type="number" step="0.1" name="cargo_weight" required 
                                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-chrome-blue">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Объем (м³)</label>
                                <input type="number" step="0.001" name="cargo_volume" 
                                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-chrome-blue">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Длина (м)</label>
                                <input type="number" step="0.01" name="cargo_length" 
                                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-chrome-blue">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Ширина (м)</label>
                                <input type="number" step="0.01" name="cargo_width" 
                                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-chrome-blue">
                            </div>
                        </div>
                    </div>

                    <div class="flex flex-col sm:flex-row gap-4">
                        <button type="submit" class="btn-primary flex-1">Создать заявку</button>
                        <a href="/" class="btn-outline flex-1 text-center">Отмена</a>
                    </div>
                </form>
            <?php endif; ?>
        </div>
    </div>
</body>
</html>