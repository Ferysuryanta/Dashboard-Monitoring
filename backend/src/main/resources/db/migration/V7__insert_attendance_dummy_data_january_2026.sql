-- V7: Insert dummy attendance data for January 2026
-- Data untuk menggambarkan implementasi laporan kehadiran per sektor

-- Pastikan member sudah ada dengan sector yang benar
-- Untuk setiap sektor, kita akan insert data kehadiran Minggu 1-4

-- Get member IDs by sector and insert attendance data
-- Minggu 1: 1-7 Januari 2026
-- Minggu 2: 8-14 Januari 2026
-- Minggu 3: 15-21 Januari 2026
-- Minggu 4: 22-31 Januari 2026

-- ========================================
-- SEKTOR CIMANGGU (ID akan disesuaikan)
-- ========================================

-- Minggu 1 (5 Januari 2026 - Minggu)
INSERT INTO attendance (member_id, attend_date, event, present, kolpi_amount, note, created_at)
SELECT m.id, '2026-01-05', 'Ibadah Minggu', true, 50000, 'Ibadah Minggu Sektor', NOW()
FROM member m
JOIN sector s ON m.sector_id = s.id
WHERE s.name LIKE '%Cimanggu%' OR s.name LIKE '%CIMANGGU%'
LIMIT 13;

-- Minggu 2 (12 Januari 2026 - Minggu)
INSERT INTO attendance (member_id, attend_date, event, present, kolpi_amount, note, created_at)
SELECT m.id, '2026-01-12', 'Ibadah Minggu', true, 45000, 'Ibadah Minggu Sektor', NOW()
FROM member m
JOIN sector s ON m.sector_id = s.id
WHERE s.name LIKE '%Cimanggu%' OR s.name LIKE '%CIMANGGU%'
LIMIT 10;

-- Minggu 3 (19 Januari 2026 - Minggu)
INSERT INTO attendance (member_id, attend_date, event, present, kolpi_amount, note, created_at)
SELECT m.id, '2026-01-19', 'Ibadah Minggu', true, 55000, 'Ibadah Minggu Sektor', NOW()
FROM member m
JOIN sector s ON m.sector_id = s.id
WHERE s.name LIKE '%Cimanggu%' OR s.name LIKE '%CIMANGGU%'
LIMIT 11;

-- Minggu 4 (26 Januari 2026 - Minggu)
INSERT INTO attendance (member_id, attend_date, event, present, kolpi_amount, note, created_at)
SELECT m.id, '2026-01-26', 'Ibadah Minggu', true, 48000, 'Ibadah Minggu Sektor', NOW()
FROM member m
JOIN sector s ON m.sector_id = s.id
WHERE s.name LIKE '%Cimanggu%' OR s.name LIKE '%CIMANGGU%'
LIMIT 12;

-- ========================================
-- SEKTOR SUKADAME
-- ========================================

-- Minggu 1
INSERT INTO attendance (member_id, attend_date, event, present, kolpi_amount, note, created_at)
SELECT m.id, '2026-01-05', 'Ibadah Minggu', true, 60000, 'Ibadah Minggu Sektor', NOW()
FROM member m
JOIN sector s ON m.sector_id = s.id
WHERE s.name LIKE '%Sukadame%' OR s.name LIKE '%SUKADAME%'
LIMIT 22;

-- Minggu 2
INSERT INTO attendance (member_id, attend_date, event, present, kolpi_amount, note, created_at)
SELECT m.id, '2026-01-12', 'Ibadah Minggu', true, 55000, 'Ibadah Minggu Sektor', NOW()
FROM member m
JOIN sector s ON m.sector_id = s.id
WHERE s.name LIKE '%Sukadame%' OR s.name LIKE '%SUKADAME%'
LIMIT 18;

-- Minggu 3
INSERT INTO attendance (member_id, attend_date, event, present, kolpi_amount, note, created_at)
SELECT m.id, '2026-01-19', 'Ibadah Minggu', true, 65000, 'Ibadah Minggu Sektor', NOW()
FROM member m
JOIN sector s ON m.sector_id = s.id
WHERE s.name LIKE '%Sukadame%' OR s.name LIKE '%SUKADAME%'
LIMIT 20;

-- Minggu 4
INSERT INTO attendance (member_id, attend_date, event, present, kolpi_amount, note, created_at)
SELECT m.id, '2026-01-26', 'Ibadah Minggu', true, 58000, 'Ibadah Minggu Sektor', NOW()
FROM member m
JOIN sector s ON m.sector_id = s.id
WHERE s.name LIKE '%Sukadame%' OR s.name LIKE '%SUKADAME%'
LIMIT 19;

-- ========================================
-- SEKTOR SALEBENDA
-- ========================================

-- Minggu 1
INSERT INTO attendance (member_id, attend_date, event, present, kolpi_amount, note, created_at)
SELECT m.id, '2026-01-05', 'Ibadah Minggu', true, 45000, 'Ibadah Minggu Sektor', NOW()
FROM member m
JOIN sector s ON m.sector_id = s.id
WHERE s.name LIKE '%Salebenda%' OR s.name LIKE '%SALEBENDA%' OR s.name LIKE '%Salabenda%'
LIMIT 18;

