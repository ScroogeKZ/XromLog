<?php

namespace App;

class ShipmentRequest {
    private $db;
    
    public function __construct() {
        $this->db = \Database::getInstance();
    }
    
    public function create($data, $userId = null) {
        // Генерируем номер заявки
        $requestNumber = $this->generateRequestNumber($data['type']);
        
        // Если userId не указан, пытаемся найти пользователя по телефону отправителя
        if (!$userId) {
            $userId = $this->findUserByPhone($data['sender_phone']);
        }
        
        $this->db->query(
            "INSERT INTO shipment_requests (
                request_number, type, user_id, sender_name, sender_phone, sender_address,
                recipient_name, recipient_phone, recipient_address, cargo_description,
                cargo_weight, cargo_volume, cargo_length, cargo_width, cargo_height
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
                $requestNumber,
                $data['type'],
                $userId,
                $data['sender_name'],
                $data['sender_phone'],
                $data['sender_address'],
                $data['recipient_name'],
                $data['recipient_phone'],
                $data['recipient_address'],
                $data['cargo_description'],
                $data['cargo_weight'],
                $data['cargo_volume'] ?? 0,
                $data['cargo_length'] ?? 0,
                $data['cargo_width'] ?? 0,
                $data['cargo_height'] ?? 0
            ]
        );
        
        $requestId = $this->db->lastInsertId();
        
        // Логируем создание заявки
        $this->logActivity($userId, 'create_request', [
            'request_id' => $requestId,
            'request_number' => $requestNumber,
            'type' => $data['type']
        ]);
        
