-- GN Makeup 블로그 아티클 테이블
CREATE TABLE IF NOT EXISTS gn_articles (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug            TEXT UNIQUE NOT NULL,
  title           TEXT NOT NULL,
  excerpt         TEXT,
  content         TEXT,
  meta_description TEXT,
  category        TEXT,
  category_slug   TEXT,
  tags            TEXT[],
  author          TEXT DEFAULT '편집부',
  read_time       INTEGER DEFAULT 5,
  featured        BOOLEAN DEFAULT FALSE,
  published       BOOLEAN DEFAULT TRUE,
  image_url       TEXT,
  created_at      TEXT,
  site_id         TEXT DEFAULT 'gnmakeup'
);

CREATE INDEX IF NOT EXISTS gn_articles_slug_idx     ON gn_articles (slug);
CREATE INDEX IF NOT EXISTS gn_articles_category_idx ON gn_articles (category_slug);
CREATE INDEX IF NOT EXISTS gn_articles_created_idx  ON gn_articles (created_at DESC);

ALTER TABLE gn_articles DISABLE ROW LEVEL SECURITY;
