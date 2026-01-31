-- V4__create_bible_reading_table.sql
-- Tabel untuk tracking membaca Alkitab Mamre setiap hari

CREATE TABLE IF NOT EXISTS bible_reading (
    id BIGSERIAL PRIMARY KEY,
    member_id UUID NOT NULL,
    reading_date DATE NOT NULL,
    book_name VARCHAR(100),          -- Nama kitab (e.g., "Kejadian", "Mazmur")
    chapter INTEGER,                  -- Pasal
    verse_start INTEGER,              -- Ayat awal
    verse_end INTEGER,                -- Ayat akhir
    completed BOOLEAN DEFAULT FALSE,  -- Apakah sudah selesai dibaca
    notes TEXT,                       -- Catatan/renungan
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT fk_bible_reading_member FOREIGN KEY (member_id) REFERENCES member(id) ON DELETE CASCADE
);

-- Index untuk query yang sering digunakan
CREATE INDEX IF NOT EXISTS idx_bible_reading_date ON bible_reading(reading_date);
CREATE INDEX IF NOT EXISTS idx_bible_reading_member_date ON bible_reading(member_id, reading_date);
CREATE INDEX IF NOT EXISTS idx_bible_reading_completed ON bible_reading(completed);

-- Insert sample data untuk testing - Data Membaca Alkitab Mamre 2025-2026
DO $$
DECLARE
    member_rec RECORD;
    reading_date DATE;
    books TEXT[] := ARRAY['Kejadian', 'Keluaran', 'Imamat', 'Bilangan', 'Ulangan', 'Yosua', 'Hakim-hakim', 'Rut', 'Mazmur', 'Amsal'];
BEGIN
    -- Loop untuk setiap member aktif (ambil 10 member pertama)
    FOR member_rec IN SELECT id FROM member WHERE status = 'ACTIVE' LIMIT 10 LOOP

        -- Februari 2025 (28 hari) - ~50% completion
        FOR day_num IN 1..28 LOOP
            IF day_num <= 14 THEN
                reading_date := DATE '2025-02-01' + (day_num - 1);
                INSERT INTO bible_reading (member_id, reading_date, book_name, chapter, completed)
                VALUES (member_rec.id, reading_date, books[((day_num - 1) % 10) + 1], day_num, true);
            END IF;
        END LOOP;

        -- Maret 2025 (31 hari) - ~55%
        FOR day_num IN 1..31 LOOP
            IF day_num <= 17 THEN
                reading_date := DATE '2025-03-01' + (day_num - 1);
                INSERT INTO bible_reading (member_id, reading_date, book_name, chapter, completed)
                VALUES (member_rec.id, reading_date, books[((day_num - 1) % 10) + 1], day_num, true);
            END IF;
        END LOOP;

        -- April 2025 (30 hari) - ~60%
        FOR day_num IN 1..30 LOOP
            IF day_num <= 18 THEN
                reading_date := DATE '2025-04-01' + (day_num - 1);
                INSERT INTO bible_reading (member_id, reading_date, book_name, chapter, completed)
                VALUES (member_rec.id, reading_date, books[((day_num - 1) % 10) + 1], day_num, true);
            END IF;
        END LOOP;

        -- Mei 2025 (31 hari) - ~65%
        FOR day_num IN 1..31 LOOP
            IF day_num <= 20 THEN
                reading_date := DATE '2025-05-01' + (day_num - 1);
                INSERT INTO bible_reading (member_id, reading_date, book_name, chapter, completed)
                VALUES (member_rec.id, reading_date, books[((day_num - 1) % 10) + 1], day_num, true);
            END IF;
        END LOOP;

        -- Juni 2025 (30 hari) - ~70%
        FOR day_num IN 1..30 LOOP
            IF day_num <= 21 THEN
                reading_date := DATE '2025-06-01' + (day_num - 1);
                INSERT INTO bible_reading (member_id, reading_date, book_name, chapter, completed)
                VALUES (member_rec.id, reading_date, books[((day_num - 1) % 10) + 1], day_num, true);
            END IF;
        END LOOP;

        -- Juli 2025 (31 hari) - ~75%
        FOR day_num IN 1..31 LOOP
            IF day_num <= 23 THEN
                reading_date := DATE '2025-07-01' + (day_num - 1);
                INSERT INTO bible_reading (member_id, reading_date, book_name, chapter, completed)
                VALUES (member_rec.id, reading_date, books[((day_num - 1) % 10) + 1], day_num, true);
            END IF;
        END LOOP;

        -- Agustus 2025 (31 hari) - ~77%
        FOR day_num IN 1..31 LOOP
            IF day_num <= 24 THEN
                reading_date := DATE '2025-08-01' + (day_num - 1);
                INSERT INTO bible_reading (member_id, reading_date, book_name, chapter, completed)
                VALUES (member_rec.id, reading_date, books[((day_num - 1) % 10) + 1], day_num, true);
            END IF;
        END LOOP;

        -- September 2025 (30 hari) - ~80%
        FOR day_num IN 1..30 LOOP
            IF day_num <= 24 THEN
                reading_date := DATE '2025-09-01' + (day_num - 1);
                INSERT INTO bible_reading (member_id, reading_date, book_name, chapter, completed)
                VALUES (member_rec.id, reading_date, books[((day_num - 1) % 10) + 1], day_num, true);
            END IF;
        END LOOP;

        -- Oktober 2025 (31 hari) - ~82%
        FOR day_num IN 1..31 LOOP
            IF day_num <= 25 THEN
                reading_date := DATE '2025-10-01' + (day_num - 1);
                INSERT INTO bible_reading (member_id, reading_date, book_name, chapter, completed)
                VALUES (member_rec.id, reading_date, books[((day_num - 1) % 10) + 1], day_num, true);
            END IF;
        END LOOP;

        -- November 2025 (30 hari) - ~85%
        FOR day_num IN 1..30 LOOP
            IF day_num <= 25 THEN
                reading_date := DATE '2025-11-01' + (day_num - 1);
                INSERT INTO bible_reading (member_id, reading_date, book_name, chapter, completed)
                VALUES (member_rec.id, reading_date, books[((day_num - 1) % 10) + 1], day_num, true);
            END IF;
        END LOOP;

        -- Desember 2025 (31 hari) - ~87%
        FOR day_num IN 1..31 LOOP
            IF day_num <= 27 THEN
                reading_date := DATE '2025-12-01' + (day_num - 1);
                INSERT INTO bible_reading (member_id, reading_date, book_name, chapter, completed)
                VALUES (member_rec.id, reading_date, books[((day_num - 1) % 10) + 1], day_num, true);
            END IF;
        END LOOP;

        -- Januari 2026 (31 hari) - ~90%
        FOR day_num IN 1..31 LOOP
            IF day_num <= 28 THEN
                reading_date := DATE '2026-01-01' + (day_num - 1);
                INSERT INTO bible_reading (member_id, reading_date, book_name, chapter, completed)
                VALUES (member_rec.id, reading_date, books[((day_num - 1) % 10) + 1], day_num, true);
            END IF;
        END LOOP;

    END LOOP;
END $$;
