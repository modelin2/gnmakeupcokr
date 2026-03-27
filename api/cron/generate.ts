import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenAI } from "@google/genai";

export const maxDuration = 300;

// ── 키워드 풀 ────────────────────────────────────────────
const KEYWORD_POOL = [
  { keyword: "메이크업 처음 시작하는 완벽 가이드", category: "기초메이크업" },
  { keyword: "기초 메이크업 순서와 핵심 팁", category: "기초메이크업" },
  { keyword: "파운데이션 피부 타입별 선택법", category: "기초메이크업" },
  { keyword: "눈 메이크업 초보자도 쉽게 따라하는 방법", category: "기초메이크업" },
  { keyword: "립 메이크업 오래 유지하는 비법", category: "기초메이크업" },
  { keyword: "섀딩 하이라이터 얼굴형별 적용법", category: "기초메이크업" },
  { keyword: "메이크업 브러시 종류와 사용법 완벽 정리", category: "기초메이크업" },
  { keyword: "눈썹 그리기 자연스럽게 하는 팁", category: "기초메이크업" },
  { keyword: "웨딩 메이크업 준비 완벽 체크리스트", category: "웨딩메이크업" },
  { keyword: "신부 메이크업 직접 하는 방법", category: "웨딩메이크업" },
  { keyword: "웨딩 메이크업 트렌드 2025", category: "웨딩메이크업" },
  { keyword: "졸업식 취업 면접 메이크업 추천", category: "웨딩메이크업" },
  { keyword: "증명사진 프로필 사진 메이크업 노하우", category: "웨딩메이크업" },
  { keyword: "2025 봄 메이크업 트렌드 컬러 총정리", category: "뷰티트렌드" },
  { keyword: "K-뷰티 글로벌 트렌드 최신 분석", category: "뷰티트렌드" },
  { keyword: "유리알 피부 메이크업 유행 이유", category: "뷰티트렌드" },
  { keyword: "아이돌 무대 메이크업 비밀", category: "뷰티트렌드" },
  { keyword: "올리브영 인기 제품으로 메이크업 하는 법", category: "뷰티트렌드" },
  { keyword: "메이크업 레슨 혼자 배우기 vs 학원 차이", category: "메이크업팁" },
  { keyword: "1:1 메이크업 레슨 받을 때 준비사항", category: "메이크업팁" },
  { keyword: "강남 메이크업 레슨 후기 선택 기준", category: "메이크업팁" },
  { keyword: "메이크업 자격증 취득하는 방법과 종류", category: "메이크업팁" },
  { keyword: "피부 표현 잘하는 메이크업 비법", category: "메이크업팁" },
  { keyword: "메이크업 오래 지속되게 하는 팁", category: "메이크업팁" },
  { keyword: "셀프 메이크업 잘못하는 실수와 해결법", category: "메이크업팁" },
  { keyword: "아이섀도우 팔레트 활용 방법 완벽 가이드", category: "색조화장" },
  { keyword: "봄 여름 가을 겨울 퍼스널 컬러 메이크업", category: "색조화장" },
  { keyword: "립 컬러 피부색에 맞게 고르는 법", category: "색조화장" },
  { keyword: "아이라이너 종류별 차이와 사용법", category: "색조화장" },
  { keyword: "글리터 홀로그램 메이크업 하는 법", category: "색조화장" },
  { keyword: "메이크업 전 피부 준비 스킨케어 루틴", category: "피부관리" },
  { keyword: "여드름 피부 메이크업 커버하는 방법", category: "피부관리" },
  { keyword: "건성 지성 복합성 피부 메이크업 차이", category: "피부관리" },
  { keyword: "피부 좋아 보이는 베이스 메이크업 노하우", category: "피부관리" },
];

