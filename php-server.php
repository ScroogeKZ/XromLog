<?php
// PHP Built-in Server для разработки
// Запуск: php -S localhost:8080 php-server.php

$request_uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Статические файлы
if (preg_match('/\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf)$/', $request_uri)) {
    $file_path = __DIR__ . $request_uri;
    
    if (file_exists($file_path)) {
        $mime_types = [
            'css' => 'text/css',
            'js' => 'application/javascript',
            'png' => 'image/png',
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'gif' => 'image/gif',
            'svg' => 'image/svg+xml',
            'ico' => 'image/x-icon',
            'woff' => 'font/woff',
            'woff2' => 'font/woff2',
            'ttf' => 'font/ttf'
        ];
        
        $extension = pathinfo($file_path, PATHINFO_EXTENSION);
        $mime_type = $mime_types[$extension] ?? 'application/octet-stream';
        
        header('Content-Type: ' . $mime_type);
        readfile($file_path);
        return false;
    } else {
        http_response_code(404);
        echo '404 Not Found';
        return false;
    }
}

// Все остальные запросы направляем в index.php
require_once __DIR__ . '/index.php';
?>