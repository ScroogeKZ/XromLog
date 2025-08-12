<?php
session_start();
require_once 'config/database.php';
require_once 'includes/auth.php';

// Роутинг
$request_uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$request_uri = rtrim($request_uri, '/');

// API роуты
if (strpos($request_uri, '/api/') === 0) {
    header('Content-Type: application/json');
    
    $route = substr($request_uri, 4); // убираем /api/
    
    switch ($route) {
        case 'auth/login':
            require_once 'api/auth/login.php';
            break;
        case 'auth/register':
            require_once 'api/auth/register.php';
            break;
        case 'auth/logout':
            require_once 'api/auth/logout.php';
            break;
        case 'auth/me':
            require_once 'api/auth/me.php';
            break;
        case 'shipment-requests':
            require_once 'api/shipment-requests.php';
            break;
        case 'shipment-requests/public':
            require_once 'api/public-requests.php';
            break;
        case 'shipment-requests/track':
            require_once 'api/track-request.php';
            break;
        case 'users':
            require_once 'api/users.php';
            break;
        case 'analytics':
            require_once 'api/analytics.php';
            break;
        case 'profile':
            require_once 'api/profile.php';
            break;
        default:
            http_response_code(404);
            echo json_encode(['error' => 'API endpoint not found']);
            break;
    }
    exit;
}

// Веб роуты
switch ($request_uri) {
    case '':
    case '/':
        require_once 'pages/home.php';
        break;
    case '/login':
        require_once 'pages/login.php';
        break;
    case '/register':
        require_once 'pages/register.php';
        break;
    case '/dashboard':
        requireAuth();
        require_once 'pages/dashboard.php';
        break;
    case '/requests':
        requireAuth();
        require_once 'pages/requests.php';
        break;
    case '/admin':
        requireAuth('manager');
        require_once 'pages/admin.php';
        break;
    case '/profile':
        requireAuth();
        require_once 'pages/profile.php';
        break;
    case '/analytics':
        requireAuth('manager');
        require_once 'pages/analytics.php';
        break;
    case '/track':
        require_once 'pages/track.php';
        break;
    default:
        http_response_code(404);
        require_once 'pages/404.php';
        break;
}
?>