/*
  # Revert profiles table and authentication implementation

  1. Remove Triggers
    - Drop trigger `on_auth_user_created` from auth.users
    - Drop trigger `update_profiles_updated_at` from profiles

  2. Remove Functions
    - Drop function `handle_new_user()`
    - Drop function `update_updated_at_column()`

  3. Remove Policies
    - Drop all RLS policies from profiles table

  4. Remove Table
    - Drop profiles table completely

  This migration reverts all changes made by previous migrations related to profiles.
*/

-- Remove triggers first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;

-- Remove functions
DROP FUNCTION IF EXISTS handle_new_user();
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Remove RLS policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Remove the profiles table completely
DROP TABLE IF EXISTS public.profiles;

-- Clean up any remaining permissions
REVOKE ALL ON SCHEMA public FROM anon, authenticated;
GRANT USAGE ON SCHEMA public TO anon, authenticated;