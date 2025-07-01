/*
  # Add activity_id column to revenues table

  1. Changes
    - Add `activity_id` column to revenues table as foreign key to activities
    - Add index on activity_id for better query performance
    - Column is nullable to allow revenues not linked to specific activities

  2. Security
    - No changes to RLS policies needed as they already cover the table
*/

-- Add activity_id column to revenues table
ALTER TABLE revenues 
ADD COLUMN IF NOT EXISTS activity_id uuid REFERENCES activities(id) ON DELETE SET NULL;

-- Create index for better performance on activity-based queries
CREATE INDEX IF NOT EXISTS idx_revenues_activity_id ON revenues(activity_id);

-- Grant necessary permissions (safe to run multiple times)
GRANT ALL ON revenues TO authenticated;