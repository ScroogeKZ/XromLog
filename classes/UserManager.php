<?php

namespace App;

class UserManager {
    private $db;
    
    public function __construct() {
        $this->db = \Database::getInstance();
    }
    
    public function getAllUsers() {
        return $this->db->fetchAll(
            "SELECT id, username, email, first_name, last_name, role, position, age, phone, created_at 
             FROM users ORDER BY created_at DESC"
        );
    }
    
    public function getUserById($id) {
        return $this->db->fetch(
            "SELECT id, username, email, first_name, last_name, role, position, age, phone, created_at 
             FROM users WHERE id = ?",
            [$id]
        );
    }
    
    public function updateUserRole($userId, $role) {
        if (!in_array($role, ['employee', 'manager'])) {
            throw new \Exception('Недопустимая роль');
        }
        
        return $this->db->execute(
            "UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            [$role, $userId]
        );
    }
    
    public function deleteUser($userId) {
        // Проверяем, не удаляем ли мы последнего администратора
        $adminCount = $this->db->fetch("SELECT COUNT(*) as count FROM users WHERE role = 'manager'");
        
        if ($adminCount['count'] <= 1) {
            $user = $this->getUserById($userId);
            if ($user && $user['role'] === 'manager') {
                throw new \Exception('Нельзя удалить последнего администратора');
            }
        }
        
        return $this->db->execute("DELETE FROM users WHERE id = ?", [$userId]);
    }
    
    public function getUserStats() {
        return $this->db->fetch(
            "SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN role = 'employee' THEN 1 END) as employees,
                COUNT(CASE WHEN role = 'manager' THEN 1 END) as managers
             FROM users"
        );
    }
}