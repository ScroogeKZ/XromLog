<?php
require_once 'includes/auth.php';
require_once 'includes/functions.php';

requireAuth();

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        handleGetRequests();
        break;
    case 'POST':
        handleCreateRequest();
        break;
    case 'PUT':
        handleUpdateRequest();
        break;
    case 'DELETE':
        handleDeleteRequest();
        break;
    default:
        sendErrorResponse('Method not allowed', 405);
}

function handleGetRequests() {
    $user = getCurrentUser();
    $db = getDB();
    
    $sql = 'SELECT * FROM shipment_requests';
    $params = [];
    
    // Если пользователь - сотрудник, показывать только его заявки
    if ($user['role'] === 'employee') {
        $sql .= ' WHERE user_id = ?';
        $params[] = $user['id'];
    }
    
    $sql .= ' ORDER BY created_at DESC';
    
    $requests = $db->fetchAll($sql, $params);
    
    // Форматируем данные для фронтенда
    $formattedRequests = array_map(function($request) {
        return [
            'id' => $request['id'],
            'requestNumber' => $request['request_number'],
            'type' => $request['type'],
            'status' => $request['status'],
            'senderName' => $request['sender_name'],
            'senderPhone' => $request['sender_phone'],
            'senderAddress' => $request['sender_address'],
            'recipientName' => $request['recipient_name'],
            'recipientPhone' => $request['recipient_phone'],
            'recipientAddress' => $request['recipient_address'],
            'cargoDescription' => $request['cargo_description'],
            'cargoWeight' => (float)$request['cargo_weight'],
            'cargoVolume' => (float)$request['cargo_volume'],
            'cargoLength' => (float)$request['cargo_length'],
            'cargoWidth' => (float)$request['cargo_width'],
            'cargoHeight' => (float)$request['cargo_height'],
            'cargoPhotos' => json_decode($request['cargo_photos'] ?: '[]'),
            'priceKzt' => $request['price_kzt'] ? (float)$request['price_kzt'] : null,
            'priceNotes' => $request['price_notes'],
            'transport' => json_decode($request['transport'] ?: 'null'),
            'createdAt' => $request['created_at'],
            'updatedAt' => $request['updated_at'],
            'userId' => $request['user_id']
        ];
    }, $requests);
    
    sendSuccessResponse($formattedRequests);
}

function handleCreateRequest() {
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
    
    $user = getCurrentUser();
    $requestNumber = generateRequestNumber($input['type']);
    
    $db = getDB();
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
            $user['id'],
            $input['senderName'],
            formatPhone($input['senderPhone']),
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
    
    logActivity('request_created', [
        'request_id' => $requestId,
        'request_number' => $requestNumber,
        'type' => $input['type']
    ]);
    
    sendSuccessResponse(['id' => $requestId, 'requestNumber' => $requestNumber], 'Request created successfully');
}

function handleUpdateRequest() {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['id'])) {
        sendErrorResponse('Request ID is required');
    }
    
    $user = getCurrentUser();
    $db = getDB();
    
    // Проверяем права доступа
    $request = $db->fetch('SELECT * FROM shipment_requests WHERE id = ?', [$input['id']]);
    if (!$request) {
        sendErrorResponse('Request not found', 404);
    }
    
    if ($user['role'] === 'employee' && $request['user_id'] != $user['id']) {
        sendErrorResponse('Access denied', 403);
    }
    
    // Обновляемые поля
    $updateFields = [];
    $params = [];
    
    if (isset($input['status'])) {
        $updateFields[] = 'status = ?';
        $params[] = $input['status'];
    }
    
    if (isset($input['priceKzt'])) {
        $updateFields[] = 'price_kzt = ?';
        $params[] = $input['priceKzt'];
    }
    
    if (isset($input['priceNotes'])) {
        $updateFields[] = 'price_notes = ?';
        $params[] = $input['priceNotes'];
    }
    
    if (isset($input['transport'])) {
        $updateFields[] = 'transport = ?';
        $params[] = json_encode($input['transport']);
    }
    
    if (empty($updateFields)) {
        sendErrorResponse('No fields to update');
    }
    
    $updateFields[] = 'updated_at = NOW()';
    $params[] = $input['id'];
    
    $sql = 'UPDATE shipment_requests SET ' . implode(', ', $updateFields) . ' WHERE id = ?';
    $db->query($sql, $params);
    
    logActivity('request_updated', [
        'request_id' => $input['id'],
        'updated_fields' => array_keys($input)
    ]);
    
    sendSuccessResponse([], 'Request updated successfully');
}

function handleDeleteRequest() {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['id'])) {
        sendErrorResponse('Request ID is required');
    }
    
    $user = getCurrentUser();
    
    // Только менеджеры могут удалять заявки
    if ($user['role'] !== 'manager') {
        sendErrorResponse('Access denied', 403);
    }
    
    $db = getDB();
    $deleted = $db->execute('DELETE FROM shipment_requests WHERE id = ?', [$input['id']]);
    
    if ($deleted) {
        logActivity('request_deleted', ['request_id' => $input['id']]);
        sendSuccessResponse([], 'Request deleted successfully');
    } else {
        sendErrorResponse('Request not found', 404);
    }
}
?>