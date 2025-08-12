<?php
require_once 'classes/Auth.php';

// Глобальный экземпляр Auth
$auth = new App\Auth();

// Вспомогательная функция для проверки авторизации
function requireAuth($redirectTo = '/login') {
    global $auth;
    if (!$auth->isLoggedIn()) {
        header("Location: $redirectTo");
        exit;
    }
}

// Функция проверки роли менеджера
function requireManager($redirectTo = '/dashboard') {
    global $auth;
    if (!$auth->isLoggedIn()) {
        header("Location: /login");
        exit;
    }
    if (!$auth->isManager()) {
        header("Location: $redirectTo");
        exit;
    }
}

// Функция получения текущего пользователя
function getCurrentUser() {
    global $auth;
    return $auth->getCurrentUser();
}

// Функция проверки авторизации
function isLoggedIn() {
    global $auth;
    return $auth->isLoggedIn();
}

// Функция проверки роли менеджера
function isManager() {
    global $auth;
    return $auth->isManager();
}
?>