-- V6: Add kolpi_amount column to attendance table
-- Kolpi = Kolekte/Persembahan (offering)

ALTER TABLE attendance ADD COLUMN IF NOT EXISTS kolpi_amount DECIMAL(15, 2) DEFAULT 0;

-- Add index for better performance on reporting queries
CREATE INDEX IF NOT EXISTS idx_attendance_sector_date ON attendance(attend_date);
CREATE INDEX IF NOT EXISTS idx_attendance_member_date ON attendance(member_id, attend_date);
