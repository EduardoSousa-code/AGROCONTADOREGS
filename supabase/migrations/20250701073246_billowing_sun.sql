/*
  # Add category column to revenues table

  1. Changes
    - Add `category` column to `revenues` table
    - Set default value to empty string for existing records
    - Add constraint to ensure category is not empty for new records

  2. Security
    - No changes to RLS policies needed as they already cover all columns
*/

-- Add category column to revenues table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'revenues' AND column_name = 'category'
  ) THEN
    ALTER TABLE revenues ADD COLUMN category text DEFAULT '' NOT NULL;
  END IF;
END $$;

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