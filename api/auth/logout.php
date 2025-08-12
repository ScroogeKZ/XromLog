<?php
require_once 'includes/auth.php';
require_once 'includes/functions.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendErrorResponse('Method not allowed', 405);
}

if (isLoggedIn()) {
    $user = getCurrentUser();
    logActivity('user_logout', ['username' => $user['username']]);
    logout();
}

sendSuccessResponse([], 'Logout successful');
?>