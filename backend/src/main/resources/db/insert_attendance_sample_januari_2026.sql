-- =====================================================
-- INSERT SAMPLE ATTENDANCE DATA - JANUARI 2026
-- Jalankan script ini di pgAdmin atau DBeaver
-- =====================================================

-- Hapus data attendance lama untuk Januari 2026 (opsional - uncomment jika perlu)
-- DELETE FROM attendance WHERE attend_date >= '2026-01-01' AND attend_date <= '2026-01-31';

-- =====================================================
-- STEP 1: Cek sektor yang ada
-- =====================================================
-- SELECT id, name FROM sector;

-- =====================================================
-- STEP 2: Insert attendance untuk semua member per sektor
-- =====================================================

-- MINGGU 1 (5 Januari 2026) - Insert semua member yang hadir dengan kolekte
INSERT INTO attendance (member_id, attend_date, event, present, kolpi_amount, note, created_at)
SELECT
    m.id,
    '2026-01-05'::date,
    'Ibadah Minggu',
    true,
    (RANDOM() * 100000 + 25000)::numeric(15,2),  -- Kolekte random 25k-125k
    'Ibadah Minggu ke-1 Januari',
    NOW()
FROM member m
WHERE m.sector_id IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM attendance a
    WHERE a.member_id = m.id AND a.attend_date = '2026-01-05'
);

-- MINGGU 2 (12 Januari 2026)
INSERT INTO attendance (member_id, attend_date, event, present, kolpi_amount, note, created_at)
SELECT
    m.id,
    '2026-01-12'::date,
    'Ibadah Minggu',
    true,
    (RANDOM() * 100000 + 25000)::numeric(15,2),
    'Ibadah Minggu ke-2 Januari',
    NOW()
FROM member m
WHERE m.sector_id IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM attendance a
    WHERE a.member_id = m.id AND a.attend_date = '2026-01-12'
);

-- MINGGU 3 (19 Januari 2026)
INSERT INTO attendance (member_id, attend_date, event, present, kolpi_amount, note, created_at)
SELECT
    m.id,
    '2026-01-19'::date,
    'Ibadah Minggu',
    true,
    (RANDOM() * 100000 + 25000)::numeric(15,2),
    'Ibadah Minggu ke-3 Januari',
    NOW()
FROM member m
WHERE m.sector_id IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM attendance a
    WHERE a.member_id = m.id AND a.attend_date = '2026-01-19'
);

-- MINGGU 4 (26 Januari 2026)
INSERT INTO attendance (member_id, attend_date, event, present, kolpi_amount, note, created_at)
SELECT
    m.id,
    '2026-01-26'::date,
    'Ibadah Minggu',
    true,
    (RANDOM() * 100000 + 25000)::numeric(15,2),
    'Ibadah Minggu ke-4 Januari',
    NOW()
FROM member m
WHERE m.sector_id IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM attendance a
    WHERE a.member_id = m.id AND a.attend_date = '2026-01-26'
);

-- =====================================================
-- STEP 3: Verifikasi data yang sudah diinsert
-- =====================================================
SELECT
    s.name AS sector_name,
    COUNT(DISTINCT m.id) AS total_members,
    COUNT(DISTINCT CASE WHEN a.attend_date BETWEEN '2026-01-01' AND '2026-01-07' THEN a.member_id END) AS minggu1_hadir,
    COUNT(DISTINCT CASE WHEN a.attend_date BETWEEN '2026-01-08' AND '2026-01-14' THEN a.member_id END) AS minggu2_hadir,
    COUNT(DISTINCT CASE WHEN a.attend_date BETWEEN '2026-01-15' AND '2026-01-21' THEN a.member_id END) AS minggu3_hadir,
    COUNT(DISTINCT CASE WHEN a.attend_date BETWEEN '2026-01-22' AND '2026-01-31' THEN a.member_id END) AS minggu4_hadir,
    COALESCE(SUM(a.kolpi_amount), 0) AS total_kolekte
FROM sector s
LEFT JOIN member m ON m.sector_id = s.id
LEFT JOIN attendance a ON a.member_id = m.id AND a.attend_date BETWEEN '2026-01-01' AND '2026-01-31'
GROUP BY s.id, s.name
ORDER BY s.name;
