-- ========================================
-- MAMRE GBKP - Database Repair Script
-- ========================================
-- Jalankan script ini untuk memperbaiki database setelah migration failed
--
-- LANGKAH:
-- 1. Connect ke database mamre di PostgreSQL console
-- 2. Jalankan seluruh script ini
-- ========================================

-- Hapus record migration V2 yang failed dari flyway_schema_history
DELETE FROM flyway_schema_history WHERE version = '2';

-- Jika ingin reset semua Flyway migration (opsional):
-- TRUNCATE TABLE flyway_schema_history;

-- ========================================
-- Verifikasi data yang sudah ada
-- ========================================
SELECT 'Sectors' as table_name, COUNT(*) as count FROM sector
UNION ALL
SELECT 'Positions', COUNT(*) FROM position
UNION ALL
SELECT 'Members', COUNT(*) FROM member
UNION ALL
SELECT 'Attendance', COUNT(*) FROM attendance;

-- ========================================
-- Jika ingin menambah data yang belum ada:
-- ========================================

-- Insert Sectors yang belum ada
INSERT INTO sector (code, name, description)
SELECT * FROM (VALUES
    ('SEC-001', 'Sektor 1 - Pusat', 'Sektor pusat kota'),
    ('SEC-002', 'Sektor 2 - Timur', 'Sektor wilayah timur'),
    ('SEC-003', 'Sektor 3 - Barat', 'Sektor wilayah barat'),
    ('SEC-004', 'Sektor 4 - Utara', 'Sektor wilayah utara'),
    ('SEC-005', 'Sektor 5 - Selatan', 'Sektor wilayah selatan'),
    ('SEC-006', 'Sektor 6 - Pemuda', 'Sektor khusus pemuda')
) AS t(code, name, description)
WHERE NOT EXISTS (SELECT 1 FROM sector WHERE sector.code = t.code);

-- Insert Positions yang belum ada
INSERT INTO position (name, description)
SELECT * FROM (VALUES
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
    ('Anggota', 'Anggota jemaat biasa')
) AS t(name, description)
WHERE NOT EXISTS (SELECT 1 FROM position WHERE LOWER(position.name) = LOWER(t.name));

-- Insert Members (hanya jika belum ada berdasarkan email)
INSERT INTO member (first_name, last_name, gender, birth_date, phone, email, address, sector_id, position_id, status, joined_date)
SELECT t.first_name, t.last_name, t.gender, t.birth_date::DATE, t.phone, t.email, t.address,
       s.id, p.id, t.status, t.joined_date::DATE
