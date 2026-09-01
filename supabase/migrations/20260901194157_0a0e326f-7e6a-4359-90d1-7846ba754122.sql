UPDATE auth.users SET email_confirmed_at = COALESCE(email_confirmed_at, now()) WHERE email = 'admin@plancraftpro.com';

UPDATE public.user_roles SET role = 'admin'::app_role
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'admin@plancraftpro.com');