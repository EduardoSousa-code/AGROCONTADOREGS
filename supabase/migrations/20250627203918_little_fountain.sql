/*
  # Create revenues table for financial tracking

  1. New Tables
    - `revenues`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `value` (decimal, not null)
      - `description` (text, not null)
      - `category` (text, not null)
      - `date` (date, not null)
      - `created_at` (timestamp with timezone, default now())
      - `updated_at` (timestamp with timezone, default now())

  2. Security
    - Enable RLS on `revenues` table
    - Add policy for users to read their own revenues
    - Add policy for users to insert their own revenues
    - Add policy for users to update their own revenues
    - Add policy for users to delete their own revenues

  3. Indexes
    - Add index on user_id for better query performance
    - Add index on date for date-based queries
    - Add index on category for category-based filtering
*/

-- Create revenues table
CREATE TABLE IF NOT EXISTS revenues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  value decimal(15,2) NOT NULL CHECK (value > 0),
  description text NOT NULL,
  category text NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE revenues ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own revenues"
  ON revenues
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own revenues"
  ON revenues
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own revenues"
  ON revenues
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own revenues"
  ON revenues
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_revenues_user_id ON revenues(user_id);
CREATE INDEX IF NOT EXISTS idx_revenues_date ON revenues(date);
CREATE INDEX IF NOT EXISTS idx_revenues_category ON revenues(category);
CREATE INDEX IF NOT EXISTS idx_revenues_created_at ON revenues(created_at);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_revenues_updated_at
  BEFORE UPDATE ON revenues
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT ALL ON revenues TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;