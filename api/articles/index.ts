import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

function getDb() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.method === "GET") {
    const db = getDb();
    const { category, limit = "20", offset = "0" } = req.query;

    let query = db
      .from("gn_articles")
      .select("id, slug, title, excerpt, category, category_slug, tags, author, read_time, image_url, created_at")
      .eq("published", true)
      .eq("site_id", "gnmakeup")
      .order("created_at", { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (category) query = query.eq("category_slug", category as string);

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data ?? []);
  }

  return res.status(405).json({ error: "Method not allowed" });
}
