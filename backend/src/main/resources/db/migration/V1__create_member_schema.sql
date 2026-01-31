-- V1__create_member_schema.sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE sector (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE position (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT
);

CREATE TABLE member (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(150) NOT NULL,
    last_name VARCHAR(150),
    gender VARCHAR(10),
    birth_date DATE,
    phone VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    sector_id BIGINT,
    position_id BIGINT,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    joined_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT fk_member_sector FOREIGN KEY (sector_id) REFERENCES sector(id) ON DELETE SET NULL,
    CONSTRAINT fk_member_position FOREIGN KEY (position_id) REFERENCES position(id) ON DELETE SET NULL,
    CONSTRAINT chk_member_status CHECK (status IN ('ACTIVE', 'INACTIVE', 'PROSPECT', 'SUSPENDED'))
);

CREATE TABLE attendance (
    id BIGSERIAL PRIMARY KEY,
    member_id UUID NOT NULL,
    attend_date DATE NOT NULL,
    event VARCHAR(255),
    present BOOLEAN DEFAULT TRUE,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT fk_attendance_member FOREIGN KEY (member_id) REFERENCES member(id) ON DELETE CASCADE
);

-- Indexes for common queries
CREATE INDEX idx_member_status ON member(status);
CREATE INDEX idx_member_sector ON member(sector_id);
CREATE INDEX idx_attendance_member_date ON attendance(member_id, attend_date);