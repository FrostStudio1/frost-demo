-- Cleanup invalid time entries that are missing start_time
-- These entries are blocking proper checkout functionality

-- Step 1: Find all invalid time entries (missing start_time but no end_time = active but invalid)
SELECT 
  id,
  employee_id,
  project_id,
  date,
  start_time,
  end_time,
  tenant_id,
  created_at
FROM time_entries
WHERE start_time IS NULL 
  AND end_time IS NULL
ORDER BY created_at DESC;

-- Step 2: Delete invalid entries (WARNING: This will permanently delete these entries)
-- Uncomment the DELETE statement below after reviewing the SELECT results above
-- DELETE FROM time_entries
-- WHERE start_time IS NULL 
--   AND end_time IS NULL;

-- Step 3: Alternative - Close invalid entries by setting end_time (if you want to keep them)
-- UPDATE time_entries
-- SET end_time = start_time,
--     hours_total = 0,
--     ob_evening = 0,
--     ob_night = 0,
--     ob_weekend = 0
-- WHERE start_time IS NULL 
--   AND end_time IS NULL;

-- Step 4: Verify cleanup
SELECT 
  COUNT(*) as invalid_count
FROM time_entries
WHERE start_time IS NULL 
  AND end_time IS NULL;