const PROMPT = `당신은 GN Makeup 뷰티 매거진 전문 기자입니다.
GN Makeup은 서울 강남역 3분 거리에 위치한 프리미엄 1:1 메이크업 레슨 전문 아카데미로, 2800명 이상의 수강생이 선택했습니다.
아래 키워드로 SEO에 최적화된 뷰티 정보 기사를 작성하세요.

키워드: "{{keyword}}"
카테고리: "{{category}}"

[TITLE]
기사 제목 (키워드 포함, 30~45자)
[/TITLE]

[EXCERPT]
기사 요약 2~3문장
[/EXCERPT]

[META]
구글 검색 설명 (150자 이내)
[/META]

[TAGS]
태그1,태그2,태그3,태그4,태그5
[/TAGS]

[CONTENT]
기사 본문 HTML (h2 소제목 3~4개, p 태그 단락, 전체 1200자 이상)
실용적·구체적 정보. 메이크업 초보자도 이해할 수 있는 설명. GN Makeup 레슨과 자연스럽게 연결.
[/CONTENT]`;

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
  "웨딩메이크업": "Korean bride with elegant wedding makeup, soft pink tones, professional bridal look, white background, magazine quality photography, 16:9",
  "뷰티트렌드": "Korean woman with trendy modern makeup look, vibrant colors, fashion editorial style, magazine quality photography, 16:9",
  "메이크업팁": "Korean woman learning makeup in a bright professional studio, mirror and makeup tools, clean aesthetic, magazine quality photography, 16:9",
  "색조화장": "Colorful eyeshadow palette and makeup products arranged artfully, Korean beauty aesthetic, bright natural light, magazine quality photography, 16:9",
  "피부관리": "Korean woman with glowing healthy skin applying skincare, minimal clean background, soft lighting, magazine quality photography, 16:9",
};

function getDb() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

function generateSlug(title: string, categorySlug: string): string {
  const date = new Date().toISOString().slice(0, 10);
  const rand = Math.random().toString(36).slice(2, 6);
  const clean = title.toLowerCase().replace(/[가-힣]+/g, "").replace(/[^a-z0-9\s]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 30);
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
    const candidates = KEYWORD_POOL.filter(k => k.category === cat && !usedTitles.some(t => t.includes(k.keyword.slice(0, 10).toLowerCase())));
    if (candidates.length > 0) return candidates[Math.floor(Math.random() * candidates.length)];
  }
  return KEYWORD_POOL[Math.floor(Math.random() * KEYWORD_POOL.length)];
}

async function generateAndUploadImage(category: string): Promise<string | null> {
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
    const db = getDb();
    const filename = `gnmakeup-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.jpg`;
    const buffer = Buffer.from(bytes, "base64");
    const { error } = await db.storage.from("article-images").upload(filename, buffer, { contentType: "image/jpeg", cacheControl: "31536000", upsert: false });
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
  const adminToken = req.headers["x-admin-token"];
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}` && adminToken !== "gn-admin-2025") {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const db = getDb();

  const { data: existing } = await db.from("gn_articles").select("title, category").eq("published", true).eq("site_id", "gnmakeup");
  const usedTitles = (existing ?? []).map((a: { title: string }) => a.title.toLowerCase());
  const categoryCounts: Record<string, number> = {};
  for (const cat of Object.keys(CATEGORY_MAP)) categoryCounts[cat] = 0;
  for (const a of existing ?? []) { if (a.category in categoryCounts) categoryCounts[a.category]++; }

  const results = [];
  for (let i = 0; i < 2; i++) {
    try {
      const { keyword, category } = pickKeyword(usedTitles, categoryCounts);
      const categorySlug = CATEGORY_MAP[category] ?? "makeup-tip";
      const promptContent = PROMPT.replace(/\{\{keyword\}\}/g, keyword).replace(/\{\{category\}\}/g, category);

      const message = await anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 4096,
        messages: [{ role: "user", content: promptContent }],
      });

      const raw = message.content[0].type === "text" ? message.content[0].text : "";
      const title = extractSection(raw, "TITLE");
      const excerpt = extractSection(raw, "EXCERPT");
      const meta_description = extractSection(raw, "META");
      const tags = extractSection(raw, "TAGS").split(",").map(t => t.trim()).filter(Boolean);
      const content = extractSection(raw, "CONTENT");
      if (!title || !content) continue;

      const image_url = await generateAndUploadImage(category);
      const slug = generateSlug(title, categorySlug);
      const today = new Date().toISOString().slice(0, 10);

      const { data: article, error } = await db.from("gn_articles").insert({
        slug, title, excerpt, content, meta_description,
        category, category_slug: categorySlug, tags,
        author: "편집부", read_time: estimateReadTime(content),
        featured: false, published: true, created_at: today, image_url,
        site_id: "gnmakeup",
      }).select("id, title, slug").single();

      if (error) throw new Error(error.message);
      usedTitles.push(title.toLowerCase());
      categoryCounts[category] = (categoryCounts[category] ?? 0) + 1;
      results.push({ id: article.id, title: article.title, slug: article.slug, image_url });
    } catch (e) {
      console.error("[cron] 오류:", e);
    }
  }

  return res.json({ success: true, generated: results.length, articles: results });
}
