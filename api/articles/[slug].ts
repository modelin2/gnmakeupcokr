import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

function getDb() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.method === "GET") {
    const db = getDb();
    const { slug } = req.query;

    const { data, error } = await db
      .from("gn_articles")
      .select("*")
      .eq("slug", slug as string)
      .eq("published", true)
      .single();

    if (error || !data) return res.status(404).json({ error: "Article not found" });
    return res.json(data);
  }

  if (req.method === "DELETE") {
    const token = req.headers["x-admin-token"];
    if (token !== "gn-admin-2025") return res.status(401).json({ error: "Unauthorized" });

    const db = getDb();
    const { slug } = req.query;
    const { error } = await db.from("gn_articles").delete().eq("slug", slug as string);
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
