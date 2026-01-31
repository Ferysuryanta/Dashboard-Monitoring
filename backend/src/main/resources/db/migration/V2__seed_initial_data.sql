-- V2__seed_initial_data.sql
-- Seed data untuk testing dan development
-- Menggunakan ON CONFLICT untuk menghindari error jika data sudah ada

-- Insert Sectors (Sektor gereja)
INSERT INTO sector (code, name, description) VALUES
('SEC-001', 'Sektor 1 - Pusat', 'Sektor pusat kota'),
('SEC-002', 'Sektor 2 - Timur', 'Sektor wilayah timur'),
('SEC-003', 'Sektor 3 - Barat', 'Sektor wilayah barat'),
('SEC-004', 'Sektor 4 - Utara', 'Sektor wilayah utara'),
('SEC-005', 'Sektor 5 - Selatan', 'Sektor wilayah selatan'),
('SEC-006', 'Sektor 6 - Pemuda', 'Sektor khusus pemuda')
ON CONFLICT (code) DO NOTHING;

-- Insert Positions (Jabatan) - menggunakan DO NOTHING jika name sudah ada
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

-- Insert Members (Anggota jemaat)
INSERT INTO member (first_name, last_name, gender, birth_date, phone, email, address, sector_id, position_id, status, joined_date) VALUES
-- Sektor 1
('Budi', 'Santoso', 'Male', '1975-03-15', '081234567890', 'budi.santoso@email.com', 'Jl. Merdeka No. 10, Jakarta Pusat', 1, 1, 'ACTIVE', '2010-01-01'),
('Siti', 'Rahayu', 'Female', '1980-07-22', '081234567891', 'siti.rahayu@email.com', 'Jl. Sudirman No. 25, Jakarta Pusat', 1, 2, 'ACTIVE', '2012-06-15'),
('Agus', 'Wijaya', 'Male', '1985-11-08', '081234567892', 'agus.wijaya@email.com', 'Jl. Thamrin No. 5, Jakarta Pusat', 1, 3, 'ACTIVE', '2015-03-20'),
('Maria', 'Sinaga', 'Female', '1990-02-14', '081234567893', 'maria.sinaga@email.com', 'Jl. Gatot Subroto No. 12, Jakarta Pusat', 1, 5, 'ACTIVE', '2018-08-10'),
('Johanes', 'Simanjuntak', 'Male', '1978-09-30', '081234567894', 'johanes.s@email.com', 'Jl. HR Rasuna Said No. 8, Jakarta Pusat', 1, 4, 'ACTIVE', '2011-04-05'),

-- Sektor 2
('Dewi', 'Lestari', 'Female', '1988-05-18', '081234567895', 'dewi.lestari@email.com', 'Jl. Raya Bekasi No. 45, Jakarta Timur', 2, 6, 'ACTIVE', '2016-02-28'),
('Andi', 'Pratama', 'Male', '1992-12-03', '081234567896', 'andi.pratama@email.com', 'Jl. Cililitan No. 20, Jakarta Timur', 2, 7, 'ACTIVE', '2019-07-12'),
('Rina', 'Wati', 'Female', '1995-08-25', '081234567897', 'rina.wati@email.com', 'Jl. Kalimalang No. 15, Jakarta Timur', 2, 8, 'ACTIVE', '2020-01-08'),
('Hendra', 'Gunawan', 'Male', '1982-04-10', '081234567898', 'hendra.g@email.com', 'Jl. Pondok Gede No. 30, Jakarta Timur', 2, 11, 'ACTIVE', '2014-11-22'),
('Linda', 'Susanti', 'Female', '1987-01-17', '081234567899', 'linda.susanti@email.com', 'Jl. Jatinegara No. 8, Jakarta Timur', 2, 11, 'INACTIVE', '2013-05-15'),

-- Sektor 3
('Rudi', 'Hartono', 'Male', '1979-06-28', '081234567800', 'rudi.hartono@email.com', 'Jl. Kebon Jeruk No. 12, Jakarta Barat', 3, 2, 'ACTIVE', '2010-09-01'),
('Yuni', 'Astuti', 'Female', '1991-10-05', '081234567801', 'yuni.astuti@email.com', 'Jl. Grogol No. 25, Jakarta Barat', 3, 5, 'ACTIVE', '2017-04-18'),
('Bambang', 'Setiawan', 'Male', '1984-03-22', '081234567802', 'bambang.s@email.com', 'Jl. Kembangan No. 7, Jakarta Barat', 3, 3, 'ACTIVE', '2015-12-10'),
('Sri', 'Wahyuni', 'Female', '1993-07-14', '081234567803', 'sri.wahyuni@email.com', 'Jl. Cengkareng No. 18, Jakarta Barat', 3, 11, 'PROSPECT', '2023-06-01'),
('Dani', 'Kurniawan', 'Male', '1996-11-29', '081234567804', 'dani.k@email.com', 'Jl. Palmerah No. 33, Jakarta Barat', 3, 7, 'ACTIVE', '2021-02-14'),

