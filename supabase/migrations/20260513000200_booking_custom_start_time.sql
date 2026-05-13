-- Add custom_start_time column to bookings
-- Allows admin to set an arbitrary start time (e.g. "09:30") instead of
-- one of the three preset slot times (08:00 / 11:00 / 13:30).
-- When set, this value is used in booking confirmations instead of the slot index.

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS custom_start_time text DEFAULT NULL;

COMMENT ON COLUMN bookings.custom_start_time IS
  'Optional custom start time in HH:MM format set by admin when booking at a non-standard time.';
