-- Manual script to insert admin user
-- Run this script manually in PostgreSQL if the admin user doesn't exist

-- First, check if app_user table exists and create if not
CREATE TABLE IF NOT EXISTS app_user (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500),
    phone VARCHAR(50),
    role VARCHAR(50) NOT NULL DEFAULT 'USER',
    is_active BOOLEAN DEFAULT TRUE,
    is_email_verified BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    password_changed_at TIMESTAMP WITH TIME ZONE,
    failed_login_attempts INT DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID,
    member_id UUID
);

-- Delete existing admin if exists (for clean reset)
DELETE FROM app_user WHERE username = 'admin';

-- Insert admin user with BCrypt hashed password for 'admin123'
-- This hash was generated using BCryptPasswordEncoder with strength 10
INSERT INTO app_user (
    id,
    username,
    email,
    password_hash,
    full_name,
    role,
    is_active,
    is_email_verified,
    failed_login_attempts,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'admin',
    'admin@mamre.church',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGe6tN6pKkU8VMEk0eHG8XHQXOK6',
    'Administrator',
    'SUPER_ADMIN',
    TRUE,
    TRUE,
    0,
    now(),
    now()
);

-- Verify the insert
SELECT id, username, email, full_name, role, is_active FROM app_user WHERE username = 'admin';
