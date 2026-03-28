import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

function getDb() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

function checkAuth(req: VercelRequest): boolean {
  return req.headers["x-admin-token"] === "gn-admin-2025";
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!checkAuth(req)) return res.status(401).json({ error: "Unauthorized" });

  const db = getDb();

  // GET - 키워드 큐 목록 조회
  if (req.method === "GET") {
    const status = (req.query.status as string) ?? "pending";

    let query = db
      .from("gn_keyword_queue")
      .select("*")
      .order("created_at", { ascending: false });

    if (status !== "all") {
      query = query.eq("status", status);
    }

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });

    const { data: stats } = await db.from("gn_keyword_queue").select("status");
    const counts = { pending: 0, used: 0, rejected: 0 };
    for (const row of stats ?? []) {
      if (row.status in counts) counts[row.status as keyof typeof counts]++;
    }

    return res.json({ keywords: data ?? [], counts });
  }

  // POST - 수동으로 키워드 추가
  if (req.method === "POST") {
    const { keyword, category } = req.body ?? {};
    if (!keyword?.trim() || !category) {
      return res.status(400).json({ error: "keyword, category 필수" });
    }

    const { data: existing } = await db
      .from("gn_keyword_queue")
      .select("id")
      .eq("keyword", keyword.trim())
      .neq("status", "rejected")
      .maybeSingle();

    if (existing) {
      return res.status(409).json({ error: "이미 큐에 있는 키워드입니다" });
    }

    const { data, error } = await db
      .from("gn_keyword_queue")
      .insert({ keyword: keyword.trim(), category, source: "manual", status: "pending" })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.json({ keyword: data });
  }

  // DELETE - 키워드 삭제
  if (req.method === "DELETE") {
    const { id, ids } = req.body ?? {};

    if (ids && Array.isArray(ids)) {
      const { error } = await db.from("gn_keyword_queue").delete().in("id", ids);
      if (error) return res.status(500).json({ error: error.message });
    } else if (id) {
      const { error } = await db.from("gn_keyword_queue").delete().eq("id", id);
      if (error) return res.status(500).json({ error: error.message });
    } else {
      return res.status(400).json({ error: "id 또는 ids 필요" });
    }

    return res.json({ success: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
