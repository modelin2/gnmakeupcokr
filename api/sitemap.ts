import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const SITE_URL = process.env.SITE_URL || "https://gnmakeup.com";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const db = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  const { data: articles } = await db
    .from("gn_articles")
    .select("slug, created_at")
    .eq("published", true)
    .eq("site_id", "gnmakeup")
    .order("created_at", { ascending: false });

  const staticPages = [
    { url: "/", priority: "1.0", changefreq: "weekly" },
    { url: "/blog", priority: "0.9", changefreq: "daily" },
  ];

  const articleUrls = (articles ?? []).map((a) => ({
    url: `/blog/${a.slug}`,
    lastmod: a.created_at,
    priority: "0.7",
    changefreq: "monthly",
  }));

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages.map((p) => `  <url>
    <loc>${SITE_URL}${p.url}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join("\n")}
${articleUrls.map((p) => `  <url>
    <loc>${SITE_URL}${p.url}</loc>
    ${p.lastmod ? `<lastmod>${p.lastmod}</lastmod>` : ""}
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join("\n")}
</urlset>`;

  res.setHeader("Content-Type", "application/xml");
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");
  return res.send(xml);
}