FROM (VALUES
    ('Budi', 'Santoso', 'Male', '1975-03-15', '081234567890', 'budi.santoso@email.com', 'Jl. Merdeka No. 10, Jakarta Pusat', 'SEC-001', 'Pendeta', 'ACTIVE', '2010-01-01'),
    ('Siti', 'Rahayu', 'Female', '1980-07-22', '081234567891', 'siti.rahayu@email.com', 'Jl. Sudirman No. 25, Jakarta Pusat', 'SEC-001', 'Majelis', 'ACTIVE', '2012-06-15'),
    ('Agus', 'Wijaya', 'Male', '1985-11-08', '081234567892', 'agus.wijaya@email.com', 'Jl. Thamrin No. 5, Jakarta Pusat', 'SEC-001', 'Sintua', 'ACTIVE', '2015-03-20'),
    ('Maria', 'Sinaga', 'Female', '1990-02-14', '081234567893', 'maria.sinaga@email.com', 'Jl. Gatot Subroto No. 12, Jakarta Pusat', 'SEC-001', 'Guru Sekolah Minggu', 'ACTIVE', '2018-08-10'),
    ('Johanes', 'Simanjuntak', 'Male', '1978-09-30', '081234567894', 'johanes.s@email.com', 'Jl. HR Rasuna Said No. 8, Jakarta Pusat', 'SEC-001', 'Diaken', 'ACTIVE', '2011-04-05'),
    ('Dewi', 'Lestari', 'Female', '1988-05-18', '081234567895', 'dewi.lestari@email.com', 'Jl. Raya Bekasi No. 45, Jakarta Timur', 'SEC-002', 'Koordinator Sektor', 'ACTIVE', '2016-02-28'),
    ('Andi', 'Pratama', 'Male', '1992-12-03', '081234567896', 'andi.pratama@email.com', 'Jl. Cililitan No. 20, Jakarta Timur', 'SEC-002', 'Pengurus Pemuda', 'ACTIVE', '2019-07-12'),
    ('Rina', 'Wati', 'Female', '1995-08-25', '081234567897', 'rina.wati@email.com', 'Jl. Kalimalang No. 15, Jakarta Timur', 'SEC-002', 'Anggota Paduan Suara', 'ACTIVE', '2020-01-08'),
    ('Hendra', 'Gunawan', 'Male', '1982-04-10', '081234567898', 'hendra.g@email.com', 'Jl. Pondok Gede No. 30, Jakarta Timur', 'SEC-002', 'Anggota', 'ACTIVE', '2014-11-22'),
    ('Linda', 'Susanti', 'Female', '1987-01-17', '081234567899', 'linda.susanti@email.com', 'Jl. Jatinegara No. 8, Jakarta Timur', 'SEC-002', 'Anggota', 'INACTIVE', '2013-05-15'),
    ('Rudi', 'Hartono', 'Male', '1979-06-28', '081234567800', 'rudi.hartono@email.com', 'Jl. Kebon Jeruk No. 12, Jakarta Barat', 'SEC-003', 'Majelis', 'ACTIVE', '2010-09-01'),
    ('Yuni', 'Astuti', 'Female', '1991-10-05', '081234567801', 'yuni.astuti@email.com', 'Jl. Grogol No. 25, Jakarta Barat', 'SEC-003', 'Guru Sekolah Minggu', 'ACTIVE', '2017-04-18'),
    ('Bambang', 'Setiawan', 'Male', '1984-03-22', '081234567802', 'bambang.s@email.com', 'Jl. Kembangan No. 7, Jakarta Barat', 'SEC-003', 'Sintua', 'ACTIVE', '2015-12-10'),
    ('Sri', 'Wahyuni', 'Female', '1993-07-14', '081234567803', 'sri.wahyuni@email.com', 'Jl. Cengkareng No. 18, Jakarta Barat', 'SEC-003', 'Anggota', 'PROSPECT', '2023-06-01'),
    ('Dani', 'Kurniawan', 'Male', '1996-11-29', '081234567804', 'dani.k@email.com', 'Jl. Palmerah No. 33, Jakarta Barat', 'SEC-003', 'Pengurus Pemuda', 'ACTIVE', '2021-02-14'),
    ('Putri', 'Handayani', 'Female', '1989-02-08', '081234567805', 'putri.h@email.com', 'Jl. Kelapa Gading No. 10, Jakarta Utara', 'SEC-004', 'Koordinator Sektor', 'ACTIVE', '2016-08-25'),
    ('Yanto', 'Budiman', 'Male', '1976-08-19', '081234567806', 'yanto.b@email.com', 'Jl. Sunter No. 22, Jakarta Utara', 'SEC-004', 'Majelis', 'ACTIVE', '2009-03-12'),
    ('Fitri', 'Ayu', 'Female', '1994-04-30', '081234567807', 'fitri.ayu@email.com', 'Jl. Pluit No. 5, Jakarta Utara', 'SEC-004', 'Anggota Paduan Suara', 'ACTIVE', '2020-10-05'),
    ('Herman', 'Tanjung', 'Male', '1981-12-12', '081234567808', 'herman.t@email.com', 'Jl. Ancol No. 15, Jakarta Utara', 'SEC-004', 'Diaken', 'SUSPENDED', '2012-07-20'),
    ('Nurul', 'Hidayah', 'Female', '1998-09-07', '081234567809', 'nurul.h@email.com', 'Jl. Koja No. 28, Jakarta Utara', 'SEC-004', 'Anggota', 'ACTIVE', '2022-04-01'),
    ('Irwan', 'Saputra', 'Male', '1983-05-25', '081234567810', 'irwan.s@email.com', 'Jl. Kemang No. 8, Jakarta Selatan', 'SEC-005', 'Sintua', 'ACTIVE', '2014-01-15'),
    ('Mega', 'Sari', 'Female', '1990-01-11', '081234567811', 'mega.sari@email.com', 'Jl. Blok M No. 12, Jakarta Selatan', 'SEC-005', 'Bendahara', 'ACTIVE', '2017-11-08'),
    ('Tono', 'Sugiarto', 'Male', '1977-10-03', '081234567812', 'tono.s@email.com', 'Jl. Tebet No. 30, Jakarta Selatan', 'SEC-005', 'Sekretaris', 'ACTIVE', '2008-06-22'),
    ('Lina', 'Marlina', 'Female', '1986-06-16', '081234567813', 'lina.m@email.com', 'Jl. Pancoran No. 17, Jakarta Selatan', 'SEC-005', 'Guru Sekolah Minggu', 'ACTIVE', '2015-09-30'),
    ('Eko', 'Prasetyo', 'Male', '1999-03-28', '081234567814', 'eko.p@email.com', 'Jl. Cilandak No. 45, Jakarta Selatan', 'SEC-005', 'Pengurus Pemuda', 'ACTIVE', '2023-01-10'),
    ('Kevin', 'Anggara', 'Male', '2000-07-20', '081234567815', 'kevin.a@email.com', 'Jl. Sudirman No. 100, Jakarta', 'SEC-006', 'Pengurus Pemuda', 'ACTIVE', '2022-08-15'),
    ('Jessica', 'Tanujaya', 'Female', '2001-11-14', '081234567816', 'jessica.t@email.com', 'Jl. Kuningan No. 55, Jakarta', 'SEC-006', 'Anggota Paduan Suara', 'ACTIVE', '2023-02-20'),
    ('Ryan', 'Hidayat', 'Male', '1999-04-08', '081234567817', 'ryan.h@email.com', 'Jl. Senayan No. 12, Jakarta', 'SEC-006', 'Anggota', 'ACTIVE', '2021-05-10'),
    ('Amanda', 'Putri', 'Female', '2002-08-30', '081234567818', 'amanda.p@email.com', 'Jl. Menteng No. 8, Jakarta', 'SEC-006', 'Anggota', 'PROSPECT', '2024-01-05'),
    ('Daniel', 'Siahaan', 'Male', '1998-12-25', '081234567819', 'daniel.s@email.com', 'Jl. Cikini No. 25, Jakarta', 'SEC-006', 'Pengurus Pemuda', 'ACTIVE', '2020-09-18')
) AS t(first_name, last_name, gender, birth_date, phone, email, address, sector_code, position_name, status, joined_date)
LEFT JOIN sector s ON s.code = t.sector_code
LEFT JOIN position p ON LOWER(p.name) = LOWER(t.position_name)
WHERE NOT EXISTS (SELECT 1 FROM member m WHERE LOWER(m.email) = LOWER(t.email));

