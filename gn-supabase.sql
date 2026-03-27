-- GN Makeup 예약 테이블
-- Supabase SQL Editor에서 실행하세요

CREATE TABLE IF NOT EXISTS gn_appointments (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name        TEXT NOT NULL,
  category    INTEGER NOT NULL DEFAULT 1,
  date        TIMESTAMPTZ NOT NULL,
  time        TEXT NOT NULL,
  phone       TEXT,
  notes       TEXT,
  secret      BOOLEAN DEFAULT FALSE,
  original_no INTEGER,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 날짜 인덱스 (캘린더 조회 최적화)
CREATE INDEX IF NOT EXISTS gn_appointments_date_idx ON gn_appointments (date);

-- RLS 비활성화 (서버리스 함수에서 service_role 키 사용)
ALTER TABLE gn_appointments DISABLE ROW LEVEL SECURITY;
