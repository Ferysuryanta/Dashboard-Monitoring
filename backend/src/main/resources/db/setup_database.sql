-- ========================================
-- MAMRE GBKP - Database Setup Script
-- ========================================
-- Jalankan script ini di PostgreSQL untuk setup database lengkap
--
-- CARA PAKAI:
-- 1. Buat database: CREATE DATABASE mamre;
-- 2. Connect ke database mamre
-- 3. Jalankan seluruh script ini
-- ========================================

-- Drop existing tables jika ada (HATI-HATI: akan menghapus data!)
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS member CASCADE;
DROP TABLE IF EXISTS position CASCADE;
DROP TABLE IF EXISTS sector CASCADE;

-- ========================================
-- CREATE TABLES
-- ========================================

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

-- Indexes
CREATE INDEX idx_member_status ON member(status);
CREATE INDEX idx_member_sector ON member(sector_id);
CREATE INDEX idx_attendance_member_date ON attendance(member_id, attend_date);

-- ========================================
-- SEED DATA: SECTORS
-- ========================================

INSERT INTO sector (code, name, description) VALUES
('SEC-001', 'Sektor 1 - Pusat', 'Sektor pusat kota'),
('SEC-002', 'Sektor 2 - Timur', 'Sektor wilayah timur'),
('SEC-003', 'Sektor 3 - Barat', 'Sektor wilayah barat'),
('SEC-004', 'Sektor 4 - Utara', 'Sektor wilayah utara'),
('SEC-005', 'Sektor 5 - Selatan', 'Sektor wilayah selatan'),
('SEC-006', 'Sektor 6 - Pemuda', 'Sektor khusus pemuda');

-- ========================================
-- SEED DATA: POSITIONS
-- ========================================

INSERT INTO position (name, description) VALUES
('Pendeta', 'Pemimpin jemaat dan pengajar firman'),
('Majelis', 'Anggota majelis gereja'),
('Sintua', 'Penatua gereja'),
('Diaken', 'Pelayan diakonia'),
('Guru Sekolah Minggu', 'Pengajar sekolah minggu'),
('Koordinator Sektor', 'Koordinator wilayah sektor'),
('Pengurus Pemuda', 'Pengurus organisasi pemuda'),
('Anggota Paduan Suara', 'Anggota tim musik/paduan suara'),
('Bendahara', 'Pengurus keuangan'),
('Sekretaris', 'Pengurus administrasi'),
('Anggota', 'Anggota jemaat biasa');

-- ========================================
-- SEED DATA: MEMBERS (30 anggota)
-- ========================================

INSERT INTO member (first_name, last_name, gender, birth_date, phone, email, address, sector_id, position_id, status, joined_date) VALUES
-- Sektor 1 - Pusat (5 anggota)
('Budi', 'Santoso', 'Male', '1975-03-15', '081234567890', 'budi.santoso@email.com', 'Jl. Merdeka No. 10, Jakarta Pusat', 1, 1, 'ACTIVE', '2010-01-01'),
('Siti', 'Rahayu', 'Female', '1980-07-22', '081234567891', 'siti.rahayu@email.com', 'Jl. Sudirman No. 25, Jakarta Pusat', 1, 2, 'ACTIVE', '2012-06-15'),
('Agus', 'Wijaya', 'Male', '1985-11-08', '081234567892', 'agus.wijaya@email.com', 'Jl. Thamrin No. 5, Jakarta Pusat', 1, 3, 'ACTIVE', '2015-03-20'),
('Maria', 'Sinaga', 'Female', '1990-02-14', '081234567893', 'maria.sinaga@email.com', 'Jl. Gatot Subroto No. 12, Jakarta Pusat', 1, 5, 'ACTIVE', '2018-08-10'),
('Johanes', 'Simanjuntak', 'Male', '1978-09-30', '081234567894', 'johanes.s@email.com', 'Jl. HR Rasuna Said No. 8, Jakarta Pusat', 1, 4, 'ACTIVE', '2011-04-05'),

-- Sektor 2 - Timur (5 anggota)
('Dewi', 'Lestari', 'Female', '1988-05-18', '081234567895', 'dewi.lestari@email.com', 'Jl. Raya Bekasi No. 45, Jakarta Timur', 2, 6, 'ACTIVE', '2016-02-28'),
('Andi', 'Pratama', 'Male', '1992-12-03', '081234567896', 'andi.pratama@email.com', 'Jl. Cililitan No. 20, Jakarta Timur', 2, 7, 'ACTIVE', '2019-07-12'),
('Rina', 'Wati', 'Female', '1995-08-25', '081234567897', 'rina.wati@email.com', 'Jl. Kalimalang No. 15, Jakarta Timur', 2, 8, 'ACTIVE', '2020-01-08'),
('Hendra', 'Gunawan', 'Male', '1982-04-10', '081234567898', 'hendra.g@email.com', 'Jl. Pondok Gede No. 30, Jakarta Timur', 2, 11, 'ACTIVE', '2014-11-22'),
('Linda', 'Susanti', 'Female', '1987-01-17', '081234567899', 'linda.susanti@email.com', 'Jl. Jatinegara No. 8, Jakarta Timur', 2, 11, 'INACTIVE', '2013-05-15'),

