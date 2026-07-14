create table users (
  id uuid primary key default gen_random_uuid(),
  line_user_id text unique,
  name text not null,
  email text,
  role text default 'owner',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table contacts (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references users(id),
  company_name text not null,
  person_name text not null,
  person_name_kana text,
  department text,
  position text,
  postal_code text,
  address text,
  email text,
  phone text,
  mobile_phone text,
  fax text,
  website_url text,
  instagram_url text,
  line_id_or_url text,
  facebook_url text,
  memo text,
  ai_summary text,
  customer_rank smallint not null default 3 check (customer_rank between 1 and 5),
  referrer_name text,
  business_category text,
  first_registered_at date,
  last_contacted_at date,
  next_follow_up_date date,
  next_follow_up_type text,
  follow_up_status text not null default 'scheduled',
  business_card_exchanged_at date,
  business_card_event_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table contact_images (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references contacts(id) on delete cascade,
  side text not null check (side in ('front', 'back')),
  storage_path text not null,
  mime_type text,
  width integer,
  height integer,
  created_at timestamptz not null default now()
);

create table ocr_jobs (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid references contacts(id) on delete set null,
  status text not null default 'pending',
  provider text,
  raw_text text,
  raw_json jsonb,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table ocr_fields (
  id uuid primary key default gen_random_uuid(),
  ocr_job_id uuid not null references ocr_jobs(id) on delete cascade,
  field_name text not null,
  field_value text,
  confidence numeric(4, 3),
  bbox_json jsonb,
  is_corrected boolean not null default false,
  corrected_value text,
  created_at timestamptz not null default now()
);

create table tags (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references users(id) on delete cascade,
  name text not null,
  color text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_user_id, name)
);

create table contact_tags (
  contact_id uuid not null references contacts(id) on delete cascade,
  tag_id uuid not null references tags(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (contact_id, tag_id)
);

create table activity_logs (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references contacts(id) on delete cascade,
  activity_date date not null,
  activity_type text not null,
  title text not null,
  detail text,
  summary_ai text,
  next_action text,
  next_follow_up_date date,
  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table reminders (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references contacts(id) on delete cascade,
  activity_log_id uuid references activity_logs(id) on delete set null,
  remind_at timestamptz not null,
  channel text not null default 'app',
  status text not null default 'scheduled',
  message text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table sales_records (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references contacts(id) on delete cascade,
  project_name text not null,
  contract_amount numeric(12, 0),
  order_date date,
  status text not null default 'hearing',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table message_templates (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references users(id) on delete cascade,
  template_type text not null,
  title text not null,
  body text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create table ai_generations (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid references contacts(id) on delete cascade,
  activity_log_id uuid references activity_logs(id) on delete cascade,
  generation_type text not null,
  input_json jsonb,
  output_text text,
  status text not null default 'completed',
  created_at timestamptz not null default now()
);

create table calendar_integrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  provider text not null,
  provider_account_id text,
  access_token_encrypted text,
  refresh_token_encrypted text,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table external_links (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references contacts(id) on delete cascade,
  service_name text not null,
  external_record_id text,
  external_url text,
  created_at timestamptz not null default now()
);

create index contacts_owner_updated_idx on contacts (owner_user_id, updated_at desc);
create index contacts_owner_company_idx on contacts (owner_user_id, company_name);
create index contacts_owner_person_idx on contacts (owner_user_id, person_name);
create index contacts_owner_address_idx on contacts (owner_user_id, address);
create index contacts_owner_followup_idx on contacts (owner_user_id, next_follow_up_date);
create index contacts_owner_business_idx on contacts (owner_user_id, business_category);
create index activity_logs_contact_date_idx on activity_logs (contact_id, activity_date desc);
