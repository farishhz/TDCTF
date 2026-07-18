-- ==============================================
-- Function: admin_batch_create_users
-- Description: Batch creates users, sets password, creates profile, joins/creates team, registers for event
-- ==============================================

-- 0. One-time repair for users created via batch import missing identities or having NULL tokens
-- Based on GoTrue source (supabase/auth internal/models/user.go):
--   All non-pointer string fields MUST be '' (not NULL)
--   All non-pointer bool fields MUST be false (not NULL)
--   All non-pointer int fields MUST be 0 (not NULL)
--   Only pointer fields (*string, *time.Time) can safely be NULL
--   phone (storage.NullString) can be NULL, but phone_change and phone_change_token (string) CANNOT
UPDATE auth.users
SET
  confirmation_token = COALESCE(confirmation_token, ''),
  email_change = COALESCE(email_change, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  email_change_confirm_status = COALESCE(email_change_confirm_status, 0),
  recovery_token = COALESCE(recovery_token, ''),
  reauthentication_token = COALESCE(reauthentication_token, ''),
  phone_change = COALESCE(phone_change, ''),
  phone_change_token = COALESCE(phone_change_token, ''),
  is_sso_user = COALESCE(is_sso_user, false),
  is_anonymous = COALESCE(is_anonymous, false)
WHERE confirmation_token IS NULL 
   OR email_change IS NULL 
   OR email_change_token_new IS NULL 
   OR email_change_token_current IS NULL
   OR email_change_confirm_status IS NULL
   OR recovery_token IS NULL
   OR reauthentication_token IS NULL
   OR phone_change IS NULL
   OR phone_change_token IS NULL
   OR is_sso_user IS NULL
   OR is_anonymous IS NULL;

INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
)
SELECT
  gen_random_uuid(),
  u.id,
  json_build_object('sub', u.id::text, 'email', u.email)::jsonb,
  'email',
  u.id::text,
  now(),
  now(),
  now()
FROM auth.users u
LEFT JOIN auth.identities i ON i.user_id = u.id
WHERE i.id IS NULL;

