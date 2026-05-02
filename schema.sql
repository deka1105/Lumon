-- ═══════════════════════════════════════
-- LUMON PORTFOLIO — SUPABASE SCHEMA
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════

-- Floors table
create table if not exists floors (
  id serial primary key,
  name text not null,
  code text not null,           -- short code e.g. "DE", "ML"
  color text default '#1a4a6a', -- accent color hex
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- Rooms table
create table if not exists rooms (
  id serial primary key,
  floor_id integer references floors(id) on delete cascade,
  type text not null default 'empty', -- 'project' | 'empty'
  title text,
  subtitle text,
  description text,
  tags text[] default '{}',
  image_url text,
  link text,
  github text,
  layout_row integer not null default 0,
  layout_col integer not null default 0,
  connection_type text default 'corridor', -- 'open' | 'corridor' | 'none'
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- Metrics table
create table if not exists metrics (
  id serial primary key,
  room_id integer references rooms(id) on delete cascade,
  label text not null,
  value text not null,
  sort_order integer default 0
);

-- Characters table (clearance config)
create table if not exists character_floors (
  character_id text not null,  -- 'mark' | 'helly' | etc
  floor_id integer references floors(id) on delete cascade,
  primary key (character_id, floor_id)
);

-- Storage bucket for project images
-- Run this separately in Supabase Storage dashboard:
-- Create bucket named "project-images" set to public

-- Row level security — public read, service key write
alter table floors enable row level security;
alter table rooms enable row level security;
alter table metrics enable row level security;

create policy "Public can read floors" on floors for select using (true);
create policy "Public can read rooms" on rooms for select using (true);
create policy "Public can read metrics" on metrics for select using (true);
create policy "Service key full access floors" on floors using (auth.role() = 'service_role');
create policy "Service key full access rooms" on rooms using (auth.role() = 'service_role');
create policy "Service key full access metrics" on metrics using (auth.role() = 'service_role');

-- ═══════════════════════════════════════
-- SEED DATA
-- ═══════════════════════════════════════
insert into floors (name, code, color, sort_order) values
  ('Data Engineering',      'DE', '#1a4a6a', 1),
  ('ML & AI',               'ML', '#2a1a5a', 2),
  ('BI & Visualization',    'BI', '#1a3a2a', 3),
  ('Tools & Automation',    'TA', '#3a2a1a', 4),
  ('Cloud & Infrastructure','CI', '#2a1a1a', 5),
  ('Open Source',           'OS', '#1a2a3a', 6);

-- Floor 1: Data Engineering rooms
insert into rooms (floor_id, type, title, subtitle, description, tags, link, github, layout_row, layout_col, connection_type, sort_order) values
(1, 'project', 'Real-Time Kafka Pipeline',       'Streaming Infrastructure · 2024', 'End-to-end streaming pipeline ingesting 2.4M events/day across 6 Kafka topics into Snowflake via dbt transformations. Reduced latency from 4h batch to 90s.', ARRAY['Kafka','Snowflake','dbt','Python','Spark'], '#', '#', 0, 0, 'open',     1),
(1, 'project', 'Databricks Lakehouse Migration', 'Cloud Architecture · 2024',        'Migrated on-prem Hadoop to Databricks Delta Lake. Unified batch and streaming, reducing infra cost 40% and query time 3x.',                                  ARRAY['Databricks','Delta Lake','PySpark','Azure'],  '#', '#', 0, 1, 'corridor', 2),
(1, 'empty',   null, null, null, '{}', null, null,                                                                                                                                                                                                                              0, 2, 'none',     3),
(1, 'project', 'Snowflake Data Vault',           'Data Modeling · 2023',             'Data Vault 2.0 model in Snowflake for retail client, enabling historical tracking across 80+ source tables.',                                                   ARRAY['Snowflake','Data Vault','dbt','SQL'],         '#', '#', 1, 0, 'open',     4),
(1, 'empty',   null, null, null, '{}', null, null,                                                                                                                                                                                                                              1, 1, 'none',     5),
(1, 'project', 'dbt Transformation Layer',       'Data Modeling · 2023',             'Modular dbt project with 120+ models, tests, and documentation. Powers BI layer for 3 business units.',                                                        ARRAY['dbt','Snowflake','SQL','Jinja'],              '#', '#', 1, 2, 'corridor', 6);

insert into metrics (room_id, label, value, sort_order) values
(1, 'Latency reduction', '97%',  1), (1, 'Events/day', '2.4M',      2), (1, 'Status', 'Production', 3),
(2, 'Cost reduction',   '40%',  1), (2, 'Query speedup', '3x',      2), (2, 'Status', 'Production', 3),
(4, 'Source tables',    '80+',  1), (4, 'Load time', '↓ 60%',       2), (4, 'Status', 'Production', 3),
(6, 'dbt models',       '120+', 1), (6, 'Business units', '3',      2), (6, 'Status', 'Production', 3);

-- Character floor access
insert into character_floors values
  ('mark',     1), ('mark',     2), ('mark',     3),
  ('helly',    1),
  ('irving',   1), ('irving',   2), ('irving',   6),
  ('dylan',    1), ('dylan',    4),
  ('milchick', 1), ('milchick', 2), ('milchick', 3), ('milchick', 4), ('milchick', 5), ('milchick', 6),
  ('burt',     3), ('burt',     6),
  ('cobel',    1), ('cobel',    2), ('cobel',    3), ('cobel',    4), ('cobel',    5), ('cobel',    6);
