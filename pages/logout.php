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

$auth = new App\Auth();
$auth->logout();

// Перенаправляем на главную страницу
header('Location: /');
exit();
?>