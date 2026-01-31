-- insert_bible_reading_dummy_data.sql
-- Jalankan script ini di database PostgreSQL untuk menambahkan data dummy
-- Pastikan tabel bible_reading sudah dibuat terlebih dahulu

-- =====================================================
-- INSERT DATA DUMMY UNTUK BIBLE_READING
-- =====================================================

DO $$
DECLARE
    m1 UUID;
    m2 UUID;
    m3 UUID;
    m4 UUID;
    m5 UUID;
BEGIN
    -- Ambil 5 member ID yang ada
    SELECT id INTO m1 FROM member WHERE status = 'ACTIVE' LIMIT 1 OFFSET 0;
    SELECT id INTO m2 FROM member WHERE status = 'ACTIVE' LIMIT 1 OFFSET 1;
    SELECT id INTO m3 FROM member WHERE status = 'ACTIVE' LIMIT 1 OFFSET 2;
    SELECT id INTO m4 FROM member WHERE status = 'ACTIVE' LIMIT 1 OFFSET 3;
    SELECT id INTO m5 FROM member WHERE status = 'ACTIVE' LIMIT 1 OFFSET 4;

    -- Member 1: Konsisten membaca setiap hari
    IF m1 IS NOT NULL THEN
        -- Januari 2026 (bulan ini)
        INSERT INTO bible_reading (member_id, reading_date, book_name, chapter, verse_start, verse_end, completed, notes) VALUES
        (m1, '2026-01-01', 'Kejadian', 1, 1, 31, true, 'Penciptaan langit dan bumi'),
        (m1, '2026-01-02', 'Kejadian', 2, 1, 25, true, 'Taman Eden'),
        (m1, '2026-01-03', 'Kejadian', 3, 1, 24, true, 'Kejatuhan manusia'),
        (m1, '2026-01-04', 'Kejadian', 4, 1, 26, true, 'Kain dan Habel'),
        (m1, '2026-01-05', 'Kejadian', 5, 1, 32, true, 'Keturunan Adam'),
        (m1, '2026-01-06', 'Kejadian', 6, 1, 22, true, 'Rencana Allah untuk Nuh'),
        (m1, '2026-01-07', 'Kejadian', 7, 1, 24, true, 'Air bah'),
        (m1, '2026-01-08', 'Kejadian', 8, 1, 22, true, 'Air surut'),
        (m1, '2026-01-09', 'Kejadian', 9, 1, 29, true, 'Perjanjian dengan Nuh'),
        (m1, '2026-01-10', 'Kejadian', 10, 1, 32, true, 'Keturunan Nuh'),
        (m1, '2026-01-11', 'Kejadian', 11, 1, 32, true, 'Menara Babel'),
        (m1, '2026-01-12', 'Kejadian', 12, 1, 20, true, 'Panggilan Abram'),
        (m1, '2026-01-13', 'Kejadian', 13, 1, 18, true, 'Abram dan Lot berpisah'),
        (m1, '2026-01-14', 'Kejadian', 14, 1, 24, true, 'Melkisedek'),
        (m1, '2026-01-15', 'Kejadian', 15, 1, 21, true, 'Perjanjian dengan Abram'),
        (m1, '2026-01-16', 'Kejadian', 16, 1, 16, true, 'Hagar dan Ismael'),
        (m1, '2026-01-17', 'Kejadian', 17, 1, 27, true, 'Sunat sebagai tanda perjanjian'),
        (m1, '2026-01-18', 'Kejadian', 18, 1, 33, true, 'Tiga tamu Abraham'),
        (m1, '2026-01-19', 'Kejadian', 19, 1, 38, true, 'Sodom dan Gomora'),
        (m1, '2026-01-20', 'Kejadian', 20, 1, 18, true, 'Abraham dan Abimelekh'),
        (m1, '2026-01-21', 'Kejadian', 21, 1, 34, true, 'Kelahiran Ishak'),
        (m1, '2026-01-22', 'Kejadian', 22, 1, 24, true, 'Pengorbanan Ishak'),
        (m1, '2026-01-23', 'Kejadian', 23, 1, 20, true, 'Kematian Sara'),
        (m1, '2026-01-24', 'Kejadian', 24, 1, 67, true, 'Ribka istri Ishak'),
        (m1, '2026-01-25', 'Kejadian', 25, 1, 34, true, 'Esau dan Yakub'),
        (m1, '2026-01-26', 'Kejadian', 26, 1, 35, true, 'Ishak di Gerar'),
        (m1, '2026-01-27', 'Kejadian', 27, 1, 46, true, 'Yakub mencuri berkat'),
        (m1, '2026-01-28', 'Kejadian', 28, 1, 22, true, 'Mimpi Yakub'),
        (m1, '2026-01-29', 'Kejadian', 29, 1, 35, true, 'Yakub di Padan-Aram'),
        (m1, '2026-01-30', 'Kejadian', 30, 1, 43, true, 'Anak-anak Yakub'),
        (m1, '2026-01-31', 'Kejadian', 31, 1, 55, true, 'Yakub melarikan diri');

        -- Desember 2025
        INSERT INTO bible_reading (member_id, reading_date, book_name, chapter, completed) VALUES
        (m1, '2025-12-01', 'Mazmur', 1, true),
        (m1, '2025-12-02', 'Mazmur', 23, true),
        (m1, '2025-12-03', 'Mazmur', 27, true),
        (m1, '2025-12-04', 'Mazmur', 34, true),
        (m1, '2025-12-05', 'Mazmur', 46, true),
        (m1, '2025-12-06', 'Mazmur', 51, true),
        (m1, '2025-12-07', 'Mazmur', 91, true),
        (m1, '2025-12-08', 'Mazmur', 100, true),
        (m1, '2025-12-09', 'Mazmur', 103, true),
        (m1, '2025-12-10', 'Mazmur', 119, true),
        (m1, '2025-12-11', 'Mazmur', 121, true),
        (m1, '2025-12-12', 'Mazmur', 139, true),
        (m1, '2025-12-15', 'Amsal', 1, true),
        (m1, '2025-12-16', 'Amsal', 3, true),
        (m1, '2025-12-17', 'Amsal', 4, true),
        (m1, '2025-12-18', 'Amsal', 6, true),
        (m1, '2025-12-19', 'Amsal', 10, true),
        (m1, '2025-12-20', 'Amsal', 15, true),
        (m1, '2025-12-21', 'Amsal', 22, true),
        (m1, '2025-12-22', 'Amsal', 25, true),
        (m1, '2025-12-25', 'Yohanes', 1, true),
        (m1, '2025-12-26', 'Yohanes', 3, true),
        (m1, '2025-12-27', 'Yohanes', 14, true),
        (m1, '2025-12-28', 'Yohanes', 15, true),
        (m1, '2025-12-29', 'Roma', 8, true),
        (m1, '2025-12-30', 'Roma', 12, true),
        (m1, '2025-12-31', 'Wahyu', 21, true);

        -- November 2025
        INSERT INTO bible_reading (member_id, reading_date, book_name, chapter, completed) VALUES
        (m1, '2025-11-01', 'Matius', 1, true),
        (m1, '2025-11-02', 'Matius', 2, true),
        (m1, '2025-11-03', 'Matius', 3, true),
        (m1, '2025-11-05', 'Matius', 4, true),
        (m1, '2025-11-06', 'Matius', 5, true),
        (m1, '2025-11-07', 'Matius', 6, true),
        (m1, '2025-11-08', 'Matius', 7, true),
        (m1, '2025-11-10', 'Matius', 8, true),
        (m1, '2025-11-11', 'Matius', 9, true),
        (m1, '2025-11-12', 'Matius', 10, true),
        (m1, '2025-11-14', 'Matius', 11, true),
        (m1, '2025-11-15', 'Matius', 12, true),
        (m1, '2025-11-16', 'Matius', 13, true),
        (m1, '2025-11-18', 'Matius', 14, true),
        (m1, '2025-11-19', 'Matius', 15, true),
        (m1, '2025-11-20', 'Matius', 16, true),
        (m1, '2025-11-22', 'Matius', 17, true),
        (m1, '2025-11-23', 'Matius', 18, true),
        (m1, '2025-11-24', 'Matius', 19, true),
        (m1, '2025-11-25', 'Matius', 20, true),
        (m1, '2025-11-26', 'Matius', 21, true),
        (m1, '2025-11-28', 'Matius', 22, true),
        (m1, '2025-11-29', 'Matius', 23, true),
        (m1, '2025-11-30', 'Matius', 24, true);
    END IF;

    -- Member 2: Cukup konsisten
    IF m2 IS NOT NULL THEN
        INSERT INTO bible_reading (member_id, reading_date, book_name, chapter, completed) VALUES
        (m2, '2026-01-01', 'Matius', 1, true),
        (m2, '2026-01-02', 'Matius', 2, true),
        (m2, '2026-01-04', 'Matius', 3, true),
        (m2, '2026-01-05', 'Matius', 4, true),
        (m2, '2026-01-07', 'Matius', 5, true),
        (m2, '2026-01-08', 'Matius', 6, true),
        (m2, '2026-01-10', 'Matius', 7, true),
        (m2, '2026-01-12', 'Matius', 8, true),
        (m2, '2026-01-14', 'Matius', 9, true),
        (m2, '2026-01-16', 'Matius', 10, true),
        (m2, '2026-01-18', 'Matius', 11, true),
        (m2, '2026-01-20', 'Matius', 12, true),
        (m2, '2026-01-22', 'Matius', 13, true),
        (m2, '2026-01-24', 'Matius', 14, true),
        (m2, '2026-01-26', 'Matius', 15, true),
        (m2, '2026-01-28', 'Matius', 16, true),
        (m2, '2026-01-30', 'Matius', 17, true),
        (m2, '2025-12-02', 'Markus', 1, true),
        (m2, '2025-12-05', 'Markus', 2, true),
        (m2, '2025-12-08', 'Markus', 3, true),
        (m2, '2025-12-10', 'Markus', 4, true),
        (m2, '2025-12-12', 'Markus', 5, true),
        (m2, '2025-12-15', 'Markus', 6, true),
        (m2, '2025-12-18', 'Markus', 7, true),
        (m2, '2025-12-20', 'Markus', 8, true),
        (m2, '2025-12-22', 'Markus', 9, true),
        (m2, '2025-12-25', 'Markus', 10, true),
        (m2, '2025-12-28', 'Markus', 11, true),
        (m2, '2025-11-05', 'Lukas', 1, true),
        (m2, '2025-11-10', 'Lukas', 2, true),
        (m2, '2025-11-15', 'Lukas', 3, true),
        (m2, '2025-11-20', 'Lukas', 4, true),
        (m2, '2025-11-25', 'Lukas', 5, true);
    END IF;

    -- Member 3: Sesekali membaca
    IF m3 IS NOT NULL THEN
        INSERT INTO bible_reading (member_id, reading_date, book_name, chapter, completed) VALUES
        (m3, '2026-01-01', 'Lukas', 1, true),
        (m3, '2026-01-05', 'Lukas', 2, true),
        (m3, '2026-01-10', 'Lukas', 3, true),
        (m3, '2026-01-15', 'Lukas', 4, true),
        (m3, '2026-01-20', 'Lukas', 5, true),
        (m3, '2026-01-25', 'Lukas', 6, true),
        (m3, '2026-01-30', 'Lukas', 7, true),
        (m3, '2025-12-01', 'Yohanes', 1, true),
        (m3, '2025-12-10', 'Yohanes', 3, true),
        (m3, '2025-12-15', 'Yohanes', 4, true),
        (m3, '2025-12-20', 'Yohanes', 5, true),
        (m3, '2025-12-25', 'Yohanes', 6, true),
        (m3, '2025-11-01', 'Mazmur', 23, true),
        (m3, '2025-11-15', 'Mazmur', 91, true),
        (m3, '2025-11-30', 'Mazmur', 121, true);
    END IF;

    -- Member 4: Baru mulai konsisten
    IF m4 IS NOT NULL THEN
        INSERT INTO bible_reading (member_id, reading_date, book_name, chapter, completed) VALUES
        (m4, '2026-01-15', 'Roma', 1, true),
        (m4, '2026-01-16', 'Roma', 2, true),
        (m4, '2026-01-17', 'Roma', 3, true),
        (m4, '2026-01-18', 'Roma', 4, true),
        (m4, '2026-01-19', 'Roma', 5, true),
        (m4, '2026-01-20', 'Roma', 6, true),
        (m4, '2026-01-21', 'Roma', 7, true),
        (m4, '2026-01-22', 'Roma', 8, true),
        (m4, '2026-01-23', 'Roma', 9, true),
        (m4, '2026-01-24', 'Roma', 10, true),
        (m4, '2026-01-25', 'Roma', 11, true),
        (m4, '2026-01-26', 'Roma', 12, true),
        (m4, '2026-01-27', 'Roma', 13, true),
        (m4, '2026-01-28', 'Roma', 14, true),
        (m4, '2026-01-29', 'Roma', 15, true),
        (m4, '2026-01-30', 'Roma', 16, true),
        (m4, '2026-01-31', '1 Korintus', 1, true);
    END IF;

    -- Member 5: Pemula
    IF m5 IS NOT NULL THEN
        INSERT INTO bible_reading (member_id, reading_date, book_name, chapter, completed) VALUES
        (m5, '2026-01-25', 'Mazmur', 23, true),
        (m5, '2026-01-27', 'Mazmur', 91, true),
        (m5, '2026-01-29', 'Mazmur', 121, true),
        (m5, '2026-01-31', 'Yohanes', 3, true);
    END IF;

    RAISE NOTICE 'Data dummy bible_reading berhasil ditambahkan!';
END $$;

-- =====================================================
-- VERIFIKASI DATA
-- =====================================================
SELECT 'Total Records:' as info, COUNT(*) as jumlah FROM bible_reading;

SELECT
    TO_CHAR(reading_date, 'Mon YYYY') as bulan,
    COUNT(DISTINCT reading_date) as hari_terbaca,
    COUNT(*) as total_bacaan
FROM bible_reading
WHERE completed = true
GROUP BY TO_CHAR(reading_date, 'Mon YYYY'), DATE_TRUNC('month', reading_date)
ORDER BY DATE_TRUNC('month', reading_date) DESC;
