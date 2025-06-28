/*
  # Create expenses table for financial tracking

  1. New Tables
    - `expenses`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `value` (decimal, not null, must be positive)
      - `description` (text, not null)
      - `category` (text, not null)
      - `activity_id` (uuid, nullable - for future activity linking)
      - `date` (date, not null, default current date)
      - `created_at` (timestamp with timezone, default now())
      - `updated_at` (timestamp with timezone, default now())

  2. Security
    - Enable RLS on `expenses` table
    - Add policy for users to read their own expenses
    - Add policy for users to insert their own expenses
    - Add policy for users to update their own expenses
    - Add policy for users to delete their own expenses

  3. Indexes
    - Add index on user_id for better query performance
    - Add index on date for date-based queries
    - Add index on category for category-based filtering
    - Add index on activity_id for future activity-based queries
    - Add index on created_at for chronological ordering

  4. Triggers
    - Add trigger to automatically update updated_at timestamp
*/

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  value decimal(15,2) NOT NULL CHECK (value > 0),
  description text NOT NULL,
  category text NOT NULL,
  activity_id uuid DEFAULT NULL, -- Will be linked to activities table in the future
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Create policies for expenses
CREATE POLICY "Users can view own expenses"
  ON expenses
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own expenses"
  ON expenses
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own expenses"
  ON expenses
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own expenses"
  ON expenses
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_activity_id ON expenses(activity_id);
CREATE INDEX IF NOT EXISTS idx_expenses_created_at ON expenses(created_at);

-- Create trigger to automatically update updated_at timestamp
CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT ALL ON expenses TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;