/*
  # Create supplies table for inventory management

  1. New Tables
    - `supplies`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `name` (text, not null)
      - `unit` (text, not null)
      - `current_stock` (decimal, not null, default 0)
      - `min_stock_level` (decimal, not null, default 0)
      - `max_stock_level` (decimal, not null, default 0)
      - `expiry_date` (date, nullable)
      - `description` (text, nullable)
      - `created_at` (timestamp with timezone, default now())
      - `updated_at` (timestamp with timezone, default now())

  2. Security
    - Enable RLS on `supplies` table
    - Add policy for users to read their own supplies
    - Add policy for users to insert their own supplies
    - Add policy for users to update their own supplies
    - Add policy for users to delete their own supplies

  3. Indexes
    - Add index on user_id for better query performance
    - Add index on name for name-based searches
    - Add index on current_stock for stock-based queries
    - Add index on expiry_date for expiry-based filtering
    - Add index on created_at for chronological ordering

  4. Constraints
    - Check constraint to ensure current_stock >= 0
    - Check constraint to ensure min_stock_level >= 0
    - Check constraint to ensure max_stock_level >= 0
    - Check constraint to ensure min_stock_level <= max_stock_level

  5. Triggers
    - Add trigger to automatically update updated_at timestamp
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
ALTER TABLE supplies ENABLE ROW LEVEL SECURITY;

-- Create policies for supplies
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_supplies_user_id ON supplies(user_id);
CREATE INDEX IF NOT EXISTS idx_supplies_name ON supplies(name);
CREATE INDEX IF NOT EXISTS idx_supplies_current_stock ON supplies(current_stock);
CREATE INDEX IF NOT EXISTS idx_supplies_expiry_date ON supplies(expiry_date);
CREATE INDEX IF NOT EXISTS idx_supplies_created_at ON supplies(created_at);

-- Create trigger to automatically update updated_at timestamp
CREATE TRIGGER update_supplies_updated_at
  BEFORE UPDATE ON supplies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT ALL ON supplies TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;