import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenAI } from "@google/genai";
import { KEYWORD_POOL } from "../../client/src/lib/keywords.js";
import { DEFAULT_ARTICLE_PROMPT } from "../../client/src/lib/articlePrompt.js";

export const maxDuration = 300;

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

const IMAGE_PROMPTS: Record<string, string> = {
  "기초메이크업": "Korean woman in her 20s doing base makeup with brushes and foundation, bright studio lighting, elegant minimal background, magazine quality photography, 16:9",
  "웨딩메이크업": "Korean bride in her 20s with elegant wedding makeup, soft pink tones, professional bridal look, white background, magazine quality photography, 16:9",
  "뷰티트렌드": "Korean woman with trendy modern makeup look, vibrant colors, fashion editorial style, urban background, magazine quality photography, 16:9",
  "메이크업팁": "Korean woman learning makeup in a bright professional studio, mirror and makeup tools, clean aesthetic, magazine quality photography, 16:9",
  "색조화장": "Colorful eyeshadow palette and makeup products arranged artfully, Korean beauty aesthetic, bright natural light, magazine quality photography, 16:9",
  "피부관리": "Korean woman with glowing healthy skin applying skincare, minimal clean background, soft lighting, magazine quality photography, 16:9",
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

function pickKeyword(usedTitles: string[], categoryCounts: Record<string, number>) {
  const sorted = Object.entries(categoryCounts).sort((a, b) => a[1] - b[1]);
  for (const [cat] of sorted) {
    const candidates = KEYWORD_POOL.filter(
      (k) => k.category === cat && !usedTitles.some((t) => t.includes(k.keyword.slice(0, 10).toLowerCase()))
    );
    if (candidates.length > 0) return candidates[Math.floor(Math.random() * candidates.length)];
  }
  return KEYWORD_POOL[Math.floor(Math.random() * KEYWORD_POOL.length)];
}

async function generateImage(category: string): Promise<{ base64: string; filename: string } | null> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
    const prompt = IMAGE_PROMPTS[category] ?? IMAGE_PROMPTS["메이크업팁"];
    const response = await ai.models.generateImages({
      model: "imagen-4.0-fast-generate-001",
      prompt,
      config: { numberOfImages: 1, aspectRatio: "16:9", outputMimeType: "image/jpeg" },
    });
    const bytes = response.generatedImages?.[0]?.image?.imageBytes;
    if (!bytes) return null;
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const rand = Math.random().toString(36).slice(2, 6);
    return { base64: bytes, filename: `gnmakeup-${date}-${rand}.jpg` };
  } catch {
    return null;
  }
}

async function uploadImage(base64: string, filename: string): Promise<string | null> {
  try {
    const db = getDb();
    const buffer = Buffer.from(base64, "base64");
    const { error } = await db.storage.from("article-images").upload(filename, buffer, {
      contentType: "image/jpeg",
      cacheControl: "31536000",
      upsert: false,
    });
    if (error) return null;
    const { data } = db.storage.from("article-images").getPublicUrl(filename);
    return data.publicUrl;
  } catch {
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const authHeader = req.headers["authorization"];
  const cronSecret = process.env.CRON_SECRET;
  const adminToken = req.headers["x-admin-token"];
  if (cronSecret && authHeader !== `Bearer ${cronSecret}` && adminToken !== "gn-admin-2025") {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const db = getDb();

  const { data: existing } = await db
    .from("gn_articles")
    .select("title, category")
    .eq("published", true)
    .eq("site_id", "gnmakeup");

  const usedTitles = (existing ?? []).map((a: { title: string }) => a.title.toLowerCase());
  const categoryCounts: Record<string, number> = {};
  for (const cat of Object.keys(CATEGORY_MAP)) categoryCounts[cat] = 0;
  for (const a of existing ?? []) {
    if (a.category in categoryCounts) categoryCounts[a.category]++;
  }

  const results = [];
  for (let i = 0; i < 2; i++) {
    try {
      const { keyword, category } = pickKeyword(usedTitles, categoryCounts);
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
      if (!title || !content) continue;

      let image_url: string | null = null;
      const imgResult = await generateImage(category);
      if (imgResult) image_url = await uploadImage(imgResult.base64, imgResult.filename);

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
          created_at: today, image_url,
          site_id: "gnmakeup",
        })
        .select("id, title")
        .single();

      if (error) throw new Error(error.message);
      usedTitles.push(title.toLowerCase());
      categoryCounts[category] = (categoryCounts[category] ?? 0) + 1;
      results.push({ id: article.id, title: article.title, image_url });
    } catch (e) {
      console.error("[cron] 오류:", e);
    }
  }

  return res.json({ success: true, generated: results.length, articles: results });
}
