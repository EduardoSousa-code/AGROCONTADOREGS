/*
  # Fix profiles RLS policies

  1. Security Updates
    - Drop existing policies that may be using incorrect uid() function
    - Create new policies using proper auth.uid() function
    - Ensure all CRUD operations work correctly for authenticated users

  2. Policy Details
    - SELECT: Users can view their own profile using auth.uid() = id
    - INSERT: Users can create their own profile using auth.uid() = id  
    - UPDATE: Users can update their own profile using auth.uid() = id
    - DELETE: Users can delete their own profile using auth.uid() = id (though typically not needed)
*/

-- Drop existing policies to recreate them with correct syntax
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;

-- Create new policies with correct auth.uid() function
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Optional: Allow users to delete their own profile (uncomment if needed)
-- CREATE POLICY "Users can delete own profile"
--   ON profiles
--   FOR DELETE
--   TO authenticated
--   USING (auth.uid() = id);

-- Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;