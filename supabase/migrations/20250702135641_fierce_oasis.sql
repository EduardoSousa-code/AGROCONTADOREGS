/*
  # Create supplies table for inventory management

  1. New Tables
    - `supplies`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `name` (text, supply name)
      - `unit` (text, measurement unit)
      - `current_stock` (decimal, current stock level)
      - `min_stock_level` (decimal, minimum stock threshold)
      - `max_stock_level` (decimal, maximum stock threshold)
      - `expiry_date` (date, optional expiry date)
      - `description` (text, optional description)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `supplies` table
    - Add policies for authenticated users to manage their own supplies

  3. Performance
    - Add indexes for common queries
    - Add trigger for automatic updated_at timestamp
*/

-- Create supplies table
CREATE TABLE IF NOT EXISTS supplies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  unit text NOT NULL,
  current_stock decimal(15,3) NOT NULL DEFAULT 0,
  min_stock_level decimal(15,3) NOT NULL DEFAULT 0,
  max_stock_level decimal(15,3) NOT NULL DEFAULT 0,
  expiry_date date,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Constraints
  CONSTRAINT supplies_current_stock_check CHECK (current_stock >= 0),
  CONSTRAINT supplies_min_stock_level_check CHECK (min_stock_level >= 0),
  CONSTRAINT supplies_max_stock_level_check CHECK (max_stock_level >= 0),
  CONSTRAINT valid_stock_levels CHECK (min_stock_level <= max_stock_level)
);

-- Enable Row Level Security
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'supplies' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE supplies ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Drop existing policies if they exist and recreate them
DO $$ 
BEGIN
  -- Drop policies if they exist
  DROP POLICY IF EXISTS "Users can view own supplies" ON supplies;
  DROP POLICY IF EXISTS "Users can insert own supplies" ON supplies;
  DROP POLICY IF EXISTS "Users can update own supplies" ON supplies;
  DROP POLICY IF EXISTS "Users can delete own supplies" ON supplies;
  
  -- Create policies
  CREATE POLICY "Users can view own supplies"
    ON supplies
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

  CREATE POLICY "Users can insert own supplies"
    ON supplies
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

  CREATE POLICY "Users can update own supplies"
    ON supplies
    FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

  CREATE POLICY "Users can delete own supplies"
    ON supplies
    FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_supplies_user_id ON supplies(user_id);
CREATE INDEX IF NOT EXISTS idx_supplies_name ON supplies(name);
CREATE INDEX IF NOT EXISTS idx_supplies_current_stock ON supplies(current_stock);
CREATE INDEX IF NOT EXISTS idx_supplies_expiry_date ON supplies(expiry_date);
CREATE INDEX IF NOT EXISTS idx_supplies_created_at ON supplies(created_at);

-- Create trigger to automatically update updated_at timestamp
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_supplies_updated_at'
  ) THEN
    CREATE TRIGGER update_supplies_updated_at
      BEFORE UPDATE ON supplies
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Grant necessary permissions
DO $$
BEGIN
  -- Grant permissions safely
  GRANT ALL ON supplies TO authenticated;
  GRANT USAGE ON SCHEMA public TO authenticated;
EXCEPTION
  WHEN duplicate_object THEN
    NULL; -- Ignore if permissions already exist
END $$;