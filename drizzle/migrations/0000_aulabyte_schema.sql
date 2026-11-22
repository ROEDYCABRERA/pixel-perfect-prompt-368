-- Roles
create type public.app_role as enum ('admin');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "Users read own roles" on public.user_roles for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));

create or replace function public.admin_exists()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where role = 'admin')
$$;
grant execute on function public.admin_exists() to anon, authenticated;

create or replace function public.handle_first_admin()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles (user_id, role) values (new.id, 'admin') on conflict do nothing;
  end if;
  return new;
end;
$$;

create trigger on_auth_user_created_first_admin
  after insert on auth.users
  for each row execute function public.handle_first_admin();

-- Shared helpers
create type public.post_type as enum ('lesson','resource','video','software','simulator','activity','evaluation');
create type public.publish_status as enum ('draft','published','withdrawn');

create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end;
$$;

-- Categories
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  type public.post_type,
  created_at timestamptz not null default now()
);
grant select on public.categories to anon, authenticated;
grant insert, update, delete on public.categories to authenticated;
grant all on public.categories to service_role;
alter table public.categories enable row level security;
create policy "Anyone reads categories" on public.categories for select to anon, authenticated using (true);
create policy "Admins insert categories" on public.categories for insert to authenticated with check (public.has_role(auth.uid(),'admin'));
create policy "Admins update categories" on public.categories for update to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "Admins delete categories" on public.categories for delete to authenticated using (public.has_role(auth.uid(),'admin'));

-- Posts
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  type public.post_type not null,
  slug text not null,
  title text not null,
  summary text not null default '',
  cover_url text,
  category_id uuid references public.categories(id) on delete set null,
  body text not null default '',
  status public.publish_status not null default 'draft',
  position integer not null default 0,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (type, slug)
);
create index posts_type_status_idx on public.posts (type, status, position);
grant select on public.posts to anon;
grant select, insert, update, delete on public.posts to authenticated;
grant all on public.posts to service_role;
alter table public.posts enable row level security;
create policy "Public reads published posts" on public.posts for select to anon, authenticated using (status = 'published');
create policy "Admins read all posts" on public.posts for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "Admins insert posts" on public.posts for insert to authenticated with check (public.has_role(auth.uid(),'admin'));
create policy "Admins update posts" on public.posts for update to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "Admins delete posts" on public.posts for delete to authenticated using (public.has_role(auth.uid(),'admin'));
create trigger posts_touch before update on public.posts for each row execute function public.touch_updated_at();

create or replace function public.post_is_published(_post_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.posts where id = _post_id and status = 'published')
$$;
grant execute on function public.post_is_published(uuid) to anon, authenticated;

-- Detail tables
create table public.lessons (
  post_id uuid primary key references public.posts(id) on delete cascade,
  number integer not null default 1,
  duration_minutes integer not null default 30,
  introduction text not null default '',
  objectives text[] not null default '{}',
  subtopics jsonb not null default '[]'::jsonb,
  examples text[] not null default '{}',
  activities text[] not null default '{}',
  comprehension_questions text[] not null default '{}'
);
create table public.resources (
  post_id uuid primary key references public.posts(id) on delete cascade,
  resource_format text not null default 'Guía',
  file_url text,
  file_name text,
  external_url text
);
create table public.videos (
  post_id uuid primary key references public.posts(id) on delete cascade,
  video_url text,
  video_file_url text,
  duration text not null default '',
  comprehension_questions text[] not null default '{}'
);
create table public.software (
  post_id uuid primary key references public.posts(id) on delete cascade,
  features text[] not null default '{}',
  educational_use text not null default '',
  install_instructions text not null default '',
  usage_instructions text not null default '',
  official_url text,
  platforms text not null default '',
  practice_activity text not null default ''
);
create table public.simulators (
  post_id uuid primary key references public.posts(id) on delete cascade,
  builtin text,
  objectives text[] not null default '{}',
  features text[] not null default '{}',
  instructions text not null default '',
  access_url text,
  embed_url text,
  practice_activity text not null default '',
  reflection_questions text[] not null default '{}'
);
create table public.activities (
  post_id uuid primary key references public.posts(id) on delete cascade,
  objective text not null default '',
  instructions text not null default '',
  completion_notes text not null default ''
);
create table public.evaluations (
  post_id uuid primary key references public.posts(id) on delete cascade,
  instructions text not null default '',
  passing_score integer not null default 60
);

do $$
declare t text;
begin
  foreach t in array array['lessons','resources','videos','software','simulators','activities','evaluations'] loop
    execute format('grant select on public.%I to anon', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    execute format('grant all on public.%I to service_role', t);
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "Public reads published details" on public.%I for select to anon, authenticated using (public.post_is_published(post_id))', t);
    execute format('create policy "Admins read details" on public.%I for select to authenticated using (public.has_role(auth.uid(),''admin''))', t);
    execute format('create policy "Admins insert details" on public.%I for insert to authenticated with check (public.has_role(auth.uid(),''admin''))', t);
    execute format('create policy "Admins update details" on public.%I for update to authenticated using (public.has_role(auth.uid(),''admin''))', t);
    execute format('create policy "Admins delete details" on public.%I for delete to authenticated using (public.has_role(auth.uid(),''admin''))', t);
  end loop;
end $$;

-- Questions and options (answers and feedback hidden from the public)
create table public.questions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  position integer not null default 0,
  prompt text not null,
  feedback text not null default '',
  created_at timestamptz not null default now()
);
create index questions_post_idx on public.questions (post_id, position);
create table public.answer_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  position integer not null default 0,
  text text not null,
  is_correct boolean not null default false
);
create index answer_options_question_idx on public.answer_options (question_id, position);

