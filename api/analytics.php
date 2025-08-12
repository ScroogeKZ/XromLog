<?php
require_once 'includes/auth.php';
require_once 'includes/functions.php';

requireAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendErrorResponse('Method not allowed', 405);
}

$user = getCurrentUser();
$db = getDB();

// Базовые условия для фильтрации
$whereClause = '';
$params = [];

if ($user['role'] === 'employee') {
    $whereClause = 'WHERE user_id = ?';
    $params[] = $user['id'];
}

// Общая статистика
$totalStats = $db->fetch(
    "SELECT 
        COUNT(*) as total_requests,
        COUNT(CASE WHEN status = 'new' THEN 1 END) as new_requests,
        COUNT(CASE WHEN status = 'processing' THEN 1 END) as processing_requests,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as completed_requests,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_requests,
        COUNT(CASE WHEN type = 'local' THEN 1 END) as local_requests,
        COUNT(CASE WHEN type = 'intercity' THEN 1 END) as intercity_requests,
        COALESCE(SUM(price_kzt), 0) as total_revenue
    FROM shipment_requests $whereClause",
    $params
);

// Статистика по месяцам (последние 12 месяцев)
$monthlyStats = $db->fetchAll(
    "SELECT 
        DATE_TRUNC('month', created_at) as month,
        COUNT(*) as requests_count,
        COALESCE(SUM(price_kzt), 0) as revenue
    FROM shipment_requests $whereClause
    " . ($whereClause ? 'AND' : 'WHERE') . " created_at >= NOW() - INTERVAL '12 months'
    GROUP BY DATE_TRUNC('month', created_at)
    ORDER BY month",
    $params
);

// Статистика по статусам
$statusStats = $db->fetchAll(
    "SELECT status, COUNT(*) as count
    FROM shipment_requests $whereClause
    GROUP BY status
    ORDER BY count DESC",
    $params
);

// Статистика по типам
$typeStats = $db->fetchAll(
    "SELECT type, COUNT(*) as count
    FROM shipment_requests $whereClause
    GROUP BY type",
    $params
);

// Форматируем данные
$analytics = [
    'overview' => [
        'totalRequests' => (int)$totalStats['total_requests'],
        'newRequests' => (int)$totalStats['new_requests'],
        'processingRequests' => (int)$totalStats['processing_requests'],
        'completedRequests' => (int)$totalStats['completed_requests'],
        'cancelledRequests' => (int)$totalStats['cancelled_requests'],
        'localRequests' => (int)$totalStats['local_requests'],
        'intercityRequests' => (int)$totalStats['intercity_requests'],
        'totalRevenue' => (float)$totalStats['total_revenue']
    ],
    'monthlyTrends' => array_map(function($item) {
        return [
            'month' => date('Y-m', strtotime($item['month'])),
            'requests' => (int)$item['requests_count'],
            'revenue' => (float)$item['revenue']
        ];
    }, $monthlyStats),
    'statusDistribution' => array_map(function($item) {
        return [
            'status' => $item['status'],
            'statusName' => getStatusName($item['status']),
            'count' => (int)$item['count']
        ];
    }, $statusStats),
    'typeDistribution' => array_map(function($item) {
        return [
            'type' => $item['type'],
            'typeName' => $item['type'] === 'local' ? 'Местные' : 'Межгород',
            'count' => (int)$item['count']
        ];
    }, $typeStats)
];

sendSuccessResponse($analytics);
?>