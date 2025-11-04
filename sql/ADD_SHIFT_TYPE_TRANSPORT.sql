-- Migration: Add shift_type and transport_time_minutes to schedule_slots
-- This migration adds support for different shift types (day, night, etc.) and transport time tracking

-- Add shift_type column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'schedule_slots' 
    AND column_name = 'shift_type'
  ) THEN
    ALTER TABLE schedule_slots 
    ADD COLUMN shift_type TEXT CHECK (shift_type IN ('day', 'night', 'evening', 'weekend', 'other')) DEFAULT 'day';
  END IF;
END $$;

-- Add transport_time_minutes column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'schedule_slots' 
    AND column_name = 'transport_time_minutes'
  ) THEN
    ALTER TABLE schedule_slots 
    ADD COLUMN transport_time_minutes INTEGER DEFAULT 0 CHECK (transport_time_minutes >= 0);
  END IF;
END $$;

-- Add index for shift_type if needed
CREATE INDEX IF NOT EXISTS idx_schedule_slots_shift_type ON schedule_slots(shift_type);

-- Comment on columns
COMMENT ON COLUMN schedule_slots.shift_type IS 'Type of shift: day (06:00-18:00), evening (18:00-22:00), night (22:00-06:00), weekend, or other';
COMMENT ON COLUMN schedule_slots.transport_time_minutes IS 'Transport time in minutes between schedule slots or from home to work site';