-- Sektor 3 - Barat (5 anggota)
('Rudi', 'Hartono', 'Male', '1979-06-28', '081234567800', 'rudi.hartono@email.com', 'Jl. Kebon Jeruk No. 12, Jakarta Barat', 3, 2, 'ACTIVE', '2010-09-01'),
('Yuni', 'Astuti', 'Female', '1991-10-05', '081234567801', 'yuni.astuti@email.com', 'Jl. Grogol No. 25, Jakarta Barat', 3, 5, 'ACTIVE', '2017-04-18'),
('Bambang', 'Setiawan', 'Male', '1984-03-22', '081234567802', 'bambang.s@email.com', 'Jl. Kembangan No. 7, Jakarta Barat', 3, 3, 'ACTIVE', '2015-12-10'),
('Sri', 'Wahyuni', 'Female', '1993-07-14', '081234567803', 'sri.wahyuni@email.com', 'Jl. Cengkareng No. 18, Jakarta Barat', 3, 11, 'PROSPECT', '2023-06-01'),
('Dani', 'Kurniawan', 'Male', '1996-11-29', '081234567804', 'dani.k@email.com', 'Jl. Palmerah No. 33, Jakarta Barat', 3, 7, 'ACTIVE', '2021-02-14'),

-- Sektor 4 - Utara (5 anggota)
('Putri', 'Handayani', 'Female', '1989-02-08', '081234567805', 'putri.h@email.com', 'Jl. Kelapa Gading No. 10, Jakarta Utara', 4, 6, 'ACTIVE', '2016-08-25'),
('Yanto', 'Budiman', 'Male', '1976-08-19', '081234567806', 'yanto.b@email.com', 'Jl. Sunter No. 22, Jakarta Utara', 4, 2, 'ACTIVE', '2009-03-12'),
('Fitri', 'Ayu', 'Female', '1994-04-30', '081234567807', 'fitri.ayu@email.com', 'Jl. Pluit No. 5, Jakarta Utara', 4, 8, 'ACTIVE', '2020-10-05'),
('Herman', 'Tanjung', 'Male', '1981-12-12', '081234567808', 'herman.t@email.com', 'Jl. Ancol No. 15, Jakarta Utara', 4, 4, 'SUSPENDED', '2012-07-20'),
('Nurul', 'Hidayah', 'Female', '1998-09-07', '081234567809', 'nurul.h@email.com', 'Jl. Koja No. 28, Jakarta Utara', 4, 11, 'ACTIVE', '2022-04-01'),

-- Sektor 5 - Selatan (5 anggota)
('Irwan', 'Saputra', 'Male', '1983-05-25', '081234567810', 'irwan.s@email.com', 'Jl. Kemang No. 8, Jakarta Selatan', 5, 3, 'ACTIVE', '2014-01-15'),
('Mega', 'Sari', 'Female', '1990-01-11', '081234567811', 'mega.sari@email.com', 'Jl. Blok M No. 12, Jakarta Selatan', 5, 9, 'ACTIVE', '2017-11-08'),
('Tono', 'Sugiarto', 'Male', '1977-10-03', '081234567812', 'tono.s@email.com', 'Jl. Tebet No. 30, Jakarta Selatan', 5, 10, 'ACTIVE', '2008-06-22'),
('Lina', 'Marlina', 'Female', '1986-06-16', '081234567813', 'lina.m@email.com', 'Jl. Pancoran No. 17, Jakarta Selatan', 5, 5, 'ACTIVE', '2015-09-30'),
('Eko', 'Prasetyo', 'Male', '1999-03-28', '081234567814', 'eko.p@email.com', 'Jl. Cilandak No. 45, Jakarta Selatan', 5, 7, 'ACTIVE', '2023-01-10'),

-- Sektor 6 - Pemuda (5 anggota)
('Kevin', 'Anggara', 'Male', '2000-07-20', '081234567815', 'kevin.a@email.com', 'Jl. Sudirman No. 100, Jakarta', 6, 7, 'ACTIVE', '2022-08-15'),
('Jessica', 'Tanujaya', 'Female', '2001-11-14', '081234567816', 'jessica.t@email.com', 'Jl. Kuningan No. 55, Jakarta', 6, 8, 'ACTIVE', '2023-02-20'),
('Ryan', 'Hidayat', 'Male', '1999-04-08', '081234567817', 'ryan.h@email.com', 'Jl. Senayan No. 12, Jakarta', 6, 11, 'ACTIVE', '2021-05-10'),
('Amanda', 'Putri', 'Female', '2002-08-30', '081234567818', 'amanda.p@email.com', 'Jl. Menteng No. 8, Jakarta', 6, 11, 'PROSPECT', '2024-01-05'),
('Daniel', 'Siahaan', 'Male', '1998-12-25', '081234567819', 'daniel.s@email.com', 'Jl. Cikini No. 25, Jakarta', 6, 7, 'ACTIVE', '2020-09-18');

