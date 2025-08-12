<?php
require_once 'includes/auth.php';
require_once 'includes/functions.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendErrorResponse('Method not allowed', 405);
}

if (!isLoggedIn()) {
    sendErrorResponse('Not authenticated', 401);
}

$user = getCurrentUser();

if ($user) {
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
    ]);
} else {
    sendErrorResponse('User not found', 404);
}
?>