/**
 * 스마트 키워드 수집 API (GN Makeup 메이크업레슨 전문)
 * 1. Claude AI로 후보 키워드 생성
 * 2. 네이버 검색광고 API로 검색량 + 경쟁도 확인
 * 3. Google Custom Search로 경쟁 콘텐츠 수 확인 (선택)
 * 4. Claude AI로 관련성 채점
 * 5. 기준 통과 키워드만 gn_keyword_queue에 저장
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";
import crypto from "crypto";

export const maxDuration = 60;

const CATEGORIES = ["메이크업레슨", "웨딩메이크업", "자격증·취업", "뷰티트렌드", "피부·베이스", "색조·아이"];

// GN Makeup 메이크업 레슨 서비스 중심 시드 키워드
const SEED_KEYWORDS: Record<string, string[]> = {
  "메이크업레슨":  ["1:1메이크업레슨", "메이크업배우기", "메이크업학원", "강남메이크업레슨", "뷰티레슨", "메이크업강의", "개인메이크업레슨"],
  "웨딩메이크업":  ["신부메이크업레슨", "웨딩메이크업배우기", "웨딩메이크업강의", "셀프웨딩메이크업", "피로연메이크업"],
  "자격증·취업":  ["메이크업자격증", "뷰티자격증", "미용사자격증", "메이크업아티스트", "뷰티강사", "메이크업취업"],
  "뷰티트렌드":   ["2025메이크업트렌드", "K뷰티트렌드", "유행메이크업", "아이돌메이크업", "뷰티유튜버"],
  "피부·베이스":  ["피부메이크업", "베이스메이크업", "파운데이션선택", "피부커버", "쿠션팩트추천"],
  "색조·아이":    ["아이섀도우", "아이라이너", "립스틱추천", "퍼스널컬러", "색조화장법"],
};

function getDb() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

// ── 네이버 검색광고 API ────────────────────────────────────────────────────────
function naverApiSignature(timestamp: string, method: string, uri: string, secretKey: string): string {
  const message = `${timestamp}.${method}.${uri}`;
  return crypto.createHmac("sha256", secretKey).update(message).digest("base64");
}

type NaverKeywordResult = {
  relKeyword: string;
  monthlyPcQcCnt: number | string;
  monthlyMobileQcCnt: number | string;
  compIdx: string;
};

async function fetchNaverKeywordData(
  keywords: string[]
): Promise<Record<string, { volume: number; competition: string }>> {
  const apiKey = process.env.NAVER_AD_API_KEY;
  const secretKey = process.env.NAVER_AD_SECRET_KEY;
  const customerId = process.env.NAVER_AD_CUSTOMER_ID;

  if (!apiKey || !secretKey || !customerId) return {};

  const results: Record<string, { volume: number; competition: string }> = {};
  const chunks: string[][] = [];
  for (let i = 0; i < keywords.length; i += 5) {
    chunks.push(keywords.slice(i, i + 5));
  }

  for (const chunk of chunks) {
    try {
      const timestamp = Date.now().toString();
      const uri = "/keywordstool";
      const method = "GET";
      const signature = naverApiSignature(timestamp, method, uri, secretKey);
      const cleanChunk = chunk
        .map((kw) => kw.replace(/[^\uAC00-\uD7A3\u1100-\u11FF\u3130-\u318Fa-zA-Z0-9]/g, "").slice(0, 15))
        .filter((kw) => kw.length > 0);
      if (cleanChunk.length === 0) continue;
      const queryString = `hintKeywords=${cleanChunk.map((kw) => encodeURIComponent(kw)).join(",")}&showDetail=1`;

      const res = await fetch(
        `https://api.searchad.naver.com${uri}?${queryString}`,
        {
          headers: {
            "X-Timestamp": timestamp,
            "X-API-KEY": apiKey,
            "X-Customer": customerId,
            "X-Signature": signature,
          },
        }
      );

      if (res.ok) {
        const data = await res.json();
        const list: NaverKeywordResult[] = data.keywordList ?? [];
        for (const item of list) {
          const pc = typeof item.monthlyPcQcCnt === "number" ? item.monthlyPcQcCnt : parseInt(item.monthlyPcQcCnt as string) || 0;
          const mobile = typeof item.monthlyMobileQcCnt === "number" ? item.monthlyMobileQcCnt : parseInt(item.monthlyMobileQcCnt as string) || 0;
          const volume = pc + mobile;
          const compMap: Record<string, string> = { "낮음": "low", "중간": "medium", "높음": "high" };
          results[item.relKeyword] = {
            volume,
            competition: compMap[item.compIdx] ?? "unknown",
          };
        }
      } else {
        const errText = await res.text().catch(() => "");
        console.error(`[Naver API] HTTP ${res.status}: ${errText}`);
        if (chunks.indexOf(chunk) === 0) {
          results["__error__"] = { volume: res.status, competition: errText.slice(0, 100) };
        }
      }
    } catch (e) {
      console.error("[Naver API] 오류:", e);
    }
    await new Promise((r) => setTimeout(r, 300));
  }

  return results;
}

// ── Google Custom Search API ──────────────────────────────────────────────────
async function fetchGoogleCompetition(keyword: string): Promise<string> {
  const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
  const cx = process.env.GOOGLE_SEARCH_ENGINE_ID;
  if (!apiKey || !cx) return "unknown";

  try {
    const url = new URL("https://www.googleapis.com/customsearch/v1");
    url.searchParams.set("key", apiKey);
    url.searchParams.set("cx", cx);
    url.searchParams.set("q", keyword);
    url.searchParams.set("lr", "lang_ko");
    url.searchParams.set("num", "1");

    const res = await fetch(url.toString());
    if (!res.ok) return "unknown";
    const data = await res.json();
    const total = parseInt(data.searchInformation?.totalResults ?? "0");
    if (total < 50000) return "low";
    if (total < 300000) return "medium";
    return "high";
  } catch {
    return "unknown";
  }
}

// ── Claude AI: 시드 키워드 생성 ───────────────────────────────────────────────
async function generateSeedKeywords(
  anthropic: Anthropic,
  count: number,
  existingKeywords: string[],
  today: string
): Promise<Array<{ keyword: string; category: string }>> {
  const existingSample = existingKeywords.slice(0, 50).join(", ");

  const prompt = `당신은 GN Makeup (강남역 3분 거리 프리미엄 1:1 메이크업 레슨 아카데미) SEO 전문가입니다.
오늘 날짜: ${today}

사이트 주제: 메이크업 레슨 수강, 1:1 메이크업 레슨, 웨딩 메이크업 레슨, 메이크업 자격증 취득, 강남 메이크업 학원

이미 있는 키워드 (제외할 것): ${existingSample}

네이버 검색광고 API에 넣을 짧은 시드 키워드 ${count}개를 제안하세요.
반드시 1~2단어, 최대 10글자 이내의 짧은 키워드만 (예: "메이크업레슨", "강남메이크업", "신부메이크업")
메이크업 레슨·수업·학원 관련 서비스 키워드 위주로.

반드시 아래 JSON 배열 형식으로만 응답하세요:
[
  {"keyword": "짧은키워드", "category": "카테고리명"},
  ...
]

카테고리는 반드시 이 중 하나: 메이크업레슨, 웨딩메이크업, 자격증·취업, 뷰티트렌드, 피부·베이스, 색조·아이`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4000,
    messages: [{ role: "user", content: prompt }],
  });

  const raw = message.content[0].type === "text" ? message.content[0].text : "[]";
  try {
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];
    return JSON.parse(jsonMatch[0]);
  } catch {
    return [];
  }
}

// ── Claude AI: 관련성 채점 ─────────────────────────────────────────────────────
async function scoreRelevance(
  anthropic: Anthropic,
  keywords: Array<{ keyword: string; category: string }>
): Promise<Record<string, number>> {
  if (keywords.length === 0) return {};

  const list = keywords.map((k, i) => `${i + 1}. [${k.category}] ${k.keyword}`).join("\n");

  const prompt = `당신은 GN Makeup (강남역 메이크업 레슨 아카데미) 블로그 편집장입니다.
아래 키워드들을 우리 사이트 주제(메이크업 레슨 수강, 1:1 레슨, 강남 메이크업 학원, 웨딩 메이크업, 자격증)와의 관련성으로 1~10점 채점하세요.

10: 핵심 주제 (예: 강남 메이크업 레슨, 1:1 메이크업 수업)
7-9: 관련성 높음 (메이크업 기법, 웨딩 메이크업)
5-6: 어느 정도 관련
1-4: 관련성 낮음 (제외 권장)

채점할 키워드:
${list}

JSON 형식으로만 응답 (다른 텍스트 없이):
{"1": 8, "2": 6, ...}`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 500,
      messages: [{ role: "user", content: prompt }],
    });
    const raw = message.content[0].type === "text" ? message.content[0].text : "{}";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return {};
    const scores: Record<string, number> = JSON.parse(jsonMatch[0]);
    const result: Record<string, number> = {};
    keywords.forEach((k, i) => {
      result[k.keyword] = scores[String(i + 1)] ?? 0;
    });
    return result;
  } catch {
    return {};
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const token = req.headers["x-admin-token"];
  const authHeader = req.headers["authorization"];
  const cronSecret = process.env.CRON_SECRET;
  if (token !== "gn-admin-2025" && (!cronSecret || authHeader !== `Bearer ${cronSecret}`)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const db = getDb();
  const today = new Date().toISOString().slice(0, 10);
  const log: string[] = [];

  const body = req.body ?? {};
  const minVolume: number = body.minVolume ?? 100;
  const maxCompetition: string = body.maxCompetition ?? "medium";
  const minRelevance: number = body.minRelevance ?? 6;
  const generateCount: number = Math.min(body.generateCount ?? 50, 50);

  try {
    // 기존 키워드 수집 (중복 방지)
    const { data: queueRows } = await db.from("gn_keyword_queue").select("keyword");
    const allExisting = (queueRows ?? []).map((r: { keyword: string }) => r.keyword);
    log.push(`기존 키워드 ${allExisting.length}개 확인`);

    const naverConfigured = !!(process.env.NAVER_AD_API_KEY && process.env.NAVER_AD_SECRET_KEY && process.env.NAVER_AD_CUSTOMER_ID);

    // ── 네이버 API 경로 ───────────────────────────────────────────────────────
    let naverCandidates: Array<{ keyword: string; category: string; volume: number; competition: string }> = [];

    if (naverConfigured) {
      log.push("네이버 API: 키 감지됨, 시드 키워드로 관련 키워드 수집 중...");

      const aiSeeds = await generateSeedKeywords(anthropic, 10, allExisting, today);
      log.push(`AI 시드 키워드 ${aiSeeds.length}개 생성`);

      const fixedSeeds: Array<{ keyword: string; category: string }> = [];
      for (const [cat, seeds] of Object.entries(SEED_KEYWORDS)) {
        const pick = seeds[Math.floor(Math.random() * seeds.length)];
        fixedSeeds.push({ keyword: pick, category: cat });
      }
      const allSeeds = [...aiSeeds, ...fixedSeeds].slice(0, 20);
      const seedKeywords = allSeeds.map((s) => s.keyword);
      const naverData = await fetchNaverKeywordData(seedKeywords);
      const naverCount = Object.keys(naverData).filter(k => k !== "__error__").length;

      if (naverData["__error__"]) {
        const errStatus = naverData["__error__"].volume;
        const errMsg = naverData["__error__"].competition;
        log.push(`네이버 API: HTTP ${errStatus} 오류 - ${errMsg || "응답 없음"}`);
        delete naverData["__error__"];
      } else {
        log.push(`네이버 API: ${naverCount}개 관련 키워드 수신`);
      }

      const compPriority: Record<string, number> = { low: 1, medium: 2, high: 3, unknown: 4 };
      const maxCompPriority = maxCompetition === "low" ? 1 : maxCompetition === "medium" ? 2 : 4;

      for (const [kw, data] of Object.entries(naverData)) {
        if (allExisting.some((e) => e.trim() === kw.trim())) continue;
        if (data.volume < minVolume) continue;
        if ((compPriority[data.competition] ?? 4) > maxCompPriority) continue;

        const matchedSeed = allSeeds.find((s) => kw.includes(s.keyword.slice(0, 3)));
        const category = matchedSeed?.category ?? "메이크업레슨";
        naverCandidates.push({ keyword: kw, category, volume: data.volume, competition: data.competition });
      }
      log.push(`검색량·경쟁도 필터 후 ${naverCandidates.length}개`);
    }

    // ── AI 단독 경로 ──────────────────────────────────────────────────────────
    let aiCandidates: Array<{ keyword: string; category: string }> = [];
    const needAiFallback = !naverConfigured || naverCandidates.length < 5;

    if (needAiFallback) {
      if (!naverConfigured) log.push("네이버 API: 미설정 → AI 단독 모드");
      const aiCount = Math.max(generateCount, 20);
      aiCandidates = await generateSeedKeywords(anthropic, aiCount, allExisting, today);
      log.push(`AI 후보 키워드 ${aiCandidates.length}개 생성`);
    }

    const combined: Array<{ keyword: string; category: string; volume: number; competition: string }> = [
      ...naverCandidates,
      ...aiCandidates
        .filter((c) => !allExisting.some((e) => e.trim() === c.keyword.trim()))
        .map((c) => ({ ...c, volume: 0, competition: "unknown" })),
    ];

    const unique = combined
      .filter((c, i) => combined.findIndex((x) => x.keyword.trim() === c.keyword.trim()) === i)
      .slice(0, 100);

    log.push(`중복 제외 후 후보 ${unique.length}개`);

    const relevanceScores = await scoreRelevance(anthropic, unique.map((c) => ({ keyword: c.keyword, category: c.category })));
    const scored = unique.map((c) => ({ ...c, relevance: relevanceScores[c.keyword] ?? 5 }));

    const approved = scored
      .filter((c) => c.relevance >= minRelevance)
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, generateCount);
    log.push(`관련성 점수 필터 후 ${approved.length}개 승인`);

    const inserted: string[] = [];
    for (const kw of approved) {
      let competition = kw.competition;
      if (competition === "unknown" && process.env.GOOGLE_SEARCH_API_KEY) {
        competition = await fetchGoogleCompetition(kw.keyword);
        await new Promise((r) => setTimeout(r, 200));
      }

      const { error } = await db.from("gn_keyword_queue").insert({
        keyword: kw.keyword,
        category: CATEGORIES.includes(kw.category) ? kw.category : "메이크업레슨",
        source: naverCandidates.some((n) => n.keyword === kw.keyword) ? "naver" : "ai",
        search_volume: kw.volume,
        competition,
        relevance_score: kw.relevance,
        status: "pending",
      });

      if (!error) inserted.push(kw.keyword);
    }

    log.push(`${inserted.length}개 키워드 큐에 추가`);

    return res.json({ success: true, added: inserted.length, total_candidates: unique.length, log, keywords: inserted });
  } catch (err) {
    console.error("[keyword-collect]", err);
    return res.status(500).json({ success: false, error: "서버 오류", log });
  }
}
