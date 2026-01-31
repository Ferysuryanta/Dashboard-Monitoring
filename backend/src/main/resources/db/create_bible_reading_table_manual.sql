-- create_bible_reading_table_manual.sql
-- Jalankan script ini secara MANUAL di database PostgreSQL jika Flyway tidak berjalan
-- Contoh: psql -U username -d database_name -f create_bible_reading_table_manual.sql

-- =====================================================
-- 1. BUAT TABEL BIBLE_READING
-- =====================================================
CREATE TABLE IF NOT EXISTS bible_reading (
    id BIGSERIAL PRIMARY KEY,
    member_id UUID NOT NULL,
    reading_date DATE NOT NULL,
    book_name VARCHAR(100),
    chapter INTEGER,
    verse_start INTEGER,
    verse_end INTEGER,
    completed BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT fk_bible_reading_member FOREIGN KEY (member_id) REFERENCES member(id) ON DELETE CASCADE
);

-- Index
CREATE INDEX IF NOT EXISTS idx_bible_reading_date ON bible_reading(reading_date);
CREATE INDEX IF NOT EXISTS idx_bible_reading_member_date ON bible_reading(member_id, reading_date);
CREATE INDEX IF NOT EXISTS idx_bible_reading_completed ON bible_reading(completed);

-- =====================================================
-- 2. INSERT DATA SAMPLE (Sederhana tanpa loop)
-- =====================================================

-- Ambil beberapa member ID yang ada
DO $$
DECLARE
    m1 UUID;
    m2 UUID;
    m3 UUID;
BEGIN
    -- Ambil 3 member ID pertama
    SELECT id INTO m1 FROM member WHERE status = 'ACTIVE' LIMIT 1 OFFSET 0;
    SELECT id INTO m2 FROM member WHERE status = 'ACTIVE' LIMIT 1 OFFSET 1;
    SELECT id INTO m3 FROM member WHERE status = 'ACTIVE' LIMIT 1 OFFSET 2;

    -- Jika member ditemukan, insert data
    IF m1 IS NOT NULL THEN
        -- Januari 2026
        INSERT INTO bible_reading (member_id, reading_date, book_name, chapter, completed) VALUES
        (m1, '2026-01-01', 'Kejadian', 1, true),
        (m1, '2026-01-02', 'Kejadian', 2, true),
        (m1, '2026-01-03', 'Kejadian', 3, true),
        (m1, '2026-01-05', 'Kejadian', 4, true),
        (m1, '2026-01-06', 'Kejadian', 5, true),
        (m1, '2026-01-08', 'Keluaran', 1, true),
        (m1, '2026-01-10', 'Keluaran', 2, true),
        (m1, '2026-01-12', 'Keluaran', 3, true),
        (m1, '2026-01-15', 'Imamat', 1, true),
        (m1, '2026-01-18', 'Imamat', 2, true),
        (m1, '2026-01-20', 'Bilangan', 1, true),
        (m1, '2026-01-22', 'Bilangan', 2, true),
        (m1, '2026-01-25', 'Ulangan', 1, true),
        (m1, '2026-01-28', 'Ulangan', 2, true),
        (m1, '2026-01-30', 'Yosua', 1, true);

        -- Desember 2025
        INSERT INTO bible_reading (member_id, reading_date, book_name, chapter, completed) VALUES
        (m1, '2025-12-01', 'Mazmur', 1, true),
        (m1, '2025-12-03', 'Mazmur', 23, true),
        (m1, '2025-12-05', 'Mazmur', 91, true),
        (m1, '2025-12-08', 'Amsal', 1, true),
        (m1, '2025-12-10', 'Amsal', 3, true),
        (m1, '2025-12-12', 'Yesaya', 40, true),
        (m1, '2025-12-15', 'Yeremia', 29, true),
        (m1, '2025-12-18', 'Matius', 5, true),
        (m1, '2025-12-20', 'Matius', 6, true),
        (m1, '2025-12-22', 'Yohanes', 1, true),
        (m1, '2025-12-25', 'Yohanes', 3, true),
        (m1, '2025-12-28', 'Roma', 8, true);
    END IF;

    IF m2 IS NOT NULL THEN
        INSERT INTO bible_reading (member_id, reading_date, book_name, chapter, completed) VALUES
        (m2, '2026-01-02', 'Kejadian', 1, true),
        (m2, '2026-01-04', 'Kejadian', 2, true),
        (m2, '2026-01-07', 'Keluaran', 1, true),
        (m2, '2026-01-10', 'Keluaran', 2, true),
        (m2, '2026-01-14', 'Imamat', 1, true),
        (m2, '2026-01-18', 'Bilangan', 1, true),
        (m2, '2026-01-22', 'Ulangan', 1, true),
        (m2, '2026-01-26', 'Yosua', 1, true),
        (m2, '2026-01-30', 'Hakim-hakim', 1, true),
        (m2, '2025-12-05', 'Mazmur', 1, true),
        (m2, '2025-12-10', 'Mazmur', 23, true),
        (m2, '2025-12-15', 'Amsal', 1, true),
        (m2, '2025-12-20', 'Matius', 1, true),
        (m2, '2025-12-25', 'Yohanes', 1, true);
    END IF;

    IF m3 IS NOT NULL THEN
        INSERT INTO bible_reading (member_id, reading_date, book_name, chapter, completed) VALUES
        (m3, '2026-01-01', 'Kejadian', 1, true),
        (m3, '2026-01-05', 'Keluaran', 1, true),
        (m3, '2026-01-10', 'Imamat', 1, true),
        (m3, '2026-01-15', 'Bilangan', 1, true),
        (m3, '2026-01-20', 'Ulangan', 1, true),
        (m3, '2026-01-25', 'Yosua', 1, true),
        (m3, '2026-01-30', 'Rut', 1, true),
        (m3, '2025-12-01', 'Mazmur', 1, true),
        (m3, '2025-12-10', 'Amsal', 1, true),
        (m3, '2025-12-20', 'Matius', 1, true);
    END IF;

    RAISE NOTICE 'Data sample berhasil ditambahkan!';
END $$;

-- =====================================================
-- 3. VERIFIKASI
-- =====================================================
SELECT 'Tabel bible_reading berhasil dibuat!' as status;
SELECT COUNT(*) as total_records FROM bible_reading;
