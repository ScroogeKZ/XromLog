<?php
require_once 'includes/auth.php';
require_once 'includes/functions.php';

requireAuth('manager'); // Только менеджеры могут управлять пользователями

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        handleGetUsers();
        break;
    case 'PUT':
        handleUpdateUser();
        break;
    default:
        sendErrorResponse('Method not allowed', 405);
}

function handleGetUsers() {
    $db = getDB();
    $users = $db->fetchAll(
        'SELECT id, username, email, first_name, last_name, role, position, age, phone, created_at
         FROM users ORDER BY created_at DESC'
    );
    
    $formattedUsers = array_map(function($user) {
        return [
            'id' => $user['id'],
            'username' => $user['username'],
            'email' => $user['email'],
            'firstName' => $user['first_name'],
            'lastName' => $user['last_name'],
            'role' => $user['role'],
            'position' => $user['position'],
            'age' => $user['age'],
            'phone' => $user['phone'],
            'createdAt' => $user['created_at']
        ];
    }, $users);
    
    sendSuccessResponse($formattedUsers);
}

function handleUpdateUser() {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['id'])) {
        sendErrorResponse('User ID is required');
    }
    
    $db = getDB();
    $user = $db->fetch('SELECT id FROM users WHERE id = ?', [$input['id']]);
    
    if (!$user) {
        sendErrorResponse('User not found', 404);
    }
    
    $updateFields = [];
    $params = [];
    
    if (isset($input['role'])) {
        $updateFields[] = 'role = ?';
        $params[] = $input['role'];
    }
    
    if (isset($input['position'])) {
        $updateFields[] = 'position = ?';
        $params[] = $input['position'];
    }
    
    if (empty($updateFields)) {
        sendErrorResponse('No fields to update');
    }
    
    $params[] = $input['id'];
    $sql = 'UPDATE users SET ' . implode(', ', $updateFields) . ' WHERE id = ?';
    $db->query($sql, $params);
    
    logActivity('user_updated', [
        'target_user_id' => $input['id'],
        'updated_fields' => array_keys($input)
    ]);
    
    sendSuccessResponse([], 'User updated successfully');
}
?>