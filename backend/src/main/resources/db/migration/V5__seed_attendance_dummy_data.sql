-- V5__seed_attendance_dummy_data.sql
-- Data kehadiran yang realistis untuk berbagai kegiatan gereja

DO $$
DECLARE
    m1 UUID;
    m2 UUID;
    m3 UUID;
    m4 UUID;
    m5 UUID;
BEGIN
    -- Ambil 5 member ID yang ada
    SELECT id INTO m1 FROM member WHERE status = 'ACTIVE' ORDER BY created_at LIMIT 1 OFFSET 0;
    SELECT id INTO m2 FROM member WHERE status = 'ACTIVE' ORDER BY created_at LIMIT 1 OFFSET 1;
    SELECT id INTO m3 FROM member WHERE status = 'ACTIVE' ORDER BY created_at LIMIT 1 OFFSET 2;
    SELECT id INTO m4 FROM member WHERE status = 'ACTIVE' ORDER BY created_at LIMIT 1 OFFSET 3;
    SELECT id INTO m5 FROM member WHERE status = 'ACTIVE' ORDER BY created_at LIMIT 1 OFFSET 4;

    -- Hapus data attendance lama jika ada
    DELETE FROM attendance;

    -- =====================================================
    -- JANUARI 2026 - Bulan ini
    -- =====================================================

    -- Ibadah Minggu 5 Januari 2026
    IF m1 IS NOT NULL THEN
        INSERT INTO attendance (member_id, attend_date, event, present, note, created_at) VALUES
        (m1, '2026-01-05', 'Ibadah Minggu', true, 'Hadir tepat waktu', now());
    END IF;
    IF m2 IS NOT NULL THEN
        INSERT INTO attendance (member_id, attend_date, event, present, note, created_at) VALUES
        (m2, '2026-01-05', 'Ibadah Minggu', true, 'Membawa anak-anak', now());
    END IF;
    IF m3 IS NOT NULL THEN
        INSERT INTO attendance (member_id, attend_date, event, present, note, created_at) VALUES
        (m3, '2026-01-05', 'Ibadah Minggu', true, 'Pelayanan paduan suara', now());
    END IF;
    IF m4 IS NOT NULL THEN
        INSERT INTO attendance (member_id, attend_date, event, present, note, created_at) VALUES
        (m4, '2026-01-05', 'Ibadah Minggu', false, 'Sakit flu', now());
    END IF;
    IF m5 IS NOT NULL THEN
        INSERT INTO attendance (member_id, attend_date, event, present, note, created_at) VALUES
        (m5, '2026-01-05', 'Ibadah Minggu', true, NULL, now());
    END IF;

    -- Persekutuan Doa 8 Januari 2026
    IF m1 IS NOT NULL THEN
        INSERT INTO attendance (member_id, attend_date, event, present, note, created_at) VALUES
        (m1, '2026-01-08', 'Persekutuan Doa', true, 'Memimpin doa syafaat', now());
    END IF;
    IF m3 IS NOT NULL THEN
        INSERT INTO attendance (member_id, attend_date, event, present, note, created_at) VALUES
        (m3, '2026-01-08', 'Persekutuan Doa', true, NULL, now());
    END IF;
    IF m5 IS NOT NULL THEN
        INSERT INTO attendance (member_id, attend_date, event, present, note, created_at) VALUES
        (m5, '2026-01-08', 'Persekutuan Doa', true, 'Datang terlambat 15 menit', now());
    END IF;

    -- Ibadah Minggu 12 Januari 2026
    IF m1 IS NOT NULL THEN
        INSERT INTO attendance (member_id, attend_date, event, present, note, created_at) VALUES
        (m1, '2026-01-12', 'Ibadah Minggu', true, 'Pelayanan kolekte', now());
    END IF;
    IF m2 IS NOT NULL THEN
        INSERT INTO attendance (member_id, attend_date, event, present, note, created_at) VALUES
        (m2, '2026-01-12', 'Ibadah Minggu', true, NULL, now());
    END IF;
    IF m3 IS NOT NULL THEN
        INSERT INTO attendance (member_id, attend_date, event, present, note, created_at) VALUES
        (m3, '2026-01-12', 'Ibadah Minggu', true, 'Pelayanan musik', now());
    END IF;
    IF m4 IS NOT NULL THEN
        INSERT INTO attendance (member_id, attend_date, event, present, note, created_at) VALUES
        (m4, '2026-01-12', 'Ibadah Minggu', true, 'Sudah sembuh', now());
    END IF;
    IF m5 IS NOT NULL THEN
        INSERT INTO attendance (member_id, attend_date, event, present, note, created_at) VALUES
        (m5, '2026-01-12', 'Ibadah Minggu', true, NULL, now());
    END IF;

    -- Ibadah Pemuda 17 Januari 2026
    IF m2 IS NOT NULL THEN
        INSERT INTO attendance (member_id, attend_date, event, present, note, created_at) VALUES
        (m2, '2026-01-17', 'Ibadah Pemuda', true, 'Pemimpin ibadah', now());
    END IF;
    IF m4 IS NOT NULL THEN
        INSERT INTO attendance (member_id, attend_date, event, present, note, created_at) VALUES
        (m4, '2026-01-17', 'Ibadah Pemuda', true, 'Pembicara renungan', now());
    END IF;
    IF m5 IS NOT NULL THEN
        INSERT INTO attendance (member_id, attend_date, event, present, note, created_at) VALUES
        (m5, '2026-01-17', 'Ibadah Pemuda', true, NULL, now());
    END IF;

    -- Ibadah Minggu 19 Januari 2026
    IF m1 IS NOT NULL THEN
        INSERT INTO attendance (member_id, attend_date, event, present, note, created_at) VALUES
        (m1, '2026-01-19', 'Ibadah Minggu', true, NULL, now());
    END IF;
    IF m2 IS NOT NULL THEN
        INSERT INTO attendance (member_id, attend_date, event, present, note, created_at) VALUES
        (m2, '2026-01-19', 'Ibadah Minggu', true, 'Pelayanan penyambutan', now());
    END IF;
    IF m3 IS NOT NULL THEN
        INSERT INTO attendance (member_id, attend_date, event, present, note, created_at) VALUES
        (m3, '2026-01-19', 'Ibadah Minggu', false, 'Ke luar kota', now());
    END IF;
    IF m4 IS NOT NULL THEN
        INSERT INTO attendance (member_id, attend_date, event, present, note, created_at) VALUES
        (m4, '2026-01-19', 'Ibadah Minggu', true, NULL, now());
    END IF;
    IF m5 IS NOT NULL THEN
        INSERT INTO attendance (member_id, attend_date, event, present, note, created_at) VALUES
        (m5, '2026-01-19', 'Ibadah Minggu', true, 'Membawa teman baru', now());
    END IF;

    -- Rapat Jemaat 22 Januari 2026
    IF m1 IS NOT NULL THEN
        INSERT INTO attendance (member_id, attend_date, event, present, note, created_at) VALUES
        (m1, '2026-01-22', 'Rapat Jemaat', true, 'Sekretaris rapat', now());
    END IF;
    IF m2 IS NOT NULL THEN
        INSERT INTO attendance (member_id, attend_date, event, present, note, created_at) VALUES
        (m2, '2026-01-22', 'Rapat Jemaat', true, NULL, now());
    END IF;
    IF m3 IS NOT NULL THEN
        INSERT INTO attendance (member_id, attend_date, event, present, note, created_at) VALUES
        (m3, '2026-01-22', 'Rapat Jemaat', true, 'Pembahasan anggaran', now());
    END IF;

    -- Ibadah Minggu 26 Januari 2026
    IF m1 IS NOT NULL THEN
        INSERT INTO attendance (member_id, attend_date, event, present, note, created_at) VALUES
        (m1, '2026-01-26', 'Ibadah Minggu', true, 'Pelayanan bacaan firman', now());
    END IF;
    IF m2 IS NOT NULL THEN
        INSERT INTO attendance (member_id, attend_date, event, present, note, created_at) VALUES
        (m2, '2026-01-26', 'Ibadah Minggu', true, NULL, now());
    END IF;
    IF m3 IS NOT NULL THEN
        INSERT INTO attendance (member_id, attend_date, event, present, note, created_at) VALUES
        (m3, '2026-01-26', 'Ibadah Minggu', true, NULL, now());
    END IF;
    IF m4 IS NOT NULL THEN
        INSERT INTO attendance (member_id, attend_date, event, present, note, created_at) VALUES
        (m4, '2026-01-26', 'Ibadah Minggu', true, 'Kembali dari perjalanan', now());
    END IF;
    IF m5 IS NOT NULL THEN
        INSERT INTO attendance (member_id, attend_date, event, present, note, created_at) VALUES
        (m5, '2026-01-26', 'Ibadah Minggu', false, 'Menghadiri acara keluarga', now());
    END IF;

    -- Persekutuan Doa 29 Januari 2026
    IF m1 IS NOT NULL THEN
        INSERT INTO attendance (member_id, attend_date, event, present, note, created_at) VALUES
        (m1, '2026-01-29', 'Persekutuan Doa', true, NULL, now());
    END IF;
    IF m2 IS NOT NULL THEN
        INSERT INTO attendance (member_id, attend_date, event, present, note, created_at) VALUES
        (m2, '2026-01-29', 'Persekutuan Doa', true, 'Memimpin pujian', now());
    END IF;
    IF m4 IS NOT NULL THEN
        INSERT INTO attendance (member_id, attend_date, event, present, note, created_at) VALUES
        (m4, '2026-01-29', 'Persekutuan Doa', true, NULL, now());
    END IF;

    -- =====================================================
    -- DESEMBER 2025 - Bulan lalu
    -- =====================================================

    -- Ibadah Minggu 7 Desember 2025
    IF m1 IS NOT NULL THEN
        INSERT INTO attendance (member_id, attend_date, event, present, note, created_at) VALUES
        (m1, '2025-12-07', 'Ibadah Minggu', true, NULL, now());
    END IF;
    IF m2 IS NOT NULL THEN
        INSERT INTO attendance (member_id, attend_date, event, present, note, created_at) VALUES
        (m2, '2025-12-07', 'Ibadah Minggu', true, 'Persiapan Natal', now());
    END IF;
    IF m3 IS NOT NULL THEN
        INSERT INTO attendance (member_id, attend_date, event, present, note, created_at) VALUES
        (m3, '2025-12-07', 'Ibadah Minggu', true, NULL, now());
    END IF;
    IF m4 IS NOT NULL THEN
        INSERT INTO attendance (member_id, attend_date, event, present, note, created_at) VALUES
        (m4, '2025-12-07', 'Ibadah Minggu', true, NULL, now());
    END IF;
    IF m5 IS NOT NULL THEN
        INSERT INTO attendance (member_id, attend_date, event, present, note, created_at) VALUES
        (m5, '2025-12-07', 'Ibadah Minggu', true, 'Latihan paduan suara Natal', now());
    END IF;

    -- Ibadah Minggu 14 Desember 2025
    IF m1 IS NOT NULL THEN
        INSERT INTO attendance (member_id, attend_date, event, present, note, created_at) VALUES
        (m1, '2025-12-14', 'Ibadah Minggu', true, 'Pelayanan dekorasi', now());
    END IF;
    IF m2 IS NOT NULL THEN
        INSERT INTO attendance (member_id, attend_date, event, present, note, created_at) VALUES
        (m2, '2025-12-14', 'Ibadah Minggu', true, NULL, now());
    END IF;
    IF m3 IS NOT NULL THEN
        INSERT INTO attendance (member_id, attend_date, event, present, note, created_at) VALUES
        (m3, '2025-12-14', 'Ibadah Minggu', true, 'Latihan drama Natal', now());
    END IF;
    IF m4 IS NOT NULL THEN
        INSERT INTO attendance (member_id, attend_date, event, present, note, created_at) VALUES
        (m4, '2025-12-14', 'Ibadah Minggu', false, 'Perjalanan dinas', now());
    END IF;
    IF m5 IS NOT NULL THEN
        INSERT INTO attendance (member_id, attend_date, event, present, note, created_at) VALUES
        (m5, '2025-12-14', 'Ibadah Minggu', true, NULL, now());
    END IF;

    -- Ibadah Minggu 21 Desember 2025
    IF m1 IS NOT NULL THEN
        INSERT INTO attendance (member_id, attend_date, event, present, note, created_at) VALUES
        (m1, '2025-12-21', 'Ibadah Minggu', true, NULL, now());
    END IF;
    IF m2 IS NOT NULL THEN
        INSERT INTO attendance (member_id, attend_date, event, present, note, created_at) VALUES
        (m2, '2025-12-21', 'Ibadah Minggu', true, 'Gladi bersih Natal', now());
    END IF;
    IF m3 IS NOT NULL THEN
        INSERT INTO attendance (member_id, attend_date, event, present, note, created_at) VALUES
        (m3, '2025-12-21', 'Ibadah Minggu', true, 'Penampilan drama', now());
    END IF;
    IF m4 IS NOT NULL THEN
        INSERT INTO attendance (member_id, attend_date, event, present, note, created_at) VALUES
        (m4, '2025-12-21', 'Ibadah Minggu', true, 'Kembali dari dinas', now());
    END IF;
    IF m5 IS NOT NULL THEN
        INSERT INTO attendance (member_id, attend_date, event, present, note, created_at) VALUES
        (m5, '2025-12-21', 'Ibadah Minggu', true, 'Pelayanan sound system', now());
    END IF;

    -- Ibadah Natal 25 Desember 2025
    IF m1 IS NOT NULL THEN
        INSERT INTO attendance (member_id, attend_date, event, present, note, created_at) VALUES
        (m1, '2025-12-25', 'Natal', true, 'Hadir sekeluarga', now());
    END IF;
    IF m2 IS NOT NULL THEN
        INSERT INTO attendance (member_id, attend_date, event, present, note, created_at) VALUES
        (m2, '2025-12-25', 'Natal', true, 'Pelayanan musik Natal', now());
    END IF;
    IF m3 IS NOT NULL THEN
        INSERT INTO attendance (member_id, attend_date, event, present, note, created_at) VALUES
        (m3, '2025-12-25', 'Natal', true, 'Penampilan paduan suara', now());
    END IF;
    IF m4 IS NOT NULL THEN
        INSERT INTO attendance (member_id, attend_date, event, present, note, created_at) VALUES
        (m4, '2025-12-25', 'Natal', true, 'Membawa keluarga besar', now());
    END IF;
    IF m5 IS NOT NULL THEN
        INSERT INTO attendance (member_id, attend_date, event, present, note, created_at) VALUES
        (m5, '2025-12-25', 'Natal', true, NULL, now());
    END IF;

    -- Ibadah Minggu 28 Desember 2025
    IF m1 IS NOT NULL THEN
        INSERT INTO attendance (member_id, attend_date, event, present, note, created_at) VALUES
        (m1, '2025-12-28', 'Ibadah Minggu', true, 'Ibadah akhir tahun', now());
    END IF;
    IF m2 IS NOT NULL THEN
        INSERT INTO attendance (member_id, attend_date, event, present, note, created_at) VALUES
        (m2, '2025-12-28', 'Ibadah Minggu', false, 'Liburan keluarga', now());
    END IF;
    IF m3 IS NOT NULL THEN
        INSERT INTO attendance (member_id, attend_date, event, present, note, created_at) VALUES
        (m3, '2025-12-28', 'Ibadah Minggu', true, NULL, now());
    END IF;
    IF m4 IS NOT NULL THEN
        INSERT INTO attendance (member_id, attend_date, event, present, note, created_at) VALUES
        (m4, '2025-12-28', 'Ibadah Minggu', true, 'Renungan akhir tahun', now());
    END IF;
    IF m5 IS NOT NULL THEN
        INSERT INTO attendance (member_id, attend_date, event, present, note, created_at) VALUES
        (m5, '2025-12-28', 'Ibadah Minggu', false, 'Mudik ke kampung', now());
    END IF;

    -- Ibadah Tahun Baru 31 Desember 2025
    IF m1 IS NOT NULL THEN
        INSERT INTO attendance (member_id, attend_date, event, present, note, created_at) VALUES
        (m1, '2025-12-31', 'Tahun Baru', true, 'Ibadah syukur tutup tahun', now());
    END IF;
    IF m3 IS NOT NULL THEN
        INSERT INTO attendance (member_id, attend_date, event, present, note, created_at) VALUES
        (m3, '2025-12-31', 'Tahun Baru', true, 'Pelayanan doa malam', now());
    END IF;
    IF m4 IS NOT NULL THEN
        INSERT INTO attendance (member_id, attend_date, event, present, note, created_at) VALUES
        (m4, '2025-12-31', 'Tahun Baru', true, NULL, now());
    END IF;

    -- =====================================================
    -- NOVEMBER 2025 - 2 bulan lalu
    -- =====================================================

    IF m1 IS NOT NULL THEN
        INSERT INTO attendance (member_id, attend_date, event, present, note, created_at) VALUES
        (m1, '2025-11-02', 'Ibadah Minggu', true, NULL, now()),
        (m1, '2025-11-09', 'Ibadah Minggu', true, NULL, now()),
        (m1, '2025-11-16', 'Ibadah Minggu', true, 'Pelayanan perjamuan', now()),
        (m1, '2025-11-23', 'Ibadah Minggu', true, NULL, now()),
        (m1, '2025-11-30', 'Ibadah Minggu', false, 'Dinas ke luar kota', now()),
        (m1, '2025-11-08', 'Kegiatan Sektor', true, 'Kunjungan jemaat sakit', now()),
        (m1, '2025-11-15', 'Pelayanan Sosial', true, 'Bakti sosial panti asuhan', now());
    END IF;

    IF m2 IS NOT NULL THEN
        INSERT INTO attendance (member_id, attend_date, event, present, note, created_at) VALUES
        (m2, '2025-11-02', 'Ibadah Minggu', true, NULL, now()),
        (m2, '2025-11-09', 'Ibadah Minggu', true, 'Pengiring pujian', now()),
        (m2, '2025-11-16', 'Ibadah Minggu', true, NULL, now()),
        (m2, '2025-11-23', 'Ibadah Minggu', false, 'Sakit', now()),
        (m2, '2025-11-30', 'Ibadah Minggu', true, NULL, now()),
        (m2, '2025-11-08', 'Kegiatan Sektor', true, NULL, now());
    END IF;

    IF m3 IS NOT NULL THEN
        INSERT INTO attendance (member_id, attend_date, event, present, note, created_at) VALUES
        (m3, '2025-11-02', 'Ibadah Minggu', true, 'Pelayanan anak sekolah minggu', now()),
        (m3, '2025-11-09', 'Ibadah Minggu', true, NULL, now()),
        (m3, '2025-11-16', 'Ibadah Minggu', true, NULL, now()),
        (m3, '2025-11-23', 'Ibadah Minggu', true, 'Pengajar sekolah minggu', now()),
        (m3, '2025-11-30', 'Ibadah Minggu', true, NULL, now()),
        (m3, '2025-11-15', 'Pelayanan Sosial', true, 'Pengajar kegiatan anak', now());
    END IF;

    IF m4 IS NOT NULL THEN
        INSERT INTO attendance (member_id, attend_date, event, present, note, created_at) VALUES
        (m4, '2025-11-02', 'Ibadah Minggu', false, 'Acara keluarga', now()),
        (m4, '2025-11-09', 'Ibadah Minggu', true, NULL, now()),
        (m4, '2025-11-16', 'Ibadah Minggu', true, 'Penatua bertugas', now()),
        (m4, '2025-11-23', 'Ibadah Minggu', true, NULL, now()),
        (m4, '2025-11-30', 'Ibadah Minggu', true, NULL, now()),
        (m4, '2025-11-08', 'Kegiatan Sektor', true, 'Koordinator kunjungan', now());
    END IF;

    IF m5 IS NOT NULL THEN
        INSERT INTO attendance (member_id, attend_date, event, present, note, created_at) VALUES
        (m5, '2025-11-02', 'Ibadah Minggu', true, NULL, now()),
        (m5, '2025-11-09', 'Ibadah Minggu', true, NULL, now()),
        (m5, '2025-11-16', 'Ibadah Minggu', false, 'Keluar kota', now()),
        (m5, '2025-11-23', 'Ibadah Minggu', true, 'Operator multimedia', now()),
        (m5, '2025-11-30', 'Ibadah Minggu', true, NULL, now()),
        (m5, '2025-11-15', 'Pelayanan Sosial', true, 'Dokumentasi kegiatan', now());
    END IF;

    -- =====================================================
    -- OKTOBER 2025 - 3 bulan lalu
    -- =====================================================

    IF m1 IS NOT NULL THEN
        INSERT INTO attendance (member_id, attend_date, event, present, note, created_at) VALUES
        (m1, '2025-10-05', 'Ibadah Minggu', true, NULL, now()),
        (m1, '2025-10-12', 'Ibadah Minggu', true, 'Pelayanan firman', now()),
        (m1, '2025-10-19', 'Ibadah Minggu', true, NULL, now()),
        (m1, '2025-10-26', 'Ibadah Minggu', true, NULL, now());
    END IF;

    IF m2 IS NOT NULL THEN
        INSERT INTO attendance (member_id, attend_date, event, present, note, created_at) VALUES
        (m2, '2025-10-05', 'Ibadah Minggu', true, 'Pelayanan musik', now()),
        (m2, '2025-10-12', 'Ibadah Minggu', false, 'Pernikahan saudara', now()),
        (m2, '2025-10-19', 'Ibadah Minggu', true, NULL, now()),
        (m2, '2025-10-26', 'Ibadah Minggu', true, NULL, now());
    END IF;

    IF m3 IS NOT NULL THEN
        INSERT INTO attendance (member_id, attend_date, event, present, note, created_at) VALUES
        (m3, '2025-10-05', 'Ibadah Minggu', true, NULL, now()),
        (m3, '2025-10-12', 'Ibadah Minggu', true, NULL, now()),
        (m3, '2025-10-19', 'Ibadah Minggu', true, 'Guru sekolah minggu', now()),
        (m3, '2025-10-26', 'Ibadah Minggu', true, NULL, now());
    END IF;

    IF m4 IS NOT NULL THEN
        INSERT INTO attendance (member_id, attend_date, event, present, note, created_at) VALUES
        (m4, '2025-10-05', 'Ibadah Minggu', true, NULL, now()),
        (m4, '2025-10-12', 'Ibadah Minggu', true, 'Penatua bertugas', now()),
        (m4, '2025-10-19', 'Ibadah Minggu', false, 'Tugas kantor', now()),
        (m4, '2025-10-26', 'Ibadah Minggu', true, NULL, now());
    END IF;

    IF m5 IS NOT NULL THEN
        INSERT INTO attendance (member_id, attend_date, event, present, note, created_at) VALUES
        (m5, '2025-10-05', 'Ibadah Minggu', true, NULL, now()),
        (m5, '2025-10-12', 'Ibadah Minggu', true, NULL, now()),
        (m5, '2025-10-19', 'Ibadah Minggu', true, 'Multimedia', now()),
        (m5, '2025-10-26', 'Ibadah Minggu', false, 'Wisuda keluarga', now());
    END IF;

    -- Retreat Oktober 2025
    IF m1 IS NOT NULL THEN
        INSERT INTO attendance (member_id, attend_date, event, present, note, created_at) VALUES
        (m1, '2025-10-18', 'Retreat', true, 'Panitia retreat', now());
    END IF;
    IF m2 IS NOT NULL THEN
        INSERT INTO attendance (member_id, attend_date, event, present, note, created_at) VALUES
        (m2, '2025-10-18', 'Retreat', true, 'Worship leader', now());
    END IF;
    IF m3 IS NOT NULL THEN
        INSERT INTO attendance (member_id, attend_date, event, present, note, created_at) VALUES
        (m3, '2025-10-18', 'Retreat', true, NULL, now());
    END IF;
    IF m5 IS NOT NULL THEN
        INSERT INTO attendance (member_id, attend_date, event, present, note, created_at) VALUES
        (m5, '2025-10-18', 'Retreat', true, 'Dokumentasi', now());
    END IF;

END $$;
