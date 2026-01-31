-- V3__add_sample_data_for_new_features.sql
-- Menambahkan data contoh untuk fitur baru dashboard
-- Gender Distribution, Status Distribution, dan Upcoming Birthdays

-- Update beberapa member agar memiliki tanggal lahir yang akan datang (dalam 30 hari ke depan)
-- Berdasarkan tanggal sekarang: 31 Januari 2026

-- Update member dengan ulang tahun yang akan datang
UPDATE member SET birth_date = '1990-02-01' WHERE email = 'budi.santoso@email.com'; -- Besok (1 Feb)
UPDATE member SET birth_date = '1985-02-03' WHERE email = 'siti.rahayu@email.com'; -- 3 hari lagi
UPDATE member SET birth_date = '1992-02-07' WHERE email = 'agus.wijaya@email.com'; -- 7 hari lagi
UPDATE member SET birth_date = '1988-02-14' WHERE email = 'maria.sinaga@email.com'; -- Valentine
UPDATE member SET birth_date = '1995-02-20' WHERE email = 'dewi.lestari@email.com'; -- 20 hari lagi

-- Tambah member baru dengan berbagai gender dan status untuk testing
INSERT INTO member (first_name, last_name, gender, birth_date, phone, email, address, sector_id, position_id, status, joined_date) VALUES
-- Member dengan ulang tahun hari ini (31 Jan)
('Grace', 'Simbolon', 'Female', '1993-01-31', '081234567820', 'grace.simbolon@email.com', 'Jl. Kebayoran No. 15, Jakarta Selatan', 5, 11, 'ACTIVE', '2024-06-15'),

-- Member dengan berbagai status
('Robert', 'Napitupulu', 'Male', '1987-06-12', '081234567821', 'robert.n@email.com', 'Jl. Cempaka Putih No. 20, Jakarta Pusat', 1, 11, 'PROSPECT', '2025-12-01'),
('Christine', 'Siburian', 'Female', '1991-08-25', '081234567822', 'christine.s@email.com', 'Jl. Rawamangun No. 8, Jakarta Timur', 2, 11, 'SUSPENDED', '2020-03-10'),
('Michael', 'Tampubolon', 'Male', '1989-04-18', '081234567823', 'michael.t@email.com', 'Jl. Pulo Gadung No. 12, Jakarta Timur', 2, 11, 'INACTIVE', '2019-07-22'),

-- Member dengan ulang tahun dalam 30 hari
('Sarah', 'Manurung', 'Female', '1996-02-05', '081234567824', 'sarah.m@email.com', 'Jl. Mangga Besar No. 30, Jakarta Barat', 3, 8, 'ACTIVE', '2023-09-01'),
('David', 'Hutapea', 'Male', '1994-02-10', '081234567825', 'david.h@email.com', 'Jl. Hayam Wuruk No. 45, Jakarta Barat', 3, 7, 'ACTIVE', '2022-11-15'),
('Rachel', 'Panjaitan', 'Female', '1997-02-15', '081234567826', 'rachel.p@email.com', 'Jl. Tanjung Priok No. 18, Jakarta Utara', 4, 11, 'ACTIVE', '2024-02-20'),
('Jonathan', 'Situmorang', 'Male', '1992-02-25', '081234567827', 'jonathan.s@email.com', 'Jl. PIK No. 22, Jakarta Utara', 4, 11, 'ACTIVE', '2021-08-08'),

-- Lebih banyak member untuk distribusi gender yang lebih seimbang
('Natalie', 'Sinurat', 'Female', '1990-09-12', '081234567828', 'natalie.s@email.com', 'Jl. Pondok Indah No. 5, Jakarta Selatan', 5, 5, 'ACTIVE', '2023-04-10'),
('Peter', 'Aritonang', 'Male', '1988-11-30', '081234567829', 'peter.a@email.com', 'Jl. Fatmawati No. 28, Jakarta Selatan', 5, 4, 'ACTIVE', '2020-01-15'),
('Monica', 'Silalahi', 'Female', '1995-03-08', '081234567830', 'monica.s@email.com', 'Jl. Senopati No. 10, Jakarta Selatan', 5, 11, 'ACTIVE', '2024-05-20'),
('Andrew', 'Simangunsong', 'Male', '1993-07-22', '081234567831', 'andrew.s@email.com', 'Jl. Setiabudi No. 35, Jakarta Selatan', 5, 11, 'ACTIVE', '2023-08-01'),

-- Member untuk sektor Pemuda
('Stephanie', 'Hutabarat', 'Female', '2001-02-08', '081234567832', 'stephanie.h@email.com', 'Jl. Sudirman No. 120, Jakarta', 6, 7, 'ACTIVE', '2024-03-15'),
('Timothy', 'Nababan', 'Male', '2000-02-12', '081234567833', 'timothy.n@email.com', 'Jl. Thamrin No. 88, Jakarta', 6, 8, 'ACTIVE', '2023-07-10'),
('Olivia', 'Pardede', 'Female', '2002-02-18', '081234567834', 'olivia.p@email.com', 'Jl. Menteng Raya No. 15, Jakarta', 6, 11, 'ACTIVE', '2024-09-01'),
('Joshua', 'Sihombing', 'Male', '1999-02-28', '081234567835', 'joshua.s@email.com', 'Jl. Cikini Raya No. 40, Jakarta', 6, 11, 'ACTIVE', '2022-12-20')

ON CONFLICT (email) DO UPDATE SET
    birth_date = EXCLUDED.birth_date,
    status = EXCLUDED.status;

-- Tambah data kehadiran untuk member baru bulan Januari 2026
INSERT INTO attendance (member_id, attend_date, event, present, note)
SELECT m.id, '2026-01-05', 'Ibadah Minggu', true, NULL
FROM member m WHERE m.email IN ('grace.simbolon@email.com', 'sarah.m@email.com', 'david.h@email.com', 'rachel.p@email.com');

INSERT INTO attendance (member_id, attend_date, event, present, note)
SELECT m.id, '2026-01-12', 'Ibadah Minggu', true, NULL
FROM member m WHERE m.email IN ('grace.simbolon@email.com', 'natalie.s@email.com', 'peter.a@email.com', 'stephanie.h@email.com', 'timothy.n@email.com');

INSERT INTO attendance (member_id, attend_date, event, present, note)
SELECT m.id, '2026-01-19', 'Ibadah Minggu', true, NULL
FROM member m WHERE m.email IN ('sarah.m@email.com', 'david.h@email.com', 'monica.s@email.com', 'andrew.s@email.com', 'olivia.p@email.com', 'joshua.s@email.com');

INSERT INTO attendance (member_id, attend_date, event, present, note)
SELECT m.id, '2026-01-26', 'Ibadah Minggu', true, NULL
FROM member m WHERE m.email IN ('grace.simbolon@email.com', 'rachel.p@email.com', 'jonathan.s@email.com', 'natalie.s@email.com', 'stephanie.h@email.com');

-- Persekutuan Doa
INSERT INTO attendance (member_id, attend_date, event, present, note)
SELECT m.id, '2026-01-08', 'Persekutuan Doa', true, NULL
FROM member m WHERE m.email IN ('budi.santoso@email.com', 'siti.rahayu@email.com', 'peter.a@email.com', 'monica.s@email.com');

INSERT INTO attendance (member_id, attend_date, event, present, note)
SELECT m.id, '2026-01-22', 'Persekutuan Doa', true, NULL
FROM member m WHERE m.email IN ('grace.simbolon@email.com', 'sarah.m@email.com', 'natalie.s@email.com', 'stephanie.h@email.com', 'timothy.n@email.com');
