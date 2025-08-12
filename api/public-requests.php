<?php
require_once 'config/database.php';
require_once 'includes/functions.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendErrorResponse('Method not allowed', 405);
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    sendErrorResponse('Invalid JSON input');
}

$requiredFields = ['type', 'senderName', 'senderPhone', 'senderAddress', 
                  'recipientName', 'recipientPhone', 'recipientAddress', 
                  'cargoDescription', 'cargoWeight'];

$errors = validateRequired($input, $requiredFields);
if (!empty($errors)) {
    sendErrorResponse(implode(', ', $errors));
}

if (!validatePhone($input['senderPhone']) || !validatePhone($input['recipientPhone'])) {
    sendErrorResponse('Invalid phone number format');
}

$db = getDB();

// Ищем пользователя по номеру телефона
$senderPhone = formatPhone($input['senderPhone']);
$user = $db->fetch('SELECT id FROM users WHERE phone = ?', [$senderPhone]);

$userId = $user ? $user['id'] : null;
$requestNumber = generateRequestNumber($input['type']);

$db->query(
    'INSERT INTO shipment_requests (
        request_number, type, status, user_id,
        sender_name, sender_phone, sender_address,
        recipient_name, recipient_phone, recipient_address,
        cargo_description, cargo_weight, cargo_volume,
        cargo_length, cargo_width, cargo_height,
        cargo_photos, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
    [
        $requestNumber,
        $input['type'],
        'new',
        $userId,
        $input['senderName'],
        $senderPhone,
        $input['senderAddress'],
        $input['recipientName'],
        formatPhone($input['recipientPhone']),
        $input['recipientAddress'],
        $input['cargoDescription'],
        $input['cargoWeight'],
        $input['cargoVolume'] ?? 0,
        $input['cargoLength'] ?? 0,
        $input['cargoWidth'] ?? 0,
        $input['cargoHeight'] ?? 0,
        json_encode($input['cargoPhotos'] ?? [])
    ]
);

$requestId = $db->lastInsertId();

logActivity('public_request_created', [
    'request_id' => $requestId,
    'request_number' => $requestNumber,
    'type' => $input['type'],
    'linked_user' => $userId
]);

sendSuccessResponse([
    'id' => $requestId,
    'requestNumber' => $requestNumber
], 'Public request created successfully');
?>