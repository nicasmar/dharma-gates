-- Update existing monastery_feedback table to support new status values
-- This is for databases that already have the old constraint

-- Drop the old check constraint
ALTER TABLE monastery_feedback DROP CONSTRAINT IF EXISTS monastery_feedback_admin_status_check;

-- Add the new check constraint with the updated values
ALTER TABLE monastery_feedback ADD CONSTRAINT monastery_feedback_admin_status_check 
CHECK (admin_status IN ('pending', 'cleared'));

-- Update comment
COMMENT ON COLUMN monastery_feedback.admin_status IS 'Review status: pending or cleared'; 