-- Minggu 2
INSERT INTO attendance (member_id, attend_date, event, present, kolpi_amount, note, created_at)
SELECT m.id, '2026-01-12', 'Ibadah Minggu', true, 42000, 'Ibadah Minggu Sektor', NOW()
FROM member m
JOIN sector s ON m.sector_id = s.id
WHERE s.name LIKE '%Salebenda%' OR s.name LIKE '%SALEBENDA%' OR s.name LIKE '%Salabenda%'
LIMIT 15;

-- Minggu 3
INSERT INTO attendance (member_id, attend_date, event, present, kolpi_amount, note, created_at)
SELECT m.id, '2026-01-19', 'Ibadah Minggu', true, 48000, 'Ibadah Minggu Sektor', NOW()
FROM member m
JOIN sector s ON m.sector_id = s.id
WHERE s.name LIKE '%Salebenda%' OR s.name LIKE '%SALEBENDA%' OR s.name LIKE '%Salabenda%'
LIMIT 16;

-- Minggu 4
INSERT INTO attendance (member_id, attend_date, event, present, kolpi_amount, note, created_at)
SELECT m.id, '2026-01-26', 'Ibadah Minggu', true, 46000, 'Ibadah Minggu Sektor', NOW()
FROM member m
JOIN sector s ON m.sector_id = s.id
WHERE s.name LIKE '%Salebenda%' OR s.name LIKE '%SALEBENDA%' OR s.name LIKE '%Salabenda%'
LIMIT 17;

-- ========================================
-- SEKTOR SEMPLAK
-- ========================================

-- Minggu 1
INSERT INTO attendance (member_id, attend_date, event, present, kolpi_amount, note, created_at)
SELECT m.id, '2026-01-05', 'Ibadah Minggu', true, 70000, 'Ibadah Minggu Sektor', NOW()
FROM member m
JOIN sector s ON m.sector_id = s.id
WHERE s.name LIKE '%Semplak%' OR s.name LIKE '%SEMPLAK%'
LIMIT 24;

-- Minggu 2
INSERT INTO attendance (member_id, attend_date, event, present, kolpi_amount, note, created_at)
SELECT m.id, '2026-01-12', 'Ibadah Minggu', true, 65000, 'Ibadah Minggu Sektor', NOW()
FROM member m
JOIN sector s ON m.sector_id = s.id
WHERE s.name LIKE '%Semplak%' OR s.name LIKE '%SEMPLAK%'
LIMIT 20;

-- Minggu 3
INSERT INTO attendance (member_id, attend_date, event, present, kolpi_amount, note, created_at)
SELECT m.id, '2026-01-19', 'Ibadah Minggu', true, 72000, 'Ibadah Minggu Sektor', NOW()
FROM member m
JOIN sector s ON m.sector_id = s.id
WHERE s.name LIKE '%Semplak%' OR s.name LIKE '%SEMPLAK%'
LIMIT 22;

-- Minggu 4
INSERT INTO attendance (member_id, attend_date, event, present, kolpi_amount, note, created_at)
SELECT m.id, '2026-01-26', 'Ibadah Minggu', true, 68000, 'Ibadah Minggu Sektor', NOW()
FROM member m
JOIN sector s ON m.sector_id = s.id
WHERE s.name LIKE '%Semplak%' OR s.name LIKE '%SEMPLAK%'
LIMIT 21;

-- ========================================
-- SEKTOR YASMIN
-- ========================================

-- Minggu 1
INSERT INTO attendance (member_id, attend_date, event, present, kolpi_amount, note, created_at)
SELECT m.id, '2026-01-05', 'Ibadah Minggu', true, 40000, 'Ibadah Minggu Sektor', NOW()
FROM member m
JOIN sector s ON m.sector_id = s.id
WHERE s.name LIKE '%Yasmin%' OR s.name LIKE '%YASMIN%'
LIMIT 16;

-- Minggu 2
INSERT INTO attendance (member_id, attend_date, event, present, kolpi_amount, note, created_at)
SELECT m.id, '2026-01-12', 'Ibadah Minggu', true, 38000, 'Ibadah Minggu Sektor', NOW()
FROM member m
JOIN sector s ON m.sector_id = s.id
WHERE s.name LIKE '%Yasmin%' OR s.name LIKE '%YASMIN%'
LIMIT 14;

-- Minggu 3
INSERT INTO attendance (member_id, attend_date, event, present, kolpi_amount, note, created_at)
SELECT m.id, '2026-01-19', 'Ibadah Minggu', true, 42000, 'Ibadah Minggu Sektor', NOW()
FROM member m
JOIN sector s ON m.sector_id = s.id
WHERE s.name LIKE '%Yasmin%' OR s.name LIKE '%YASMIN%'
LIMIT 15;

-- Minggu 4
INSERT INTO attendance (member_id, attend_date, event, present, kolpi_amount, note, created_at)
SELECT m.id, '2026-01-26', 'Ibadah Minggu', true, 41000, 'Ibadah Minggu Sektor', NOW()
FROM member m
JOIN sector s ON m.sector_id = s.id
WHERE s.name LIKE '%Yasmin%' OR s.name LIKE '%YASMIN%'
LIMIT 16;