CREATE OR REPLACE FUNCTION public.admin_batch_create_users(
  p_users JSONB,
  p_event_id UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_user_record RECORD;
  v_user_id UUID;
  v_team_id UUID;
  v_invite_code TEXT;
  v_success_count INT := 0;
  v_failed_count INT := 0;
  v_results JSONB := '[]'::jsonb;
  v_err_msg TEXT;
  v_username TEXT;
  v_email TEXT;
  v_password TEXT;
  v_team_name TEXT;
BEGIN
  -- 1. Check if caller is admin
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only global admins can batch create users';
  END IF;

  -- 2. Loop through users in the JSONB array
  FOR v_user_record IN 
    SELECT * FROM jsonb_to_recordset(p_users) AS x(username TEXT, email TEXT, password TEXT, team TEXT)
  LOOP
    v_username := trim(v_user_record.username);
    v_email := trim(lower(v_user_record.email));
    v_password := v_user_record.password;
    v_team_name := trim(v_user_record.team);
    v_user_id := NULL;
    v_team_id := NULL;
    v_err_msg := NULL;

    BEGIN
      -- Validate basic fields
      IF v_username IS NULL OR v_username = '' THEN
        RAISE EXCEPTION 'Username is required';
      END IF;
      IF NOT v_username ~ '^[a-zA-Z0-9_. -]+$' THEN
        RAISE EXCEPTION 'Username can only contain letters, numbers, spaces, ".", "_", and "-"';
      END IF;
      IF v_email IS NULL OR v_email = '' THEN
        RAISE EXCEPTION 'Email is required';
      END IF;
      IF NOT v_email ~ '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$' THEN
        RAISE EXCEPTION 'Invalid email format';
      END IF;
      IF v_password IS NULL OR length(v_password) < 6 THEN
        RAISE EXCEPTION 'Password must be at least 6 characters long';
      END IF;

      -- Check uniqueness
      IF EXISTS (SELECT 1 FROM public.users WHERE username = v_username) THEN
        RAISE EXCEPTION 'Username "%" already exists', v_username;
      END IF;
      IF EXISTS (SELECT 1 FROM auth.users WHERE email = v_email) THEN
        RAISE EXCEPTION 'Email "%" already exists', v_email;
      END IF;

      -- Generate new user UUID
      v_user_id := gen_random_uuid();

      -- Insert into auth.users (Supabase Auth / GoTrue compatible)
      -- Reference: supabase/auth internal/models/user.go User struct
      -- Non-pointer string fields -> '' (not NULL)
      -- Non-pointer bool fields -> false (not NULL)
      -- Non-pointer int fields -> 0 (not NULL)
      -- phone is storage.NullString (nullable) -> NULL is safe (unique constraint allows multiple NULLs)
      INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        aud,
        role,
        created_at,
        updated_at,
        confirmation_token,
        email_change,
        email_change_token_new,
        email_change_token_current,
        email_change_confirm_status,
        recovery_token,
        reauthentication_token,
        phone,
        phone_change,
        phone_change_token,
        is_sso_user,
        is_anonymous
      ) VALUES (
        v_user_id,
        '00000000-0000-0000-0000-000000000000'::uuid,
        v_email,
        crypt(v_password, gen_salt('bf', 10)),
        now(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        json_build_object('username', v_username)::jsonb,
        'authenticated',
        'authenticated',
        now(),
        now(),
        '',    -- confirmation_token (string, not pointer)
        '',    -- email_change (string, not pointer)
        '',    -- email_change_token_new (string, not pointer)
        '',    -- email_change_token_current (string, not pointer)
        0,     -- email_change_confirm_status (int, not pointer)
        '',    -- recovery_token (string, not pointer)
        '',    -- reauthentication_token (string, not pointer)
        NULL,  -- phone (storage.NullString, nullable - safe for unique constraint)
        '',    -- phone_change (string, NOT pointer - must be '' not NULL!)
        '',    -- phone_change_token (string, NOT pointer - must be '' not NULL!)
        false, -- is_sso_user (bool, not pointer)
        false  -- is_anonymous (bool, not pointer)
      );

      -- Insert into auth.identities to link email login provider
      INSERT INTO auth.identities (
        id,
        user_id,
        identity_data,
        provider,
        provider_id,
        last_sign_in_at,
        created_at,
        updated_at
      ) VALUES (
        gen_random_uuid(),
        v_user_id,
        json_build_object('sub', v_user_id::text, 'email', v_email)::jsonb,
        'email',
        v_user_id::text,
        now(),
        now(),
        now()
      );

      -- Insert profile into public.users
      INSERT INTO public.users (id, username)
      VALUES (v_user_id, v_username);

      -- Team creation & assignment
      IF v_team_name IS NOT NULL AND v_team_name <> '' THEN
        SELECT id INTO v_team_id FROM public.teams WHERE name = v_team_name;
        
        IF v_team_id IS NULL THEN
          -- Team captain setup
          v_invite_code := generate_team_invite_code();
          INSERT INTO public.teams (name, invite_code, captain_user_id)
          VALUES (v_team_name, v_invite_code, v_user_id)
          RETURNING id INTO v_team_id;
        END IF;

        -- Join team
        INSERT INTO public.team_members (team_id, user_id)
        VALUES (v_team_id, v_user_id)
        ON CONFLICT (team_id, user_id) DO NOTHING;
      END IF;

      -- Event registration
      IF p_event_id IS NOT NULL THEN
        INSERT INTO public.event_participants (event_id, user_id)
        VALUES (p_event_id, v_user_id)
        ON CONFLICT (event_id, user_id) DO NOTHING;
      END IF;

      v_success_count := v_success_count + 1;
      v_results := v_results || jsonb_build_object(
        'username', v_username,
        'email', v_email,
        'success', true,
        'error', null
      );

    EXCEPTION WHEN OTHERS THEN
      v_failed_count := v_failed_count + 1;
      v_results := v_results || jsonb_build_object(
        'username', v_username,
        'email', v_email,
        'success', false,
        'error', SQLERRM
      );
    END;
  END LOOP;

  RETURN jsonb_build_object(
    'success_count', v_success_count,
    'failed_count', v_failed_count,
    'results', v_results
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = auth, public, extensions;

GRANT EXECUTE ON FUNCTION public.admin_batch_create_users(JSONB, UUID) TO authenticated;
