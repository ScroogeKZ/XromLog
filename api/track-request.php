<?php
require_once 'config/database.php';
require_once 'includes/functions.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendErrorResponse('Method not allowed', 405);
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || empty($input['phone'])) {
    sendErrorResponse('Phone number is required');
}

if (!validatePhone($input['phone'])) {
    sendErrorResponse('Invalid phone number format');
}

$phone = formatPhone($input['phone']);
$db = getDB();

$requests = $db->fetchAll(
    'SELECT request_number, type, status, sender_name, recipient_name, 
            cargo_description, created_at, updated_at, price_kzt, price_notes
     FROM shipment_requests 
     WHERE sender_phone = ? OR recipient_phone = ?
     ORDER BY created_at DESC',
    [$phone, $phone]
);

$formattedRequests = array_map(function($request) {
    return [
        'requestNumber' => $request['request_number'],
        'type' => $request['type'],
        'status' => $request['status'],
        'statusName' => getStatusName($request['status']),
        'senderName' => $request['sender_name'],
        'recipientName' => $request['recipient_name'],
        'cargoDescription' => $request['cargo_description'],
        'createdAt' => $request['created_at'],
        'updatedAt' => $request['updated_at'],
        'priceKzt' => $request['price_kzt'] ? (float)$request['price_kzt'] : null,
        'priceNotes' => $request['price_notes']
    ];
}, $requests);

sendSuccessResponse($formattedRequests);
?>