-- Insert Attendance data untuk member yang ada
INSERT INTO attendance (member_id, attend_date, event, present, note)
SELECT m.id, '2026-01-05'::DATE, 'Ibadah Minggu', TRUE, NULL
FROM member m
WHERE m.status = 'ACTIVE'
  AND NOT EXISTS (
    SELECT 1 FROM attendance a
    WHERE a.member_id = m.id AND a.attend_date = '2026-01-05' AND a.event = 'Ibadah Minggu'
  );

INSERT INTO attendance (member_id, attend_date, event, present, note)
SELECT m.id, '2026-01-12'::DATE, 'Ibadah Minggu', TRUE, NULL
FROM member m
WHERE m.status = 'ACTIVE'
  AND NOT EXISTS (
    SELECT 1 FROM attendance a
    WHERE a.member_id = m.id AND a.attend_date = '2026-01-12' AND a.event = 'Ibadah Minggu'
  );

INSERT INTO attendance (member_id, attend_date, event, present, note)
SELECT m.id, '2026-01-19'::DATE, 'Ibadah Minggu', TRUE, NULL
FROM member m
WHERE m.status = 'ACTIVE'
  AND NOT EXISTS (
    SELECT 1 FROM attendance a
    WHERE a.member_id = m.id AND a.attend_date = '2026-01-19' AND a.event = 'Ibadah Minggu'
  );

INSERT INTO attendance (member_id, attend_date, event, present, note)
SELECT m.id, '2026-01-26'::DATE, 'Ibadah Minggu', TRUE, NULL
FROM member m
WHERE m.status = 'ACTIVE'
  AND NOT EXISTS (
    SELECT 1 FROM attendance a
    WHERE a.member_id = m.id AND a.attend_date = '2026-01-26' AND a.event = 'Ibadah Minggu'
  );

-- ========================================
-- Verifikasi hasil akhir
-- ========================================
SELECT 'Sectors' as table_name, COUNT(*) as count FROM sector
UNION ALL
SELECT 'Positions', COUNT(*) FROM position
UNION ALL
SELECT 'Members', COUNT(*) FROM member
UNION ALL
SELECT 'Attendance', COUNT(*) FROM attendance;

SELECT s.name as sector_name, COUNT(m.id) as member_count
FROM sector s
LEFT JOIN member m ON s.id = m.sector_id
GROUP BY s.id, s.name
ORDER BY s.id;

SELECT status, COUNT(*) as count FROM member GROUP BY status;
