-- Create monastery_feedback table for feedback on specific monasteries
CREATE TABLE monastery_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  monastery_id UUID NOT NULL REFERENCES monasteries(id) ON DELETE CASCADE,
  user_name TEXT,
  user_email TEXT,
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('correction', 'addition', 'general')),
  subject TEXT NOT NULL,
  feedback_content TEXT NOT NULL,
  admin_status TEXT NOT NULL DEFAULT 'pending' CHECK (admin_status IN ('pending', 'cleared')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by TEXT
);

-- Add comments to describe the table and columns
COMMENT ON TABLE monastery_feedback IS 'User feedback and suggestions for specific monasteries';
COMMENT ON COLUMN monastery_feedback.monastery_id IS 'Reference to the monastery this feedback is about';
COMMENT ON COLUMN monastery_feedback.user_name IS 'Optional name of the person giving feedback';
COMMENT ON COLUMN monastery_feedback.user_email IS 'Optional email of the person giving feedback';
COMMENT ON COLUMN monastery_feedback.feedback_type IS 'Type of feedback: correction, addition, or general';
COMMENT ON COLUMN monastery_feedback.subject IS 'Brief subject/title of the feedback';
COMMENT ON COLUMN monastery_feedback.feedback_content IS 'Detailed feedback content';
COMMENT ON COLUMN monastery_feedback.admin_status IS 'Review status: pending or cleared';
COMMENT ON COLUMN monastery_feedback.admin_notes IS 'Optional notes from admin during review';
COMMENT ON COLUMN monastery_feedback.reviewed_at IS 'Timestamp when feedback was reviewed';
COMMENT ON COLUMN monastery_feedback.reviewed_by IS 'Admin who reviewed the feedback';

-- Create indexes for performance
CREATE INDEX idx_monastery_feedback_monastery_id ON monastery_feedback (monastery_id);
CREATE INDEX idx_monastery_feedback_status ON monastery_feedback (admin_status);
CREATE INDEX idx_monastery_feedback_created_at ON monastery_feedback (created_at DESC);

-- Enable Row Level Security
ALTER TABLE monastery_feedback ENABLE ROW LEVEL SECURITY;

-- Allow anyone to submit feedback (public submissions)
CREATE POLICY "Anyone can submit monastery feedback" ON monastery_feedback
FOR INSERT WITH CHECK (true);

-- Allow anyone to read feedback (for admin panel and public display)
CREATE POLICY "Anyone can read monastery feedback" ON monastery_feedback
FOR SELECT USING (true);

-- Allow updates only for admin actions (status changes, notes)
CREATE POLICY "Allow admin updates" ON monastery_feedback
FOR UPDATE USING (true); 