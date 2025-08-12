<?php
require_once 'includes/auth.php';
require_once 'includes/functions.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendErrorResponse('Method not allowed', 405);
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    sendErrorResponse('Invalid JSON input');
}

$username = $input['username'] ?? '';
$password = $input['password'] ?? '';

if (empty($username) || empty($password)) {
    sendErrorResponse('Username and password are required');
}

if (login($username, $password)) {
    $user = getCurrentUser();
    logActivity('user_login', ['username' => $username]);
    
    sendSuccessResponse([
        'user' => [
            'id' => $user['id'],
            'username' => $user['username'],
            'email' => $user['email'],
            'firstName' => $user['first_name'],
            'lastName' => $user['last_name'],
            'role' => $user['role'],
            'position' => $user['position'],
            'age' => $user['age'],
            'phone' => $user['phone']
        ]
    ], 'Login successful');
} else {
    logActivity('login_failed', ['username' => $username]);
    sendErrorResponse('Invalid credentials', 401);
}
?>