-- ========================================
-- SEED DATA: ATTENDANCE (Kehadiran)
-- ========================================

-- Ibadah Minggu Januari 2026
INSERT INTO attendance (member_id, attend_date, event, present, note)
SELECT id, '2026-01-05', 'Ibadah Minggu', TRUE, NULL FROM member WHERE status = 'ACTIVE';

INSERT INTO attendance (member_id, attend_date, event, present, note)
SELECT id, '2026-01-12', 'Ibadah Minggu', TRUE, NULL FROM member WHERE status = 'ACTIVE';

INSERT INTO attendance (member_id, attend_date, event, present, note)
SELECT id, '2026-01-19', 'Ibadah Minggu', TRUE, NULL FROM member WHERE status = 'ACTIVE';

INSERT INTO attendance (member_id, attend_date, event, present, note)
SELECT id, '2026-01-26', 'Ibadah Minggu', TRUE, NULL FROM member WHERE status = 'ACTIVE';

-- Ibadah Minggu Desember 2025
INSERT INTO attendance (member_id, attend_date, event, present, note)
SELECT id, '2025-12-07', 'Ibadah Minggu', TRUE, NULL FROM member WHERE status = 'ACTIVE';

INSERT INTO attendance (member_id, attend_date, event, present, note)
SELECT id, '2025-12-14', 'Ibadah Minggu', TRUE, NULL FROM member WHERE status = 'ACTIVE';

INSERT INTO attendance (member_id, attend_date, event, present, note)
SELECT id, '2025-12-21', 'Ibadah Minggu', TRUE, NULL FROM member WHERE status = 'ACTIVE';

INSERT INTO attendance (member_id, attend_date, event, present, note)
SELECT id, '2025-12-25', 'Ibadah Natal', TRUE, 'Perayaan Natal' FROM member WHERE status = 'ACTIVE';

INSERT INTO attendance (member_id, attend_date, event, present, note)
SELECT id, '2025-12-28', 'Ibadah Minggu', TRUE, NULL FROM member WHERE status = 'ACTIVE';

-- Ibadah Minggu November 2025
INSERT INTO attendance (member_id, attend_date, event, present, note)
SELECT id, '2025-11-02', 'Ibadah Minggu', TRUE, NULL FROM member WHERE status = 'ACTIVE';

INSERT INTO attendance (member_id, attend_date, event, present, note)
SELECT id, '2025-11-09', 'Ibadah Minggu', TRUE, NULL FROM member WHERE status = 'ACTIVE';

INSERT INTO attendance (member_id, attend_date, event, present, note)
SELECT id, '2025-11-16', 'Ibadah Minggu', TRUE, NULL FROM member WHERE status = 'ACTIVE';

INSERT INTO attendance (member_id, attend_date, event, present, note)
SELECT id, '2025-11-23', 'Ibadah Minggu', TRUE, NULL FROM member WHERE status = 'ACTIVE';

INSERT INTO attendance (member_id, attend_date, event, present, note)
SELECT id, '2025-11-30', 'Ibadah Minggu', TRUE, NULL FROM member WHERE status = 'ACTIVE';

-- Persekutuan Doa bulanan
INSERT INTO attendance (member_id, attend_date, event, present, note)
SELECT id, '2026-01-15', 'Persekutuan Doa', TRUE, 'Persekutuan doa bulanan'
FROM member WHERE status = 'ACTIVE' LIMIT 15;

INSERT INTO attendance (member_id, attend_date, event, present, note)
SELECT id, '2025-12-18', 'Persekutuan Doa', TRUE, 'Persekutuan doa bulanan'
FROM member WHERE status = 'ACTIVE' LIMIT 12;

-- Rapat Majelis
INSERT INTO attendance (member_id, attend_date, event, present, note)
SELECT m.id, '2026-01-20', 'Rapat Majelis', TRUE, 'Rapat evaluasi bulanan'
FROM member m
JOIN position p ON m.position_id = p.id
WHERE p.name IN ('Pendeta', 'Majelis', 'Sintua', 'Diaken');

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Cek jumlah data
SELECT 'Sectors' as table_name, COUNT(*) as count FROM sector
UNION ALL
SELECT 'Positions', COUNT(*) FROM position
UNION ALL
SELECT 'Members', COUNT(*) FROM member
UNION ALL
SELECT 'Attendance', COUNT(*) FROM attendance;

-- Cek distribusi member per sektor
SELECT s.name as sector_name, COUNT(m.id) as member_count
FROM sector s
LEFT JOIN member m ON s.id = m.sector_id
GROUP BY s.id, s.name
ORDER BY s.id;

-- Cek distribusi member per status
SELECT status, COUNT(*) as count
FROM member
GROUP BY status;
