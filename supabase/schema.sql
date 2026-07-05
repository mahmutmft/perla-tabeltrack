-- Perla TableTrack schema
-- Run this once in the Supabase SQL Editor (Project > SQL Editor > New query > Run).

create table if not exists users (
  id bigint generated always as identity primary key,
  name text not null,
  pin_hash text not null,
  role text not null default 'waiter',
  created_at timestamptz not null default now()
);

create table if not exists categories (
  id bigint generated always as identity primary key,
  name text not null,
  sort_order integer not null default 0
);

create table if not exists products (
  id bigint generated always as identity primary key,
  name text not null,
  category_id bigint references categories(id) on delete set null,
  price numeric not null default 0,
  active boolean not null default true
);

create table if not exists tables (
  id bigint generated always as identity primary key,
  name text not null,
  status text not null default 'open',
  opened_by bigint references users(id),
  opened_at timestamptz not null default now(),
  closed_at timestamptz
);

create table if not exists order_items (
  id bigint generated always as identity primary key,
  table_id bigint not null references tables(id) on delete cascade,
  product_id bigint references products(id),
  name_snapshot text not null,
  price_snapshot numeric not null,
  quantity integer not null default 1,
  delivered boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists order_items_table_id_idx on order_items(table_id);
create index if not exists products_category_id_idx on products(category_id);

-- Row Level Security is on with no policies: the anon/publishable key gets zero
-- access to these tables. The app's backend uses the service_role key (server-side
-- only), which bypasses RLS entirely, so no policies are needed for the app to work.
alter table users enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table tables enable row level security;
alter table order_items enable row level security;