grant select (id, post_id, position, prompt) on public.questions to anon, authenticated;
grant select (id, question_id, position, text) on public.answer_options to anon, authenticated;
grant all on public.questions to service_role;
grant all on public.answer_options to service_role;
alter table public.questions enable row level security;
alter table public.answer_options enable row level security;
create policy "Public reads published questions" on public.questions for select to anon, authenticated
  using (public.post_is_published(post_id) or public.has_role(auth.uid(),'admin'));
create policy "Public reads published options" on public.answer_options for select to anon, authenticated
  using (exists (select 1 from public.questions q where q.id = question_id and (public.post_is_published(q.post_id) or public.has_role(auth.uid(),'admin'))));

-- Admin: read full question set (with answers)
create or replace function public.admin_get_questions(_post_id uuid)
returns jsonb language plpgsql stable security definer set search_path = public as $$
begin
  if not public.has_role(auth.uid(), 'admin') then
    raise exception 'No autorizado';
  end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'prompt', q.prompt,
      'feedback', q.feedback,
      'options', coalesce((select jsonb_agg(jsonb_build_object('text', o.text, 'is_correct', o.is_correct) order by o.position)
                           from public.answer_options o where o.question_id = q.id), '[]'::jsonb)
    ) order by q.position)
    from public.questions q where q.post_id = _post_id
  ), '[]'::jsonb);
end;
$$;
grant execute on function public.admin_get_questions(uuid) to authenticated;

-- Admin: replace full question set
create or replace function public.admin_save_questions(_post_id uuid, _questions jsonb)
returns void language plpgsql security definer set search_path = public as $$
declare q jsonb; o jsonb; qi integer := 0; oi integer; new_qid uuid;
begin
  if not public.has_role(auth.uid(), 'admin') then
    raise exception 'No autorizado';
  end if;
  delete from public.questions where post_id = _post_id;
  for q in select * from jsonb_array_elements(coalesce(_questions, '[]'::jsonb)) loop
    insert into public.questions (post_id, position, prompt, feedback)
      values (_post_id, qi, coalesce(q->>'prompt',''), coalesce(q->>'feedback',''))
      returning id into new_qid;
    oi := 0;
    for o in select * from jsonb_array_elements(coalesce(q->'options', '[]'::jsonb)) loop
      insert into public.answer_options (question_id, position, text, is_correct)
        values (new_qid, oi, coalesce(o->>'text',''), coalesce((o->>'is_correct')::boolean, false));
      oi := oi + 1;
    end loop;
    qi := qi + 1;
  end loop;
end;
$$;
grant execute on function public.admin_save_questions(uuid, jsonb) to authenticated;

-- Public: automatic grading. _answers = {"<question_id>": "<option_id>", ...}
create or replace function public.grade_answers(_post_id uuid, _answers jsonb)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  result jsonb := '[]'::jsonb;
  q record;
  correct_id uuid;
  chosen uuid;
  total integer := 0;
  score integer := 0;
  has_options boolean;
  is_ok boolean;
begin
  if not exists (select 1 from public.posts where id = _post_id and status = 'published' and type in ('activity','evaluation')) then
    raise exception 'Contenido no disponible';
  end if;
  for q in select id, feedback from public.questions where post_id = _post_id order by position loop
    select exists (select 1 from public.answer_options where question_id = q.id) into has_options;
    select id into correct_id from public.answer_options where question_id = q.id and is_correct order by position limit 1;
    chosen := nullif(_answers->>(q.id::text), '')::uuid;
    if has_options then
      total := total + 1;
      is_ok := chosen is not null and exists (select 1 from public.answer_options where id = chosen and question_id = q.id and is_correct);
      if is_ok then score := score + 1; end if;
    else
      is_ok := null;
    end if;
    result := result || jsonb_build_array(jsonb_build_object(
      'question_id', q.id,
      'selected_option_id', chosen,
      'correct_option_id', correct_id,
      'is_correct', is_ok,
      'feedback', q.feedback
    ));
  end loop;
  return jsonb_build_object('score', score, 'total', total, 'results', result);
end;
$$;
grant execute on function public.grade_answers(uuid, jsonb) to anon, authenticated;

-- Podcasts
create table public.podcasts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  episode_name text not null default '',
  episode_number integer not null default 1,
  description text not null default '',
  cover_url text,
  audio_url text,
  audio_path text,
  audio_format text,
  duration_seconds integer not null default 0,
  status public.publish_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.podcasts to anon;
grant select, insert, update, delete on public.podcasts to authenticated;
grant all on public.podcasts to service_role;
alter table public.podcasts enable row level security;
create policy "Public reads published podcasts" on public.podcasts for select to anon, authenticated using (status = 'published');
create policy "Admins read podcasts" on public.podcasts for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "Admins insert podcasts" on public.podcasts for insert to authenticated with check (public.has_role(auth.uid(),'admin'));
create policy "Admins update podcasts" on public.podcasts for update to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "Admins delete podcasts" on public.podcasts for delete to authenticated using (public.has_role(auth.uid(),'admin'));
create trigger podcasts_touch before update on public.podcasts for each row execute function public.touch_updated_at();

-- Contact messages
create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 100),
  email text not null check (char_length(email) between 3 and 255),
  subject text not null check (char_length(subject) between 1 and 150),
  message text not null check (char_length(message) between 1 and 2000),
  created_at timestamptz not null default now()
);
grant insert on public.contact_messages to anon, authenticated;
grant select, delete on public.contact_messages to authenticated;
grant all on public.contact_messages to service_role;
alter table public.contact_messages enable row level security;
create policy "Anyone sends messages" on public.contact_messages for insert to anon, authenticated with check (true);
create policy "Admins read messages" on public.contact_messages for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "Admins delete messages" on public.contact_messages for delete to authenticated using (public.has_role(auth.uid(),'admin'));