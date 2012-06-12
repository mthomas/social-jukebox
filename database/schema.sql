drop table Queue;

create table Queue (
  id SERIAL PRIMARY KEY,
  rdio_key varchar(200),
  sort_order int,
  track_name varchar(200),
  artist_name varchar(200),
  duration int,
  icon varchar(200),
  submitted_by varchar(200),
  created timestamp,
  votes int
);

drop table Vote;
create table Vote(
  id SERIAL PRIMARY KEY,
  queue_id int,
  submitted_by varchar(200)
);


drop table NowPlaying;
create table NowPlaying(
  id SERIAL PRIMARY KEY,
  rdio_key varchar(200),
  track_name varchar(200),
  artist_name varchar(200),
  duration int,
  icon varchar(200),
  submitted_by varchar(200),
  created timestamp
);


drop table Lyrics;
create table Lyrics(
  id SERIAL PRIMARY KEY,
  artist varchar(200),
  song varchar(200),
  lyrics text
);
create unique index UX_Lyrics_artist_song on Lyrics(artist, song);

create table Config(
  name varchar(200) NOT NULL PRIMARY KEY,
  value varchar(200) NULL
);

insert into Config (name, value) values ('channel', 'none');