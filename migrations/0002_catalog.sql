-- Catálogo compartilhado: cânticos e eventos visíveis a todos os visitantes.
-- Linhas sem user_id — o site é público; a edição é protegida por senha no servidor.

create table if not exists songs (
  id          text primary key,
  title       text not null,
  category    text not null,
  pdf_url     text not null default '',
  created_at  text not null
);

create index if not exists songs_category_idx on songs (category);
create index if not exists songs_title_idx on songs (title);

create table if not exists events (
  id          text primary key,
  name        text not null,
  starts_at   text not null,
  location    text not null default '',
  is_wedding  boolean not null default false,
  songs_json  text not null default '[]',
  created_at  text not null
);

create index if not exists events_starts_at_idx on events (starts_at);
