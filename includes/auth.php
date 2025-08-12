<?php
require_once 'config/database.php';

function requireAuth($role = null) {
    if (!isset($_SESSION['user_id'])) {
        if (isApiRequest()) {
            http_response_code(401);
            echo json_encode(['error' => 'Authentication required']);
            exit;
        } else {
            header('Location: /login');
            exit;
        }
    }
    
    if ($role) {
        $user = getCurrentUser();
        if (!$user || $user['role'] !== $role) {
            if (isApiRequest()) {
                http_response_code(403);
                echo json_encode(['error' => 'Insufficient permissions']);
                exit;
            } else {
                header('Location: /dashboard');
                exit;
            }
        }
    }
}

function getCurrentUser() {
    if (!isset($_SESSION['user_id'])) {
        return null;
    }
    
    $db = getDB();
    return $db->fetch(
        'SELECT id, username, email, first_name, last_name, role, position, age, phone FROM users WHERE id = ?',
        [$_SESSION['user_id']]
    );
}

function isLoggedIn() {
    return isset($_SESSION['user_id']);
}

function login($username, $password) {
    $db = getDB();
    $user = $db->fetch(
        'SELECT id, username, password, role FROM users WHERE username = ?',
        [$username]
    );
    
    if ($user && password_verify($password, $user['password'])) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['role'] = $user['role'];
        return true;
    }
    
    return false;
}

function logout() {
    session_destroy();
}

function register($data) {
    $db = getDB();
    
    // Проверяем существующего пользователя
    $existingUser = $db->fetch(
        'SELECT id FROM users WHERE username = ? OR email = ?',
        [$data['username'], $data['email']]
    );
    
    if ($existingUser) {
        return false;
    }
    
    // Создаем нового пользователя
    $hashedPassword = password_hash($data['password'], PASSWORD_BCRYPT);
    
    $db->query(
        'INSERT INTO users (username, email, password, first_name, last_name, role) VALUES (?, ?, ?, ?, ?, ?)',
        [
            $data['username'],
            $data['email'],
            $hashedPassword,
            $data['firstName'] ?? '',
            $data['lastName'] ?? '',
            'employee' // по умолчанию роль сотрудника
        ]
    );
    
    return true;
}

function isApiRequest() {
    return strpos($_SERVER['REQUEST_URI'], '/api/') === 0;
}

function hashPassword($password) {
    return password_hash($password, PASSWORD_BCRYPT);
}

function verifyPassword($password, $hash) {
    return password_verify($password, $hash);
}
?>