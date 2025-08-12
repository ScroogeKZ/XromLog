<?php

namespace App;

class Auth {
    private $db;
    
    public function __construct() {
        $this->db = \Database::getInstance();
    }
    
    public function login($username, $password) {
        $user = $this->db->fetch(
            "SELECT * FROM users WHERE username = ?",
            [$username]
        );
        
        if (!$user || !password_verify($password, $user['password'])) {
            return false;
        }
        
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['role'] = $user['role'];
        $_SESSION['full_name'] = $user['first_name'] . ' ' . $user['last_name'];
        
        return $user;
    }
    
    public function register($data) {
        // Проверяем, существует ли пользователь
        $existing = $this->db->fetch(
            "SELECT id FROM users WHERE username = ? OR email = ?",
            [$data['username'], $data['email']]
        );
        
        if ($existing) {
            throw new \Exception('Пользователь с таким именем или email уже существует');
        }
        
        // Хешируем пароль
        $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);
        
        // Создаем пользователя
        $this->db->query(
            "INSERT INTO users (username, email, password, first_name, last_name, position, age, phone, role) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
                $data['username'],
                $data['email'],
                $hashedPassword,
                $data['first_name'] ?? '',
                $data['last_name'] ?? '',
                $data['position'] ?? '',
                $data['age'] ?? null,
                $data['phone'] ?? '',
                'employee' // По умолчанию роль employee
            ]
        );
        
        $userId = $this->db->lastInsertId();
        
        // Получаем созданного пользователя
        $user = $this->db->fetch("SELECT * FROM users WHERE id = ?", [$userId]);
        
        // Логиним пользователя
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['role'] = $user['role'];
        $_SESSION['full_name'] = $user['first_name'] . ' ' . $user['last_name'];
        
        return $user;
    }
    
    public function logout() {
        session_destroy();
    }
    
    public function getCurrentUser() {
        if (!isset($_SESSION['user_id'])) {
            return null;
        }
        
        return $this->db->fetch(
            "SELECT * FROM users WHERE id = ?",
            [$_SESSION['user_id']]
        );
    }
    
    public function isLoggedIn() {
        return isset($_SESSION['user_id']);
    }
    
    public function isManager() {
        return isset($_SESSION['role']) && $_SESSION['role'] === 'manager';
    }
    
    public function requireAuth($redirectTo = '/pages/login.php') {
        if (!$this->isLoggedIn()) {
            header("Location: $redirectTo");
            exit;
        }
    }
    
    public function requireManager($redirectTo = '/pages/dashboard.php') {
        $this->requireAuth();
        if (!$this->isManager()) {
            header("Location: $redirectTo");
            exit;
        }
    }
    
    public function updateProfile($userId, $data) {
        $this->db->query(
            "UPDATE users SET first_name = ?, last_name = ?, position = ?, age = ?, phone = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            [
                $data['first_name'],
                $data['last_name'],
                $data['position'],
                $data['age'],
                $data['phone'],
                $userId
            ]
        );
    }
    
    public function changePassword($userId, $currentPassword, $newPassword) {
        $user = $this->db->fetch("SELECT password FROM users WHERE id = ?", [$userId]);
        
        if (!$user || !password_verify($currentPassword, $user['password'])) {
            throw new \Exception('Неверный текущий пароль');
        }
        
        $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
        
        $this->db->query(
            "UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            [$hashedPassword, $userId]
        );
    }
}