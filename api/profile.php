<?php
require_once 'includes/auth.php';
require_once 'includes/functions.php';

requireAuth();

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        handleGetProfile();
        break;
    case 'PUT':
        handleUpdateProfile();
        break;
    case 'POST':
        handleChangePassword();
        break;
    default:
        sendErrorResponse('Method not allowed', 405);
}

function handleGetProfile() {
    $user = getCurrentUser();
    
    if (!$user) {
        sendErrorResponse('User not found', 404);
    }
    
    sendSuccessResponse([
        'id' => $user['id'],
        'username' => $user['username'],
        'email' => $user['email'],
        'firstName' => $user['first_name'],
        'lastName' => $user['last_name'],
        'role' => $user['role'],
        'position' => $user['position'],
        'age' => $user['age'],
        'phone' => $user['phone']
    ]);
}

function handleUpdateProfile() {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        sendErrorResponse('Invalid JSON input');
    }
    
    $user = getCurrentUser();
    $db = getDB();
    
    $updateFields = [];
    $params = [];
    
    if (isset($input['firstName'])) {
        $updateFields[] = 'first_name = ?';
        $params[] = sanitizeInput($input['firstName']);
    }
    
    if (isset($input['lastName'])) {
        $updateFields[] = 'last_name = ?';
        $params[] = sanitizeInput($input['lastName']);
    }
    
    if (isset($input['position'])) {
        $updateFields[] = 'position = ?';
        $params[] = sanitizeInput($input['position']);
    }
    
    if (isset($input['age'])) {
        $updateFields[] = 'age = ?';
        $params[] = (int)$input['age'];
    }
    
    if (isset($input['phone'])) {
        if (!validatePhone($input['phone'])) {
            sendErrorResponse('Invalid phone number format');
        }
        $updateFields[] = 'phone = ?';
        $params[] = formatPhone($input['phone']);
    }
    
    if (empty($updateFields)) {
        sendErrorResponse('No fields to update');
    }
    
    $params[] = $user['id'];
    $sql = 'UPDATE users SET ' . implode(', ', $updateFields) . ' WHERE id = ?';
    $db->query($sql, $params);
    
    logActivity('profile_updated', ['updated_fields' => array_keys($input)]);
    
    sendSuccessResponse([], 'Profile updated successfully');
}

function handleChangePassword() {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || empty($input['currentPassword']) || empty($input['newPassword'])) {
        sendErrorResponse('Current password and new password are required');
    }
    
    if (strlen($input['newPassword']) < 6) {
        sendErrorResponse('New password must be at least 6 characters');
    }
    
    $user = getCurrentUser();
    $db = getDB();
    
    // Получаем текущий хэш пароля
    $currentUser = $db->fetch('SELECT password FROM users WHERE id = ?', [$user['id']]);
    
    if (!verifyPassword($input['currentPassword'], $currentUser['password'])) {
        sendErrorResponse('Current password is incorrect', 401);
    }
    
    // Обновляем пароль
    $newPasswordHash = hashPassword($input['newPassword']);
    $db->query('UPDATE users SET password = ? WHERE id = ?', [$newPasswordHash, $user['id']]);
    
    logActivity('password_changed');
    
    sendSuccessResponse([], 'Password changed successfully');
}
?>