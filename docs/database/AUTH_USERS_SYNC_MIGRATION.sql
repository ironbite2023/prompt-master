-- =====================================================================
-- MIGRATION: Auth Users to Public Users Synchronization
-- Task: TASK-15-AUTH-USERS-TABLE-SYNC
-- Created: 2025-10-04
-- Author: Plan Agent / PDCA Collection
-- Description: Automatically synchronize new user signups from auth.users 
--              to public.users table using PostgreSQL triggers
-- =====================================================================

-- ---------------------------------------------------------------------
-- STEP 1: Create the Trigger Function
-- ---------------------------------------------------------------------
-- This function automatically inserts a new record into public.users
-- whenever a new user signs up via Supabase Auth (auth.users insert)
-- ---------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Insert new user record with data from auth.users
  INSERT INTO public.users (
    id,                                               -- UUID primary key
    user_id,                                          -- Text user identifier
    email,                                            -- User email address
    full_name,                                        -- User's full name (optional)
    avatar_url,                                       -- User's avatar URL (optional)
    token_identifier,                                 -- Unique token for API access
    created_at,                                       -- Account creation timestamp
    updated_at                                        -- Last update timestamp
  )
  VALUES (
    NEW.id,                                           -- Copy UUID from auth.users
    NEW.id::text,                                     -- Convert UUID to text
    NEW.email,                                        -- Copy email from auth.users
    NEW.raw_user_meta_data->>'full_name',            -- Extract from signup metadata
    NEW.raw_user_meta_data->>'avatar_url',           -- Extract from signup metadata
    'user_' || NEW.id::text,                         -- Generate unique token
    NEW.created_at,                                   -- Preserve auth creation time
    NEW.created_at                                    -- Initialize updated_at
  );
  
  -- Return NEW to allow the INSERT to proceed
  RETURN NEW;
END;
$$;

-- Add function documentation
COMMENT ON FUNCTION public.handle_new_user() IS 
  'Automatically creates a public.users record when a new user signs up via Supabase Auth. 
   This trigger function ensures data consistency between auth.users and public.users tables.
   Created: 2025-10-04 | Task: TASK-15-AUTH-USERS-TABLE-SYNC';

-- ---------------------------------------------------------------------
-- STEP 2: Create the Trigger on auth.users
-- ---------------------------------------------------------------------
-- This trigger fires AFTER a new user is inserted into auth.users
-- and calls handle_new_user() to create the corresponding public.users record
-- ---------------------------------------------------------------------

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Add trigger documentation
COMMENT ON TRIGGER on_auth_user_created ON auth.users IS
  'Fires after new user creation in auth.users to synchronize with public.users table. 
   See TASK-15-AUTH-USERS-TABLE-SYNC.md for details.
   Created: 2025-10-04';

-- ---------------------------------------------------------------------
-- STEP 3: Grant Necessary Permissions
-- ---------------------------------------------------------------------
-- Grant permissions to supabase_auth_admin so the auth system can
-- execute the function and insert into public.users
-- ---------------------------------------------------------------------

-- Grant execute permission on the trigger function
GRANT EXECUTE ON FUNCTION public.handle_new_user() 
  TO supabase_auth_admin;

-- Grant insert permission on the users table
GRANT INSERT ON TABLE public.users 
  TO supabase_auth_admin;

-- Grant usage on sequences (if any auto-incrementing columns exist)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public 
  TO supabase_auth_admin;

-- ---------------------------------------------------------------------
-- STEP 4: Verify Installation
-- ---------------------------------------------------------------------
-- Query to verify the trigger is properly installed
-- ---------------------------------------------------------------------

-- Check if trigger exists
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created'
  AND event_object_schema = 'auth';

-- Check if function exists
SELECT 
  routine_name,
  routine_type,
  security_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'handle_new_user';

-- ---------------------------------------------------------------------
-- MIGRATION COMPLETE
-- ---------------------------------------------------------------------
-- To test: Create a new user via your application's signup form
-- Then verify the user appears in both auth.users AND public.users
-- ---------------------------------------------------------------------

