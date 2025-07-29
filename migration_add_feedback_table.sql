-- Create feedback table
CREATE TABLE feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  email TEXT,
  feedback TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add comments to describe the table and columns
COMMENT ON TABLE feedback IS 'User feedback submissions for the monastery directory';
COMMENT ON COLUMN feedback.name IS 'Optional name of the person giving feedback';
COMMENT ON COLUMN feedback.email IS 'Optional email of the person giving feedback';
COMMENT ON COLUMN feedback.feedback IS 'The feedback content (required)';
COMMENT ON COLUMN feedback.created_at IS 'Timestamp when the feedback was submitted';

-- Create index on created_at for sorting
CREATE INDEX idx_feedback_created_at ON feedback (created_at DESC);

-- Enable Row Level Security
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert feedback (public submissions)
CREATE POLICY "Anyone can submit feedback" ON feedback
FOR INSERT WITH CHECK (true);

-- Allow anyone to read feedback (for admin panel)
CREATE POLICY "Anyone can read feedback" ON feedback
FOR SELECT USING (true); 