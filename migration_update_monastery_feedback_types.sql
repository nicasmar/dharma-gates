-- Update monastery_feedback table to combine correction and addition types
-- First, update existing 'correction' and 'addition' entries to the new combined type
UPDATE monastery_feedback 
SET feedback_type = 'info_about_center' 
WHERE feedback_type IN ('correction', 'addition');

-- Drop the old constraint
ALTER TABLE monastery_feedback DROP CONSTRAINT IF EXISTS monastery_feedback_feedback_type_check;

-- Add new constraint with the updated values
ALTER TABLE monastery_feedback ADD CONSTRAINT monastery_feedback_feedback_type_check 
CHECK (feedback_type IN ('info_about_center', 'general'));

-- Update comments
COMMENT ON COLUMN monastery_feedback.feedback_type IS 'Type of feedback: info_about_center (corrections, updates, additional information) or general'; 