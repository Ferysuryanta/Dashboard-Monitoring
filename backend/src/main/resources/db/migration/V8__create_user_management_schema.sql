-- V8__create_user_management_schema.sql
-- User Management & Authentication Schema

-- =====================================================
-- TABLE: app_user (Application Users)
-- =====================================================
CREATE TABLE app_user (
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

    -- Link to member (optional - if user is also a member)
    member_id UUID,
    CONSTRAINT fk_user_member FOREIGN KEY (member_id) REFERENCES member(id) ON DELETE SET NULL,

    -- Role constraint
    CONSTRAINT chk_user_role CHECK (role IN ('SUPER_ADMIN', 'ADMIN', 'PENGURUS', 'USER', 'VIEWER'))
);

-- =====================================================
-- TABLE: user_session (Active Sessions)
-- =====================================================
CREATE TABLE user_session (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    device_info VARCHAR(500),
    ip_address VARCHAR(45),
    user_agent TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

    CONSTRAINT fk_session_user FOREIGN KEY (user_id) REFERENCES app_user(id) ON DELETE CASCADE
);

-- =====================================================
-- TABLE: activity_log (Audit Trail)
-- =====================================================
CREATE TABLE activity_log (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id VARCHAR(100),
    old_value JSONB,
    new_value JSONB,
    description TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

    CONSTRAINT fk_activity_user FOREIGN KEY (user_id) REFERENCES app_user(id) ON DELETE SET NULL
);

-- =====================================================
-- TABLE: notification (User Notifications)
-- =====================================================
CREATE TABLE notification (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'INFO',
    is_read BOOLEAN DEFAULT FALSE,
    action_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    read_at TIMESTAMP WITH TIME ZONE,

    CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES app_user(id) ON DELETE CASCADE,
    CONSTRAINT chk_notification_type CHECK (type IN ('INFO', 'SUCCESS', 'WARNING', 'ERROR', 'REMINDER'))
);

-- =====================================================
-- TABLE: user_preference (User Settings)
-- =====================================================
CREATE TABLE user_preference (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    language VARCHAR(10) DEFAULT 'id',
    theme VARCHAR(20) DEFAULT 'light',
    notifications_enabled BOOLEAN DEFAULT TRUE,
    email_notifications BOOLEAN DEFAULT TRUE,
    attendance_reminder BOOLEAN DEFAULT TRUE,
    bible_reading_reminder BOOLEAN DEFAULT TRUE,
    reminder_time TIME DEFAULT '07:00:00',
    timezone VARCHAR(50) DEFAULT 'Asia/Jakarta',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

    CONSTRAINT fk_preference_user FOREIGN KEY (user_id) REFERENCES app_user(id) ON DELETE CASCADE
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX idx_user_email ON app_user(email);
CREATE INDEX idx_user_username ON app_user(username);
CREATE INDEX idx_user_role ON app_user(role);
CREATE INDEX idx_user_active ON app_user(is_active);

CREATE INDEX idx_session_user ON user_session(user_id);
CREATE INDEX idx_session_token ON user_session(token_hash);
CREATE INDEX idx_session_expires ON user_session(expires_at);

CREATE INDEX idx_activity_user ON activity_log(user_id);
CREATE INDEX idx_activity_action ON activity_log(action);
CREATE INDEX idx_activity_entity ON activity_log(entity_type, entity_id);
CREATE INDEX idx_activity_created ON activity_log(created_at);

CREATE INDEX idx_notification_user ON notification(user_id);
CREATE INDEX idx_notification_read ON notification(user_id, is_read);
CREATE INDEX idx_notification_created ON notification(created_at);

-- =====================================================
-- SEED: Default Admin User
-- Password: admin123 (hashed with BCrypt - $2a$10$)
-- Generated using: new BCryptPasswordEncoder().encode("admin123")
-- =====================================================
INSERT INTO app_user (id, username, email, password_hash, full_name, role, is_active, is_email_verified, failed_login_attempts, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'admin',
    'admin@mamre.church',
    '$2a$10$EqKcp1WFKVQISheBxkV.eO8KOFL.7ThaMc7F6lPmMHOvIPsGjGTMW', -- admin123
    'Administrator',
    'SUPER_ADMIN',
    TRUE,
    TRUE,
    0,
    now(),
    now()
) ON CONFLICT (username) DO NOTHING;

-- Insert default preferences for admin
INSERT INTO user_preference (user_id, language, theme)
SELECT id, 'id', 'light' FROM app_user WHERE username = 'admin';
