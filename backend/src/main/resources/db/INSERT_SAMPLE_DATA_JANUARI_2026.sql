-- =====================================================
-- INSERT SAMPLE DATA - JANUARI 2026
-- Jalankan script ini di pgAdmin atau DBeaver
-- =====================================================

-- STEP 1: Cek sektor yang ada dan jumlah member
SELECT s.id, s.name, COUNT(m.id) as member_count
FROM sector s
LEFT JOIN member m ON m.sector_id = s.id
GROUP BY s.id, s.name
ORDER BY s.name;

-- =====================================================
-- STEP 2: Tambah 5 member ke setiap sektor yang KOSONG
-- =====================================================

-- Untuk sektor BOGOR (jika ada dan kosong)
INSERT INTO member (id, first_name, last_name, email, phone, gender, status, sector_id, created_at)
SELECT
    gen_random_uuid(),
    'Anggota Bogor ' || n,
    'Sample',
    'bogor' || n || '@mamre.org',
    '0811111' || (1000+n)::text,
    CASE WHEN n % 2 = 0 THEN 'MALE' ELSE 'FEMALE' END,
    'ACTIVE',
    s.id,
    NOW()
FROM sector s, generate_series(1, 5) AS n
WHERE LOWER(s.name) = 'bogor'
AND NOT EXISTS (SELECT 1 FROM member m WHERE m.sector_id = s.id);

-- Untuk sektor CIJANTUNG (jika ada dan kosong)
INSERT INTO member (id, first_name, last_name, email, phone, gender, status, sector_id, created_at)
SELECT
    gen_random_uuid(),
    'Anggota Cijantung ' || n,
    'Sample',
    'cijantung' || n || '@mamre.org',
    '0812222' || (1000+n)::text,
    CASE WHEN n % 2 = 0 THEN 'MALE' ELSE 'FEMALE' END,
    'ACTIVE',
    s.id,
    NOW()
FROM sector s, generate_series(1, 5) AS n
WHERE LOWER(s.name) = 'cijantung'
AND NOT EXISTS (SELECT 1 FROM member m WHERE m.sector_id = s.id);

-- =====================================================
-- STEP 3: Insert attendance untuk SEMUA member yang punya sektor
-- =====================================================

-- Minggu 1 (5 Januari 2026)
INSERT INTO attendance (member_id, attend_date, event, present, kolpi_amount, note, created_at)
SELECT m.id, '2026-01-05', 'Ibadah Minggu', true,
       ROUND((50000 + RANDOM() * 100000)::numeric, 0),
       'Data sample Minggu 1', NOW()
FROM member m WHERE m.sector_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM attendance a WHERE a.member_id = m.id AND a.attend_date = '2026-01-05');

-- Minggu 2 (12 Januari 2026)
INSERT INTO attendance (member_id, attend_date, event, present, kolpi_amount, note, created_at)
SELECT m.id, '2026-01-12', 'Ibadah Minggu', true,
       ROUND((50000 + RANDOM() * 100000)::numeric, 0),
       'Data sample Minggu 2', NOW()
FROM member m WHERE m.sector_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM attendance a WHERE a.member_id = m.id AND a.attend_date = '2026-01-12');

-- Minggu 3 (19 Januari 2026)
INSERT INTO attendance (member_id, attend_date, event, present, kolpi_amount, note, created_at)
SELECT m.id, '2026-01-19', 'Ibadah Minggu', true,
       ROUND((50000 + RANDOM() * 100000)::numeric, 0),
       'Data sample Minggu 3', NOW()
FROM member m WHERE m.sector_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM attendance a WHERE a.member_id = m.id AND a.attend_date = '2026-01-19');

-- Minggu 4 (26 Januari 2026)
INSERT INTO attendance (member_id, attend_date, event, present, kolpi_amount, note, created_at)
SELECT m.id, '2026-01-26', 'Ibadah Minggu', true,
       ROUND((50000 + RANDOM() * 100000)::numeric, 0),
       'Data sample Minggu 4', NOW()
FROM member m WHERE m.sector_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM attendance a WHERE a.member_id = m.id AND a.attend_date = '2026-01-26');

-- =====================================================
-- STEP 4: Verifikasi hasil
-- =====================================================
SELECT
    s.name AS sektor,
    COUNT(DISTINCT m.id) AS total_anggota,
    COUNT(DISTINCT CASE WHEN a.attend_date = '2026-01-05' THEN a.member_id END) AS m1_hadir,
    COUNT(DISTINCT CASE WHEN a.attend_date = '2026-01-12' THEN a.member_id END) AS m2_hadir,
    COUNT(DISTINCT CASE WHEN a.attend_date = '2026-01-19' THEN a.member_id END) AS m3_hadir,
    COUNT(DISTINCT CASE WHEN a.attend_date = '2026-01-26' THEN a.member_id END) AS m4_hadir,
    COALESCE(SUM(a.kolpi_amount), 0)::bigint AS total_kolekte
FROM sector s
LEFT JOIN member m ON m.sector_id = s.id
LEFT JOIN attendance a ON a.member_id = m.id AND a.attend_date BETWEEN '2026-01-01' AND '2026-01-31'
GROUP BY s.id, s.name
ORDER BY s.name;
