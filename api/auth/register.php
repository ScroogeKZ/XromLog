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

$requiredFields = ['username', 'email', 'password', 'firstName', 'lastName'];
$errors = validateRequired($input, $requiredFields);

if (!empty($errors)) {
    sendErrorResponse(implode(', ', $errors));
}

if (!validateEmail($input['email'])) {
    sendErrorResponse('Invalid email format');
}

if (strlen($input['password']) < 6) {
    sendErrorResponse('Password must be at least 6 characters');
}

if (register($input)) {
    logActivity('user_registered', ['username' => $input['username']]);
    sendSuccessResponse([], 'Registration successful');
} else {
    sendErrorResponse('Username or email already exists', 409);
}
?>