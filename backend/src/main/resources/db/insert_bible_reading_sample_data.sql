-- insert_bible_reading_sample_data.sql
-- Script untuk menambahkan data dummy Membaca Alkitab Mamre
-- Jalankan script ini secara manual di database PostgreSQL

-- Buat tabel jika belum ada
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
CREATE INDEX IF NOT EXISTS idx_bible_reading_completed ON bible_reading(completed);

-- Hapus data lama untuk testing ulang
DELETE FROM bible_reading;

-- Insert data untuk setiap bulan tahun 2025-2026
-- Menggunakan member yang ada

DO $$
DECLARE
    member_rec RECORD;
    reading_date DATE;
    books TEXT[] := ARRAY['Kejadian', 'Keluaran', 'Imamat', 'Bilangan', 'Ulangan', 'Yosua', 'Hakim-hakim', 'Rut', 'Mazmur', 'Amsal'];
    book_index INTEGER;
    month_start DATE;
    days_in_month INTEGER;
    completion_rate FLOAT;
BEGIN
    -- Loop untuk setiap member aktif (ambil 15 member)
    FOR member_rec IN SELECT id FROM member WHERE status = 'ACTIVE' LIMIT 15 LOOP

        -- Februari 2025
        month_start := DATE '2025-02-01';
        days_in_month := 28;
        completion_rate := 0.45;
        FOR day_num IN 1..days_in_month LOOP
            IF random() < completion_rate THEN
                INSERT INTO bible_reading (member_id, reading_date, book_name, chapter, completed)
                VALUES (member_rec.id, month_start + (day_num - 1), books[((day_num - 1) % 10) + 1], day_num, true);
            END IF;
        END LOOP;

        -- Maret 2025
        month_start := DATE '2025-03-01';
        days_in_month := 31;
        completion_rate := 0.50;
        FOR day_num IN 1..days_in_month LOOP
            IF random() < completion_rate THEN
                INSERT INTO bible_reading (member_id, reading_date, book_name, chapter, completed)
                VALUES (member_rec.id, month_start + (day_num - 1), books[((day_num - 1) % 10) + 1], day_num, true);
            END IF;
        END LOOP;

        -- April 2025
        month_start := DATE '2025-04-01';
        days_in_month := 30;
        completion_rate := 0.55;
        FOR day_num IN 1..days_in_month LOOP
            IF random() < completion_rate THEN
                INSERT INTO bible_reading (member_id, reading_date, book_name, chapter, completed)
                VALUES (member_rec.id, month_start + (day_num - 1), books[((day_num - 1) % 10) + 1], day_num, true);
            END IF;
        END LOOP;

        -- Mei 2025
        month_start := DATE '2025-05-01';
        days_in_month := 31;
        completion_rate := 0.60;
        FOR day_num IN 1..days_in_month LOOP
            IF random() < completion_rate THEN
                INSERT INTO bible_reading (member_id, reading_date, book_name, chapter, completed)
                VALUES (member_rec.id, month_start + (day_num - 1), books[((day_num - 1) % 10) + 1], day_num, true);
            END IF;
        END LOOP;

        -- Juni 2025
        month_start := DATE '2025-06-01';
        days_in_month := 30;
        completion_rate := 0.65;
        FOR day_num IN 1..days_in_month LOOP
            IF random() < completion_rate THEN
                INSERT INTO bible_reading (member_id, reading_date, book_name, chapter, completed)
                VALUES (member_rec.id, month_start + (day_num - 1), books[((day_num - 1) % 10) + 1], day_num, true);
            END IF;
        END LOOP;

        -- Juli 2025
        month_start := DATE '2025-07-01';
        days_in_month := 31;
        completion_rate := 0.70;
        FOR day_num IN 1..days_in_month LOOP
            IF random() < completion_rate THEN
                INSERT INTO bible_reading (member_id, reading_date, book_name, chapter, completed)
                VALUES (member_rec.id, month_start + (day_num - 1), books[((day_num - 1) % 10) + 1], day_num, true);
            END IF;
        END LOOP;

        -- Agustus 2025
        month_start := DATE '2025-08-01';
        days_in_month := 31;
        completion_rate := 0.72;
        FOR day_num IN 1..days_in_month LOOP
            IF random() < completion_rate THEN
                INSERT INTO bible_reading (member_id, reading_date, book_name, chapter, completed)
                VALUES (member_rec.id, month_start + (day_num - 1), books[((day_num - 1) % 10) + 1], day_num, true);
            END IF;
        END LOOP;

        -- September 2025
        month_start := DATE '2025-09-01';
        days_in_month := 30;
        completion_rate := 0.75;
        FOR day_num IN 1..days_in_month LOOP
            IF random() < completion_rate THEN
                INSERT INTO bible_reading (member_id, reading_date, book_name, chapter, completed)
                VALUES (member_rec.id, month_start + (day_num - 1), books[((day_num - 1) % 10) + 1], day_num, true);
            END IF;
        END LOOP;

        -- Oktober 2025
        month_start := DATE '2025-10-01';
        days_in_month := 31;
        completion_rate := 0.78;
        FOR day_num IN 1..days_in_month LOOP
            IF random() < completion_rate THEN
                INSERT INTO bible_reading (member_id, reading_date, book_name, chapter, completed)
                VALUES (member_rec.id, month_start + (day_num - 1), books[((day_num - 1) % 10) + 1], day_num, true);
            END IF;
        END LOOP;

        -- November 2025
        month_start := DATE '2025-11-01';
        days_in_month := 30;
        completion_rate := 0.80;
        FOR day_num IN 1..days_in_month LOOP
            IF random() < completion_rate THEN
                INSERT INTO bible_reading (member_id, reading_date, book_name, chapter, completed)
                VALUES (member_rec.id, month_start + (day_num - 1), books[((day_num - 1) % 10) + 1], day_num, true);
            END IF;
        END LOOP;

        -- Desember 2025
        month_start := DATE '2025-12-01';
        days_in_month := 31;
        completion_rate := 0.82;
        FOR day_num IN 1..days_in_month LOOP
            IF random() < completion_rate THEN
                INSERT INTO bible_reading (member_id, reading_date, book_name, chapter, completed)
                VALUES (member_rec.id, month_start + (day_num - 1), books[((day_num - 1) % 10) + 1], day_num, true);
            END IF;
        END LOOP;

        -- Januari 2026 (bulan ini)
        month_start := DATE '2026-01-01';
        days_in_month := 31;
        completion_rate := 0.85;
        FOR day_num IN 1..31 LOOP
            IF random() < completion_rate THEN
                INSERT INTO bible_reading (member_id, reading_date, book_name, chapter, completed)
                VALUES (member_rec.id, month_start + (day_num - 1), books[((day_num - 1) % 10) + 1], day_num, true);
            END IF;
        END LOOP;

    END LOOP;

    RAISE NOTICE 'Data Bible Reading berhasil ditambahkan!';
END $$;

-- Verifikasi data
SELECT
    TO_CHAR(reading_date, 'Mon-YYYY') as month,
    COUNT(DISTINCT reading_date) as completed_days,
    EXTRACT(DAY FROM (DATE_TRUNC('month', reading_date) + INTERVAL '1 month - 1 day')) as target_days,
    ROUND(COUNT(DISTINCT reading_date)::numeric / EXTRACT(DAY FROM (DATE_TRUNC('month', reading_date) + INTERVAL '1 month - 1 day')) * 100, 1) as percentage
FROM bible_reading
WHERE completed = true
  AND reading_date >= '2025-02-01'
  AND reading_date <= '2026-01-31'
GROUP BY DATE_TRUNC('month', reading_date), TO_CHAR(reading_date, 'Mon-YYYY')
ORDER BY DATE_TRUNC('month', reading_date);
