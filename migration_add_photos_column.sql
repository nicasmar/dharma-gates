-- Add photos column to monasteries table
ALTER TABLE monasteries ADD COLUMN photos text[];

-- Add comment to describe the column
COMMENT ON COLUMN monasteries.photos IS 'Array of photo URLs for the monastery/center (max 5 photos)'; 