-- Sektor 4
('Putri', 'Handayani', 'Female', '1989-02-08', '081234567805', 'putri.h@email.com', 'Jl. Kelapa Gading No. 10, Jakarta Utara', 4, 6, 'ACTIVE', '2016-08-25'),
('Yanto', 'Budiman', 'Male', '1976-08-19', '081234567806', 'yanto.b@email.com', 'Jl. Sunter No. 22, Jakarta Utara', 4, 2, 'ACTIVE', '2009-03-12'),
('Fitri', 'Ayu', 'Female', '1994-04-30', '081234567807', 'fitri.ayu@email.com', 'Jl. Pluit No. 5, Jakarta Utara', 4, 8, 'ACTIVE', '2020-10-05'),
('Herman', 'Tanjung', 'Male', '1981-12-12', '081234567808', 'herman.t@email.com', 'Jl. Ancol No. 15, Jakarta Utara', 4, 4, 'SUSPENDED', '2012-07-20'),
('Nurul', 'Hidayah', 'Female', '1998-09-07', '081234567809', 'nurul.h@email.com', 'Jl. Koja No. 28, Jakarta Utara', 4, 11, 'ACTIVE', '2022-04-01'),

-- Sektor 5
('Irwan', 'Saputra', 'Male', '1983-05-25', '081234567810', 'irwan.s@email.com', 'Jl. Kemang No. 8, Jakarta Selatan', 5, 3, 'ACTIVE', '2014-01-15'),
('Mega', 'Sari', 'Female', '1990-01-11', '081234567811', 'mega.sari@email.com', 'Jl. Blok M No. 12, Jakarta Selatan', 5, 9, 'ACTIVE', '2017-11-08'),
('Tono', 'Sugiarto', 'Male', '1977-10-03', '081234567812', 'tono.s@email.com', 'Jl. Tebet No. 30, Jakarta Selatan', 5, 10, 'ACTIVE', '2008-06-22'),
('Lina', 'Marlina', 'Female', '1986-06-16', '081234567813', 'lina.m@email.com', 'Jl. Pancoran No. 17, Jakarta Selatan', 5, 5, 'ACTIVE', '2015-09-30'),
('Eko', 'Prasetyo', 'Male', '1999-03-28', '081234567814', 'eko.p@email.com', 'Jl. Cilandak No. 45, Jakarta Selatan', 5, 7, 'ACTIVE', '2023-01-10'),

-- Sektor 6 (Pemuda)
('Kevin', 'Anggara', 'Male', '2000-07-20', '081234567815', 'kevin.a@email.com', 'Jl. Sudirman No. 100, Jakarta', 6, 7, 'ACTIVE', '2022-08-15'),
('Jessica', 'Tanujaya', 'Female', '2001-11-14', '081234567816', 'jessica.t@email.com', 'Jl. Kuningan No. 55, Jakarta', 6, 8, 'ACTIVE', '2023-02-20'),
('Ryan', 'Hidayat', 'Male', '1999-04-08', '081234567817', 'ryan.h@email.com', 'Jl. Senayan No. 12, Jakarta', 6, 11, 'ACTIVE', '2021-05-10'),
('Amanda', 'Putri', 'Female', '2002-08-30', '081234567818', 'amanda.p@email.com', 'Jl. Menteng No. 8, Jakarta', 6, 11, 'PROSPECT', '2024-01-05'),
('Daniel', 'Siahaan', 'Male', '1998-12-25', '081234567819', 'daniel.s@email.com', 'Jl. Cikini No. 25, Jakarta', 6, 7, 'ACTIVE', '2020-09-18');

-- Insert Attendance Records (Data kehadiran)
-- Menggunakan CTE untuk mendapatkan member IDs
DO $$
DECLARE
    member_rec RECORD;
    attendance_date DATE;
    events TEXT[] := ARRAY['Ibadah Minggu', 'Persekutuan Doa', 'Ibadah Keluarga', 'Rapat Majelis', 'Latihan Paduan Suara'];
BEGIN
    -- Insert attendance for each member for the last 3 months
    FOR member_rec IN SELECT id FROM member WHERE status = 'ACTIVE' LOOP
        -- January 2026 attendance
        FOR i IN 1..4 LOOP
            attendance_date := DATE '2026-01-01' + (i * 7 - 1);
            INSERT INTO attendance (member_id, attend_date, event, present, note)
            VALUES (member_rec.id, attendance_date, 'Ibadah Minggu', random() > 0.15, NULL);
        END LOOP;

        -- December 2025 attendance
        FOR i IN 1..4 LOOP
            attendance_date := DATE '2025-12-01' + (i * 7 - 1);
            INSERT INTO attendance (member_id, attend_date, event, present, note)
            VALUES (member_rec.id, attendance_date, 'Ibadah Minggu', random() > 0.2, NULL);
        END LOOP;

        -- November 2025 attendance
        FOR i IN 1..4 LOOP
            attendance_date := DATE '2025-11-01' + (i * 7 - 1);
            INSERT INTO attendance (member_id, attend_date, event, present, note)
            VALUES (member_rec.id, attendance_date, 'Ibadah Minggu', random() > 0.2, NULL);
        END LOOP;
    END LOOP;
END $$;

-- Tambahan: Insert beberapa attendance untuk event lain
INSERT INTO attendance (member_id, attend_date, event, present, note)
SELECT
    m.id,
    '2026-01-15'::DATE,
    'Persekutuan Doa',
    TRUE,
    'Persekutuan doa bulanan'
FROM member m
WHERE m.status = 'ACTIVE'
LIMIT 15;

INSERT INTO attendance (member_id, attend_date, event, present, note)
SELECT
    m.id,
    '2026-01-20'::DATE,
    'Rapat Majelis',
    TRUE,
    'Rapat evaluasi bulanan'
FROM member m
JOIN position p ON m.position_id = p.id
WHERE p.name IN ('Pendeta', 'Majelis', 'Sintua', 'Diaken');
