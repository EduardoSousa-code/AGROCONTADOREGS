/*
  # Create activities table for farm activity management

  1. New Tables
    - `activities`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `name` (text, not null)
      - `description` (text, nullable)
      - `start_date` (date, not null)
      - `end_date` (date, nullable)
      - `status` (text, not null, default 'planejada')
      - `created_at` (timestamp with timezone, default now())
      - `updated_at` (timestamp with timezone, default now())

  2. Security
    - Enable RLS on `activities` table
    - Add policy for users to read their own activities
    - Add policy for users to insert their own activities
    - Add policy for users to update their own activities
    - Add policy for users to delete their own activities

  3. Indexes
    - Add index on user_id for better query performance
    - Add index on start_date for date-based queries
    - Add index on status for status-based filtering
    - Add index on created_at for chronological ordering

  4. Constraints
    - Check constraint for valid status values
    - Check constraint to ensure end_date >= start_date when end_date is provided

  5. Triggers
    - Add trigger to automatically update updated_at timestamp
*/

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  start_date date NOT NULL,
  end_date date,
  status text NOT NULL DEFAULT 'planejada',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Constraints
  CONSTRAINT activities_status_check CHECK (status = ANY (ARRAY['planejada'::text, 'em_andamento'::text, 'concluida'::text, 'cancelada'::text])),
  CONSTRAINT valid_date_range CHECK (end_date IS NULL OR end_date >= start_date)
);

-- Enable Row Level Security
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Create policies for activities
CREATE POLICY "Users can view own activities"
  ON activities
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own activities"
  ON activities
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own activities"
  ON activities
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own activities"
  ON activities
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_start_date ON activities(start_date);
CREATE INDEX IF NOT EXISTS idx_activities_status ON activities(status);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at);

-- Create trigger to automatically update updated_at timestamp
CREATE TRIGGER update_activities_updated_at
  BEFORE UPDATE ON activities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT ALL ON activities TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;