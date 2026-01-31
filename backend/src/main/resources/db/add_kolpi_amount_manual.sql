-- =====================================================
-- MANUAL SCRIPT: Add kolpi_amount column to attendance
-- Run this in pgAdmin or psql if column doesn't exist
-- =====================================================

-- Step 1: Add the column
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS kolpi_amount DECIMAL(15, 2) DEFAULT 0;

-- Step 2: Add indexes for performance (optional)
CREATE INDEX IF NOT EXISTS idx_attendance_attend_date ON attendance(attend_date);
CREATE INDEX IF NOT EXISTS idx_attendance_member_date ON attendance(member_id, attend_date);

-- Step 3: Verify the column was added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'attendance'
ORDER BY ordinal_position;

-- =====================================================
-- If "IF NOT EXISTS" syntax doesn't work, use this:
-- =====================================================
-- DO $$
-- BEGIN
--     IF NOT EXISTS (
--         SELECT 1 FROM information_schema.columns
--         WHERE table_name = 'attendance' AND column_name = 'kolpi_amount'
--     ) THEN
--         ALTER TABLE attendance ADD COLUMN kolpi_amount DECIMAL(15, 2) DEFAULT 0;
--     END IF;
-- END $$;
