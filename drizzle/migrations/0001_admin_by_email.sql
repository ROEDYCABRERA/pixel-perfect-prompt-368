create or replace function public.handle_first_admin()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if lower(new.email) = 'familia.drive.tools@gmail.com' then
    insert into public.user_roles (user_id, role) values (new.id, 'admin') on conflict do nothing;
  end if;
  return new;
end;
$$;

delete from public.user_roles ur using auth.users u
  where ur.user_id = u.id and lower(u.email) <> 'familia.drive.tools@gmail.com';

insert into public.user_roles (user_id, role)
  select id, 'admin' from auth.users where lower(email) = 'familia.drive.tools@gmail.com'
  on conflict do nothing;