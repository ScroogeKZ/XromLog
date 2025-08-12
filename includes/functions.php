<?php
// Общие утилитарные функции

function generateRequestNumber($type = 'local') {
    $prefix = ($type === 'intercity') ? 'INT' : 'AST';
    $year = date('Y');
    
    // Получаем следующий номер для данного типа и года
    $db = getDB();
    $result = $db->fetch(
        "SELECT COUNT(*) as count FROM shipment_requests WHERE request_number LIKE ? AND EXTRACT(YEAR FROM created_at) = ?",
        [$prefix . '-' . $year . '-%', $year]
    );
    
    $number = ($result['count'] ?? 0) + 1;
    return sprintf('%s-%s-%03d', $prefix, $year, $number);
}

function sanitizeInput($data) {
    if (is_array($data)) {
        return array_map('sanitizeInput', $data);
    }
    return htmlspecialchars(trim($data), ENT_QUOTES, 'UTF-8');
}

function validateRequired($data, $fields) {
    $errors = [];
    foreach ($fields as $field) {
        if (empty($data[$field])) {
            $errors[] = "Field {$field} is required";
        }
    }
    return $errors;
}

function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

function validatePhone($phone) {
    $phone = preg_replace('/[^0-9+]/', '', $phone);
    return strlen($phone) >= 10;
}

function formatPhone($phone) {
    $phone = preg_replace('/[^0-9+]/', '', $phone);
    
    // Нормализация казахстанских номеров
    if (preg_match('/^8/', $phone)) {
        $phone = '+7' . substr($phone, 1);
    } elseif (preg_match('/^7/', $phone)) {
        $phone = '+' . $phone;
    } elseif (preg_match('/^\d{10}$/', $phone)) {
        $phone = '+7' . $phone;
    }
    
    return $phone;
}

function sendJsonResponse($data, $status = 200) {
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

function sendErrorResponse($message, $status = 400) {
    sendJsonResponse(['error' => $message], $status);
}

function sendSuccessResponse($data = [], $message = 'Success') {
    $response = ['success' => true, 'message' => $message];
    if (!empty($data)) {
        $response['data'] = $data;
    }
    sendJsonResponse($response);
}

function uploadImage($file, $uploadDir = 'uploads/') {
    if (!isset($file) || $file['error'] !== UPLOAD_ERR_OK) {
        return false;
    }
    
    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!in_array($file['type'], $allowedTypes)) {
        return false;
    }
    
    $maxSize = 10 * 1024 * 1024; // 10MB
    if ($file['size'] > $maxSize) {
        return false;
    }
    
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }
    
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $fileName = uniqid() . '.' . $extension;
    $filePath = $uploadDir . $fileName;
    
    if (move_uploaded_file($file['tmp_name'], $filePath)) {
        return $filePath;
    }
    
    return false;
}

function deleteFile($filePath) {
    if (file_exists($filePath)) {
        return unlink($filePath);
    }
    return false;
}

function formatDate($date, $format = 'd.m.Y H:i') {
    if (is_string($date)) {
        $date = new DateTime($date);
    }
    return $date->format($format);
}

function formatCurrency($amount, $currency = 'тенге') {
    return number_format($amount, 0, ',', ' ') . ' ' . $currency;
}

function getStatusColor($status) {
    $colors = [
        'new' => 'blue',
        'processing' => 'yellow', 
        'assigned' => 'purple',
        'in_transit' => 'orange',
        'delivered' => 'green',
        'cancelled' => 'red'
    ];
    
    return $colors[$status] ?? 'gray';
}

function getStatusName($status) {
    $names = [
        'new' => 'Новый',
        'processing' => 'В обработке',
        'assigned' => 'Назначен',
        'in_transit' => 'В пути',
        'delivered' => 'Доставлен',
        'cancelled' => 'Отменен'
    ];
    
    return $names[$status] ?? $status;
}

function logActivity($action, $details = null, $userId = null) {
    $userId = $userId ?? $_SESSION['user_id'] ?? null;
    
    $db = getDB();
    $db->query(
        'INSERT INTO activity_logs (user_id, action, details, created_at) VALUES (?, ?, ?, NOW())',
        [$userId, $action, json_encode($details, JSON_UNESCAPED_UNICODE)]
    );
}
?>