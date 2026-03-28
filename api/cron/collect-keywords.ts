import type { VercelRequest, VercelResponse } from "@vercel/node";

export const maxDuration = 300;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const authHeader = req.headers["authorization"];
  const adminToken = req.headers["x-admin-token"];
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}` && adminToken !== "gn-admin-2025") {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const siteUrl = process.env.SITE_URL ?? "https://gnmakeupcokr.vercel.app";

  try {
    const collectRes = await fetch(`${siteUrl}/api/keyword-collect`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-token": "gn-admin-2025",
      },
      body: JSON.stringify({ minVolume: 100, maxCompetition: "medium", minRelevance: 6, generateCount: 30 }),
    });

    const result = await collectRes.json();
    return res.json({ success: true, ...result });
  } catch (err) {
    console.error("[cron/collect-keywords]", err);
    return res.status(500).json({ error: "키워드 수집 실패" });
  }
}
