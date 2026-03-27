import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";
import { DEFAULT_ARTICLE_PROMPT } from "../../client/src/lib/articlePrompt.js";

function getDb() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

const CATEGORY_MAP: Record<string, string> = {
  "기초메이크업": "basic-makeup",
  "웨딩메이크업": "wedding-makeup",
  "뷰티트렌드": "beauty-trend",
  "메이크업팁": "makeup-tip",
  "색조화장": "color-makeup",
  "피부관리": "skincare",
};

function generateSlug(title: string, categorySlug: string): string {
  const date = new Date().toISOString().slice(0, 10);
  const rand = Math.random().toString(36).slice(2, 6);
  const clean = title
    .toLowerCase()
    .replace(/[가-힣]+/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 30);
  return `${clean || categorySlug}-${date}-${rand}`;
}

function estimateReadTime(content: string): number {
  return Math.max(3, Math.ceil(content.replace(/<[^>]+>/g, "").length / 2 / 400));
}

function extractSection(text: string, tag: string): string {
  const match = text.match(new RegExp(`\\[${tag}\\]([\\s\\S]*?)\\[\\/${tag}\\]`));
  return match ? match[1].trim() : "";
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const token = req.headers["x-admin-token"];
  if (token !== "gn-admin-2025") return res.status(401).json({ error: "Unauthorized" });

  const { keyword, category } = req.body;
  if (!keyword || !category) return res.status(400).json({ error: "keyword, category 필수" });

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const db = getDb();

  const categorySlug = CATEGORY_MAP[category] ?? "makeup-tip";
  const promptContent = DEFAULT_ARTICLE_PROMPT
    .replace(/\{\{keyword\}\}/g, keyword)
    .replace(/\{\{category\}\}/g, category);

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    messages: [{ role: "user", content: promptContent }],
  });

  const raw = message.content[0].type === "text" ? message.content[0].text : "";
  const title = extractSection(raw, "TITLE");
  const excerpt = extractSection(raw, "EXCERPT");
  const meta_description = extractSection(raw, "META");
  const tags = extractSection(raw, "TAGS").split(",").map((t) => t.trim()).filter(Boolean);
  const content = extractSection(raw, "CONTENT");

  if (!title || !content) return res.status(500).json({ error: "기사 생성 실패" });

  const slug = generateSlug(title, categorySlug);
  const today = new Date().toISOString().slice(0, 10);

  const { data: article, error } = await db
    .from("gn_articles")
    .insert({
      slug, title, excerpt, content, meta_description,
      category, category_slug: categorySlug, tags,
      author: "편집부",
      read_time: estimateReadTime(content),
      featured: false, published: true,
      created_at: today, image_url: null,
      site_id: "gnmakeup",
    })
    .select("id, slug, title")
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ success: true, article });
}
