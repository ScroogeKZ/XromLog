-- ХРОМ Логистика - Database Schema for PHP Version
-- PostgreSQL Schema

-- Drop existing tables if they exist
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS shipment_requests CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL DEFAULT '',
    last_name VARCHAR(50) NOT NULL DEFAULT '',
    role VARCHAR(20) NOT NULL DEFAULT 'employee' CHECK (role IN ('employee', 'manager')),
    position VARCHAR(100),
    age INTEGER CHECK (age >= 18 AND age <= 100),
    phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Shipment requests table
CREATE TABLE shipment_requests (
    id SERIAL PRIMARY KEY,
    request_number VARCHAR(20) UNIQUE NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('local', 'intercity')),
    status VARCHAR(20) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'processing', 'assigned', 'in_transit', 'delivered', 'cancelled')),
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    
    -- Sender information
    sender_name VARCHAR(100) NOT NULL,
    sender_phone VARCHAR(20) NOT NULL,
    sender_address TEXT NOT NULL,
    
    -- Recipient information
    recipient_name VARCHAR(100) NOT NULL,
    recipient_phone VARCHAR(20) NOT NULL,
    recipient_address TEXT NOT NULL,
    
    -- Cargo information
    cargo_description TEXT NOT NULL,
    cargo_weight DECIMAL(10,2) NOT NULL,
    cargo_volume DECIMAL(10,3) DEFAULT 0,
    cargo_length DECIMAL(10,2) DEFAULT 0,
    cargo_width DECIMAL(10,2) DEFAULT 0,
    cargo_height DECIMAL(10,2) DEFAULT 0,
    cargo_photos JSONB DEFAULT '[]',
    
    -- Pricing
    price_kzt DECIMAL(12,2),
    price_notes TEXT,
    
    -- Transport assignment
    transport JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Activity logs table for audit trail
CREATE TABLE activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX idx_shipment_requests_user_id ON shipment_requests(user_id);
CREATE INDEX idx_shipment_requests_status ON shipment_requests(status);
CREATE INDEX idx_shipment_requests_type ON shipment_requests(type);
CREATE INDEX idx_shipment_requests_created_at ON shipment_requests(created_at);
CREATE INDEX idx_shipment_requests_sender_phone ON shipment_requests(sender_phone);
CREATE INDEX idx_shipment_requests_recipient_phone ON shipment_requests(recipient_phone);
CREATE INDEX idx_shipment_requests_request_number ON shipment_requests(request_number);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for auto-updating updated_at
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shipment_requests_updated_at 
    BEFORE UPDATE ON shipment_requests 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user (password: admin123)
INSERT INTO users (username, email, password, first_name, last_name, role, position) 
VALUES (
    'admin', 
    'admin@chrome-logistics.kz', 
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- admin123
    'Администратор', 
    'Системы', 
    'manager',
    'Системный администратор'
);

-- Sample data for testing
INSERT INTO users (username, email, password, first_name, last_name, role, position, phone) 
VALUES 
(
    'employee1', 
    'employee1@chrome-logistics.kz', 
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- admin123
    'Асхат', 
    'Токтаров', 
    'employee',
    'Логист',
    '+7 (701) 234-56-78'
),
(
    'manager1', 
    'manager1@chrome-logistics.kz', 
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- admin123
    'Нурбек', 
    'Касымов', 
    'manager',
    'Менеджер по логистике',
    '+7 (702) 997-00-94'
);

-- Sample shipment requests
INSERT INTO shipment_requests (
    request_number, type, status, user_id,
    sender_name, sender_phone, sender_address,
    recipient_name, recipient_phone, recipient_address,
    cargo_description, cargo_weight, cargo_volume,
    price_kzt, price_notes
) VALUES 
(
    'AST-2025-001',
    'local',
    'processing',
    2,
    'ТОО "КазТранс"',
    '+7 (717) 222-33-44',
    'г. Астана, ул. Республики 15',
    'ИП "Логистика Плюс"',
    '+7 (717) 555-66-77',
    'г. Астана, пр. Туран 42',
    'Офисная мебель (столы, стулья)',
    250.50,
    2.5,
    15000,
    'Требуется аккуратная погрузка'
),
(
    'INT-2025-001',
    'intercity',
    'new',
    2,
    'ТОО "СтройМатериалы"',
    '+7 (717) 333-44-55',
    'г. Астана, ул. Промышленная 8',
    'ТОО "РемСтрой"',
    '+7 (7212) 888-99-00',
    'г. Караганда, ул. Строительная 25',
    'Строительные материалы (кирпич, цемент)',
    1500.00,
    10.5,
    85000,
    'Требуется крытый транспорт'
);

-- Activity logs sample
INSERT INTO activity_logs (user_id, action, details) VALUES
(1, 'user_login', '{"username": "admin"}'),
(2, 'request_created', '{"request_id": 1, "request_number": "AST-2025-001", "type": "local"}'),
(2, 'request_created', '{"request_id": 2, "request_number": "INT-2025-001", "type": "intercity"}');

-- Comments
COMMENT ON TABLE users IS 'Пользователи системы (сотрудники и менеджеры)';
COMMENT ON TABLE shipment_requests IS 'Заявки на перевозку грузов';
COMMENT ON TABLE activity_logs IS 'Журнал активности пользователей';

COMMENT ON COLUMN shipment_requests.request_number IS 'Уникальный номер заявки (AST-YYYY-NNN или INT-YYYY-NNN)';
COMMENT ON COLUMN shipment_requests.type IS 'Тип доставки: local (местная) или intercity (междугородняя)';
COMMENT ON COLUMN shipment_requests.status IS 'Статус заявки: new, processing, assigned, in_transit, delivered, cancelled';
COMMENT ON COLUMN shipment_requests.cargo_photos IS 'JSON массив путей к фотографиям груза';
COMMENT ON COLUMN shipment_requests.transport IS 'JSON объект с информацией о назначенном транспорте';