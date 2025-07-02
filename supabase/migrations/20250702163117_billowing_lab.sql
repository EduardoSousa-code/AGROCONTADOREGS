/*
  # Add Foreign Key Relationships

  1. Foreign Key Constraints
    - Add foreign key constraint from `revenues.activity_id` to `activities.id`
    - Add foreign key constraint from `expenses.activity_id` to `activities.id`
  
  2. Security
    - These constraints will ensure data integrity
    - Will enable proper joins between tables in queries

  This migration fixes the "Could not find a relationship" errors by establishing
  the proper foreign key relationships that Supabase needs for joins.
*/

-- Add foreign key constraint for revenues table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'revenues_activity_id_fkey' 
    AND table_name = 'revenues'
  ) THEN
    ALTER TABLE public.revenues
    ADD CONSTRAINT revenues_activity_id_fkey
    FOREIGN KEY (activity_id)
    REFERENCES public.activities(id)
    ON DELETE SET NULL;
  END IF;
END $$;

-- Add foreign key constraint for expenses table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'expenses_activity_id_fkey' 
    AND table_name = 'expenses'
  ) THEN
    ALTER TABLE public.expenses
    ADD CONSTRAINT expenses_activity_id_fkey
    FOREIGN KEY (activity_id)
    REFERENCES public.activities(id)
    ON DELETE SET NULL;
  END IF;
END $$;