-- Add starred field to feedback table
ALTER TABLE feedback ADD COLUMN starred BOOLEAN DEFAULT false NOT NULL;

-- Add comment to describe the new column
COMMENT ON COLUMN feedback.starred IS 'Whether the feedback has been starred by an admin';

-- Create index on starred for filtering
CREATE INDEX idx_feedback_starred ON feedback (starred DESC, created_at DESC); 