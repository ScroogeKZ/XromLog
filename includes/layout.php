<?php
// Базовый макет для страниц
function renderLayout($title, $content, $showNavigation = true) {
    $currentUser = isset($_SESSION['user_id']) ? getCurrentUser() : null;
?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= htmlspecialchars($title) ?> - ХРОМ-KZ Логистика</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="/assets/style.css" rel="stylesheet">
    <style>
        :root {
            --primary-blue: #2563eb;
            --dark-blue: #1e40af;
            --light-gray: #f8fafc;
            --border-gray: #e2e8f0;
        }
        
        .gradient-bg {
            background: linear-gradient(135deg, var(--primary-blue) 0%, var(--dark-blue) 100%);
        }
        
        .glass-effect {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .nav-link {
            transition: all 0.3s ease;
        }
        
        .nav-link:hover {
            background: rgba(37, 99, 235, 0.1);
            color: var(--primary-blue);
        }
        
        .btn-primary {
            background: var(--primary-blue);
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 0.375rem;
            transition: all 0.3s ease;
            border: none;
            cursor: pointer;
        }
        
        .btn-primary:hover {
            background: var(--dark-blue);
            transform: translateY(-1px);
        }
    </style>
</head>
<body class="bg-gray-50 min-h-screen">
    <?php if ($showNavigation && $currentUser): ?>
    <nav class="bg-white shadow-sm border-b">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-16">
                <div class="flex items-center">
                    <div class="flex-shrink-0">
                        <h1 class="text-xl font-bold text-blue-600">ХРОМ-KZ</h1>
                    </div>
                    <div class="ml-10 flex space-x-8">
                        <a href="/dashboard" class="nav-link px-3 py-2 rounded-md text-sm font-medium">Панель управления</a>
                        <a href="/requests" class="nav-link px-3 py-2 rounded-md text-sm font-medium">Заявки</a>
                        <?php if ($_SESSION['role'] === 'manager'): ?>
                        <a href="/admin" class="nav-link px-3 py-2 rounded-md text-sm font-medium">Администрирование</a>
                        <a href="/analytics" class="nav-link px-3 py-2 rounded-md text-sm font-medium">Аналитика</a>
                        <?php endif; ?>
                    </div>
                </div>
                <div class="flex items-center space-x-4">
                    <span class="text-sm text-gray-700">
                        Добро пожаловать, <?= htmlspecialchars($_SESSION['full_name'] ?? $_SESSION['username']) ?>!
                    </span>
                    <a href="/profile" class="nav-link px-3 py-2 rounded-md text-sm font-medium">Профиль</a>
                    <a href="/logout" class="btn-primary">Выход</a>
                </div>
            </div>
        </div>
    </nav>
    <?php endif; ?>
    
    <main class="flex-1">
        <?= $content ?>
    </main>
    
    <footer class="bg-white border-t mt-auto">
        <div class="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <p class="text-center text-sm text-gray-500">
                © <?= date('Y') ?> ХРОМ-KZ Логистика. Все права защищены.
            </p>
        </div>
    </footer>
</body>
</html>
<?php
}

// Функция для начала буферизации вывода
function startOutput() {
    ob_start();
}

// Функция для получения содержимого буфера
function getOutput() {
    return ob_get_clean();
}
?>