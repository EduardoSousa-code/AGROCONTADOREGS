/*
  # Add category column to revenues table

  1. Changes
    - Add `category` column to revenues table
    - Update existing records with default category
    - Add constraint to ensure category is not empty
    - Add index for better query performance

  2. Safety
    - Uses conditional checks to prevent errors on re-run
    - Updates existing data before adding constraints
    - Uses safe default values for existing records
*/

-- Add category column to revenues table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'revenues' AND column_name = 'category'
  ) THEN
    ALTER TABLE revenues ADD COLUMN category text DEFAULT '' NOT NULL;
  END IF;
END $$;

-- Update existing records that have empty category to have a default value
UPDATE revenues 
SET category = 'Outros' 
WHERE category IS NULL OR trim(category) = '';

-- Add constraint to ensure category is not empty for new records
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'revenues_category_not_empty'
  ) THEN
    ALTER TABLE revenues ADD CONSTRAINT revenues_category_not_empty CHECK (length(trim(category)) > 0);
  END IF;
END $$;

-- Add index for better query performance on category
CREATE INDEX IF NOT EXISTS idx_revenues_category ON revenues USING btree (category);