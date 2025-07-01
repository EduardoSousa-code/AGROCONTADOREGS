/*
  # Optimize RLS policies for better performance

  1. Changes
    - Update RLS policies for revenues table to use (select auth.uid())
    - Update RLS policies for expenses table to use (select auth.uid())
    - Update RLS policies for profiles table to use (select auth.uid())

  2. Performance Benefits
    - Reduces function re-evaluation for each row
    - Improves query performance at scale
    - Follows Supabase best practices for RLS

  3. Security
    - Maintains same security level
    - All policies continue to restrict access to user's own data
*/

-- Optimize RLS policies for public.revenues table
-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own revenues" ON public.revenues;
DROP POLICY IF EXISTS "Users can insert own revenues" ON public.revenues;
DROP POLICY IF EXISTS "Users can update own revenues" ON public.revenues;
DROP POLICY IF EXISTS "Users can delete own revenues" ON public.revenues;

-- Recreate policies with (select auth.uid()) for public.revenues
CREATE POLICY "Users can view own revenues"
  ON public.revenues
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own revenues"
  ON public.revenues
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own revenues"
  ON public.revenues
  FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own revenues"
  ON public.revenues
  FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- Optimize RLS policies for public.expenses table
-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can insert own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can update own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can delete own expenses" ON public.expenses;

-- Recreate policies with (select auth.uid()) for public.expenses
CREATE POLICY "Users can view own expenses"
  ON public.expenses
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own expenses"
  ON public.expenses
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own expenses"
  ON public.expenses
  FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own expenses"
  ON public.expenses
  FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- Optimize RLS policies for public.profiles table
-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Recreate policies with (select auth.uid()) for public.profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (id = (select auth.uid()));

CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = (select auth.uid()));

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = (select auth.uid()))
  WITH CHECK (id = (select auth.uid()));