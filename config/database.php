<?php
class Database {
    private static $instance = null;
    private $connection;
    
    private function __construct() {
        $database_url = $_ENV['DATABASE_URL'] ?? getenv('DATABASE_URL');
        
        if (!$database_url) {
            throw new Exception('DATABASE_URL environment variable is not set');
        }
        
        // Парсинг DATABASE_URL
        $db_parts = parse_url($database_url);
        
        $host = $db_parts['host'];
        $port = $db_parts['port'] ?? 5432;
        $dbname = ltrim($db_parts['path'], '/');
        $user = $db_parts['user'];
        $password = $db_parts['pass'];
        
        try {
            $dsn = "pgsql:host={$host};port={$port};dbname={$dbname}";
            $this->connection = new PDO($dsn, $user, $password, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
        } catch (PDOException $e) {
            throw new Exception("Database connection failed: " . $e->getMessage());
        }
    }
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    public function getConnection() {
        return $this->connection;
    }
    
    public function query($sql, $params = []) {
        $stmt = $this->connection->prepare($sql);
        $stmt->execute($params);
        return $stmt;
    }
    
    public function fetch($sql, $params = []) {
        $stmt = $this->query($sql, $params);
        return $stmt->fetch();
    }
    
    public function fetchAll($sql, $params = []) {
        $stmt = $this->query($sql, $params);
        return $stmt->fetchAll();
    }
    
    public function execute($sql, $params = []) {
        $stmt = $this->query($sql, $params);
        return $stmt->rowCount();
    }
    
    public function lastInsertId() {
        return $this->connection->lastInsertId();
    }
}

// Глобальная функция для получения базы данных
function getDB() {
    return Database::getInstance();
}
?>