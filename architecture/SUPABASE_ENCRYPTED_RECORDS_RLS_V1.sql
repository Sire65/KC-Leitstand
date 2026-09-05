-- Candidate template. Review in the target Supabase project before execution.
create table if not exists public.leitstand_encrypted_records (
  user_id uuid not null references auth.users(id) on delete cascade,
  record_id text not null,
  scope text not null,
  record_key text not null,
  version integer not null,
  algorithm text not null,
  iv jsonb not null,
  ciphertext jsonb not null,
  updated_at timestamptz not null,
  primary key (user_id, record_id)
);

alter table public.leitstand_encrypted_records enable row level security;

create policy "users_select_own_encrypted_records"
on public.leitstand_encrypted_records for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "users_insert_own_encrypted_records"
on public.leitstand_encrypted_records for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "users_update_own_encrypted_records"
on public.leitstand_encrypted_records for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "users_delete_own_encrypted_records"
on public.leitstand_encrypted_records for delete
to authenticated
using ((select auth.uid()) = user_id);