        return [
            'id' => $requestId,
            'request_number' => $requestNumber
        ];
    }
    
    public function getAll($filters = []) {
        $sql = "SELECT sr.*, u.first_name, u.last_name, u.username 
                FROM shipment_requests sr 
                LEFT JOIN users u ON sr.user_id = u.id";
        $params = [];
        $conditions = [];
        
        if (!empty($filters['status'])) {
            $conditions[] = "sr.status = ?";
            $params[] = $filters['status'];
        }
        
        if (!empty($filters['type'])) {
            $conditions[] = "sr.type = ?";
            $params[] = $filters['type'];
        }
        
        if (!empty($filters['user_id'])) {
            $conditions[] = "sr.user_id = ?";
            $params[] = $filters['user_id'];
        }
        
        if (!empty($filters['search'])) {
            $conditions[] = "(sr.request_number ILIKE ? OR sr.sender_name ILIKE ? OR sr.recipient_name ILIKE ?)";
            $searchTerm = '%' . $filters['search'] . '%';
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $params[] = $searchTerm;
        }
        
        if ($conditions) {
            $sql .= " WHERE " . implode(" AND ", $conditions);
        }
        
        $sql .= " ORDER BY sr.created_at DESC";
        
        if (!empty($filters['limit'])) {
            $sql .= " LIMIT " . intval($filters['limit']);
            if (!empty($filters['offset'])) {
                $sql .= " OFFSET " . intval($filters['offset']);
            }
        }
        
        return $this->db->fetchAll($sql, $params);
    }
    
    public function getById($id) {
        return $this->db->fetch(
            "SELECT sr.*, u.first_name, u.last_name, u.username 
             FROM shipment_requests sr 
             LEFT JOIN users u ON sr.user_id = u.id 
             WHERE sr.id = ?",
            [$id]
        );
    }
    
    public function getByRequestNumber($requestNumber) {
        return $this->db->fetch(
            "SELECT sr.*, u.first_name, u.last_name, u.username 
             FROM shipment_requests sr 
             LEFT JOIN users u ON sr.user_id = u.id 
             WHERE sr.request_number = ?",
            [$requestNumber]
        );
    }
    
    public function getByPhone($phone) {
        $normalizedPhone = $this->normalizePhone($phone);
        
        return $this->db->fetchAll(
            "SELECT sr.*, u.first_name, u.last_name, u.username 
             FROM shipment_requests sr 
             LEFT JOIN users u ON sr.user_id = u.id 
             WHERE sr.sender_phone = ? OR sr.sender_phone = ?",
            [$phone, $normalizedPhone]
        );
    }
    
    public function update($id, $data) {
        $fields = [];
        $params = [];
        
        $allowedFields = [
            'status', 'type', 'sender_name', 'sender_phone', 'sender_address',
            'recipient_name', 'recipient_phone', 'recipient_address',
            'cargo_description', 'cargo_weight', 'cargo_volume',
            'cargo_length', 'cargo_width', 'cargo_height',
            'price_kzt', 'price_notes', 'transport'
        ];
        
        foreach ($allowedFields as $field) {
            if (array_key_exists($field, $data)) {
                $fields[] = $field . " = ?";
                $params[] = $data[$field];
            }
        }
        
        if (empty($fields)) {
            return false;
        }
        
        $fields[] = "updated_at = CURRENT_TIMESTAMP";
        $params[] = $id;
        
        $sql = "UPDATE shipment_requests SET " . implode(", ", $fields) . " WHERE id = ?";
        $this->db->query($sql, $params);
        
        // Логируем обновление
        if (isset($_SESSION['user_id'])) {
            $this->logActivity($_SESSION['user_id'], 'update_request', [
                'request_id' => $id,
                'updated_fields' => array_keys($data)
            ]);
        }
        
        return $this->getById($id);
    }
    
    public function delete($id) {
        $result = $this->db->execute("DELETE FROM shipment_requests WHERE id = ?", [$id]);
        
        if ($result && isset($_SESSION['user_id'])) {
            $this->logActivity($_SESSION['user_id'], 'delete_request', ['request_id' => $id]);
        }
        
        return $result > 0;
    }
    
    public function getStats($userId = null) {
        $baseQuery = "SELECT 
                        COUNT(*) as total,
                        COUNT(CASE WHEN status = 'new' THEN 1 END) as new,
                        COUNT(CASE WHEN status = 'processing' THEN 1 END) as processing,
                        COUNT(CASE WHEN status = 'assigned' THEN 1 END) as assigned,
                        COUNT(CASE WHEN status = 'in_transit' THEN 1 END) as in_transit,
                        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered,
                        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled,
                        COUNT(CASE WHEN type = 'local' THEN 1 END) as local,
                        COUNT(CASE WHEN type = 'intercity' THEN 1 END) as intercity
                      FROM shipment_requests";
        
        if ($userId) {
            $baseQuery .= " WHERE user_id = ?";
            return $this->db->fetch($baseQuery, [$userId]);
        }
        
        return $this->db->fetch($baseQuery);
    }
    
    private function generateRequestNumber($type) {
        $prefix = $type === 'local' ? 'AST' : 'INT';
        $year = date('Y');
        
        // Получаем последний номер для данного типа и года
        $lastNumber = $this->db->fetch(
            "SELECT request_number FROM shipment_requests 
             WHERE request_number LIKE ? 
             ORDER BY created_at DESC LIMIT 1",
            [$prefix . '-' . $year . '-%']
        );
        
        if ($lastNumber) {
            // Извлекаем номер из строки типа "AST-2025-001"
            $parts = explode('-', $lastNumber['request_number']);
            $number = intval($parts[2]) + 1;
        } else {
            $number = 1;
        }
        
        return $prefix . '-' . $year . '-' . str_pad($number, 3, '0', STR_PAD_LEFT);
    }
    
    private function findUserByPhone($phone) {
        $normalizedPhone = $this->normalizePhone($phone);
        
        $user = $this->db->fetch(
            "SELECT id FROM users WHERE phone = ? OR phone = ?",
            [$phone, $normalizedPhone]
        );
        
        return $user ? $user['id'] : null;
    }
    
    private function normalizePhone($phone) {
        // Убираем все кроме цифр
        $phone = preg_replace('/[^0-9]/', '', $phone);
        
        // Приводим к стандартному формату +7XXXXXXXXXX
        if (strlen($phone) == 11 && $phone[0] == '8') {
            $phone = '7' . substr($phone, 1);
        } elseif (strlen($phone) == 10) {
            $phone = '7' . $phone;
        }
        
        return '+' . $phone;
    }
    
    private function logActivity($userId, $action, $details = []) {
        if (!$userId) return;
        
        $this->db->query(
            "INSERT INTO activity_logs (user_id, action, details) VALUES (?, ?, ?)",
            [$userId, $action, json_encode($details)]
        );
    }
}