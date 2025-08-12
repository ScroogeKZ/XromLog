<?php
function renderLayout($title, $content, $requireAuth = false, $role = null) {
    if ($requireAuth) {
        requireAuth($role);
    }
    
    $user = getCurrentUser();
    ?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo htmlspecialchars($title); ?> - ХРОМ Логистика</title>
    <link rel="stylesheet" href="/assets/style.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
    <header class="header">
        <div class="container">
            <div class="header-content">
                <a href="/" class="logo">ХРОМ Логистика</a>
                
                <nav class="nav">
                    <a href="/">Главная</a>
                    <a href="/track">Отследить</a>
                    
                    <?php if ($user): ?>
                        <a href="/dashboard">Кабинет</a>
                        <a href="/requests">Заявки</a>
                        <?php if ($user['role'] === 'manager'): ?>
                            <a href="/admin">Администрирование</a>
                            <a href="/analytics">Аналитика</a>
                        <?php endif; ?>
                        <a href="/profile">Профиль</a>
                        <span class="user-info"><?php echo htmlspecialchars($user['first_name'] . ' ' . $user['last_name']); ?></span>
                        <a href="#" id="logoutBtn" class="btn btn-secondary">Выход</a>
                    <?php else: ?>
                        <a href="/login" class="btn btn-primary">Вход</a>
                        <a href="/register" class="btn btn-secondary">Регистрация</a>
                    <?php endif; ?>
                </nav>
            </div>
        </div>
    </header>

    <main>
        <?php echo $content; ?>
    </main>

    <footer class="footer" style="background: var(--surface); padding: 2rem 0; margin-top: 4rem; border-top: 1px solid var(--border);">
        <div class="container text-center">
            <p>&copy; 2025 ХРОМ Логистика. Все права защищены.</p>
            <p>Телефон: +7 (702) 997 00 94 | Email: nurbek@creativegroup.kz</p>
        </div>
    </footer>

    <script src="/assets/app.js"></script>
</body>
</html>
    <?php
}
?>