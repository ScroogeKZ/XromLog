<?php
require_once 'includes/auth.php';
require_once 'includes/layout.php';

$auth = new App\Auth();
$error = '';

// Если пользователь уже авторизован, перенаправляем
if ($auth->isLoggedIn()) {
    if ($auth->isManager()) {
        header('Location: /pages/admin.php');
    } else {
        header('Location: /pages/dashboard.php');
    }
    exit();
}

// Обработка формы логина
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';
    
    try {
        $user = $auth->login($username, $password);
        if ($user) {
            if ($user['role'] === 'manager') {
                header('Location: /pages/admin.php');
            } else {
                header('Location: /pages/dashboard.php');
            }
            exit();
        } else {
            $error = 'Неверное имя пользователя или пароль';
        }
    } catch (Exception $e) {
        $error = 'Ошибка входа: ' . $e->getMessage();
    }
}
?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Вход в систему - ХРОМ-KZ Логистика</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link href="../assets/style.css" rel="stylesheet">
</head>
<body class="chrome-gradient min-h-screen">
    <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div class="max-w-md w-full">
            <div class="text-center mb-8">
                <img class="h-12 w-auto mx-auto mb-4" src="../attached_assets/1571623_1754335361197.png" alt="ХРОМ-KZ">
                <h1 class="text-3xl font-bold text-white">Вход в систему</h1>
                <p class="text-white opacity-90 mt-2">Войдите в свой аккаунт для управления заявками</p>
            </div>

            <div class="glass-card p-8">
                <?php if ($error): ?>
                    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                        <?= htmlspecialchars($error) ?>
                    </div>
                <?php endif; ?>

                <form method="POST" class="space-y-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Имя пользователя</label>
                        <input type="text" name="username" required 
                               value="<?= htmlspecialchars($_POST['username'] ?? '') ?>"
                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-chrome-blue">
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
                        <input type="password" name="password" required 
                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-chrome-blue">
                    </div>

                    <button type="submit" class="btn-primary w-full">Войти в систему</button>
                </form>

                <div class="mt-6 text-center">
                    <p class="text-sm text-gray-600">
                        Нет аккаунта? 
                        <a href="/pages/register.php" class="text-chrome-blue hover:text-chrome-dark font-medium">Зарегистрироваться</a>
                    </p>
                    <div class="mt-4 pt-4 border-t border-gray-200">
                        <a href="/" class="text-sm text-gray-500 hover:text-gray-700">← Вернуться на главную</a>
                    </div>
                </div>
            </div>

            <!-- Тестовые учетные данные для разработки -->
            <div class="mt-6 glass-card p-4">
                <p class="text-sm text-gray-600 mb-2"><strong>Тестовые данные:</strong></p>
                <p class="text-xs text-gray-500">Администратор: admin / password</p>
                <p class="text-xs text-gray-500">Сотрудник: employee / password</p>
            </div>
        </div>
    </div>
</body>
</html>