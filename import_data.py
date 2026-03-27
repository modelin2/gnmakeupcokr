"""
GN Makeup 예약 데이터 Supabase 임포트 스크립트
실행: python3 import_data.py
"""

import urllib.request
import urllib.error
import json
import re
import os

# ── 설정 ──────────────────────────────────────────────────
SUPABASE_URL = "https://vilyjpopucetqntstlqr.supabase.co"
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpbHlqcG9wdWNldHFudHN0bHFyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjcwODUyMSwiZXhwIjoyMDg4Mjg0NTIxfQ.CW8l0sFIboOemMq4h9q3E-2Tvqe8SM_ANh1badWxMKo"  # ← Vercel 환경변수에서 복사해서 여기 붙여넣기

SQL_FILE = os.path.join(os.path.dirname(__file__),
    "attached_assets",
    "board_makeupday3_2025_12_06_18_(1)2_1765013300604.sql")
# ──────────────────────────────────────────────────────────

def parse_sql(path):
    with open(path, "rb") as f:
        raw = f.read()
    try:
        text = raw.decode("euc-kr", errors="replace")
    except Exception:
        text = raw.decode("utf-8", errors="replace")

    queries = text.split("#TNT_QUERY_DELIMITER#")
    appointments = []
    skipped = 0

    for query in queries:
        q = query.strip()
        if not q:
            continue
        if "makeupday" not in q.lower():
            continue
        if "insert into" not in q.lower():
            continue

        fields = {}
        # SET 구문 파싱
        set_match = re.search(r"set\s+(.+)$", q, re.IGNORECASE | re.DOTALL)
        if set_match:
            set_part = set_match.group(1)
            for m in re.finditer(r"(\w+)\s*=\s*'((?:[^'\\]|\\.)*)'", set_part):
                fields[m.group(1)] = m.group(2)

        if not fields.get("name"):
            skipped += 1
            continue

        try:
            year  = int(fields.get("user_add21", "0"))
            month = int(fields.get("user_add22", "0"))
            day   = int(fields.get("user_add23", "0"))
        except ValueError:
            skipped += 1
            continue

        if not (year and month and day):
            skipped += 1
            continue

        date_str = f"{year:04d}-{month:02d}-{day:02d}T00:00:00+09:00"

        appointments.append({
            "name":        fields["name"],
            "category":    int(fields.get("category", "1") or "1"),
            "date":        date_str,
            "time":        fields.get("user_add1", "") or "",
            "phone":       fields.get("phone") or None,
            "notes":       fields.get("tbody") or None,
            "secret":      fields.get("secret") == "1",
            "original_no": int(fields["no"]) if fields.get("no") else None,
        })

    return appointments, skipped


def insert_batch(rows, headers):
    url = f"{SUPABASE_URL}/rest/v1/gn_appointments"
    data = json.dumps(rows).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers={
        **headers,
        "Prefer": "return=minimal",
    }, method="POST")
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        print(f"  HTTP {e.code}: {body[:200]}")
        return e.code


def main():
    if not SERVICE_ROLE_KEY:
        print("❌ SERVICE_ROLE_KEY를 스크립트 상단에 입력하세요.")
        print("   Vercel → gnmakeupcokr 프로젝트 → Settings → Environment Variables")
        return

    print(f"📂 파일 읽는 중: {SQL_FILE}")
    appointments, skipped = parse_sql(SQL_FILE)
    print(f"✅ 파싱 완료: {len(appointments)}건 (스킵: {skipped}건)")

    if not appointments:
        print("❌ 임포트할 데이터가 없습니다.")
        return

    headers = {
        "apikey":        SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
        "Content-Type":  "application/json",
    }

    batch_size = 200
    total = len(appointments)
    inserted = 0

    for i in range(0, total, batch_size):
        batch = appointments[i:i + batch_size]
        status = insert_batch(batch, headers)
        if status in (200, 201):
            inserted += len(batch)
            print(f"  [{inserted}/{total}] 삽입 완료")
        else:
            print(f"  [{i}~{i+len(batch)}] 오류 발생 (status={status})")

    print(f"\n🎉 완료! 총 {inserted}건 Supabase에 저장되었습니다.")


if __name__ == "__main__":
    main()
