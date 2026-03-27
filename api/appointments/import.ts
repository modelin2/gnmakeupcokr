import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

function getDb() {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const db = getDb();
  const { sqlContent } = req.body;
  if (!sqlContent || typeof sqlContent !== "string") {
    return res.status(400).json({ error: "sqlContent is required" });
  }

  const result = parseSqlBackup(sqlContent);
  if (result.appointments.length === 0) {
    return res.status(400).json({
      error: "No valid appointments found in SQL content",
      skipped: result.skipped,
      sampleLines: result.sampleLines,
    });
  }

  const rows = result.appointments.map((a) => ({
    name: a.name,
    category: a.category,
    date: a.date.toISOString(),
    time: a.time,
    phone: a.phone ?? null,
    notes: a.notes ?? null,
    secret: a.secret,
    original_no: a.originalNo ?? null,
  }));

  const batchSize = 100;
  let insertedCount = 0;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const { error } = await db.from("gn_appointments").insert(batch);
    if (error) return res.status(500).json({ error: "Failed to import appointments" });
    insertedCount += batch.length;
  }

  return res.json({ success: true, importedCount: insertedCount, skipped: result.skipped });
}

function parseSqlBackup(sqlContent: string) {
  const appointments: Array<{
    name: string;
    category: number;
    date: Date;
    time: string;
    phone?: string;
    notes?: string;
    secret: boolean;
    originalNo?: number;
  }> = [];
  let skipped = 0;

  const lines = sqlContent.split("\n").slice(0, 10);
  const sampleLines = lines.map((l) => l.substring(0, 200));

  let queries: string[];
  if (sqlContent.includes("#TNT_QUERY_DELIMITER#")) {
    queries = sqlContent.split("#TNT_QUERY_DELIMITER#");
  } else if (sqlContent.includes(";\n")) {
    queries = sqlContent.split(";\n");
  } else {
    queries = sqlContent.split(";");
  }

  for (const query of queries) {
    const trimmed = query.trim();
    if (!trimmed) continue;

    const insertMatch = trimmed.toLowerCase().match(/insert\s+into\s+(\S+)/);
    if (!insertMatch) continue;

    const tableName = insertMatch[1];
    if (!tableName.includes("makeupday")) {
      skipped++;
      continue;
    }

    const fields: Record<string, string> = {};

    const setMatch = trimmed.match(/set\s+(.+)$/is);
    if (setMatch) {
      const setPart = setMatch[1];
      const fieldRegex = /(\w+)\s*=\s*'([^']*)'/g;
      let match;
      while ((match = fieldRegex.exec(setPart)) !== null) {
        fields[match[1]] = match[2];
      }
    } else {
      const colsMatch = trimmed.match(/\(([^)]+)\)\s*values\s*\(([^)]+)\)/i);
      if (colsMatch) {
        const cols = colsMatch[1].split(",").map((c) => c.trim().replace(/`/g, ""));
        const vals = colsMatch[2].match(/'([^']*)'/g)?.map((v) => v.slice(1, -1)) || [];
        for (let i = 0; i < cols.length && i < vals.length; i++) {
          fields[cols[i]] = vals[i];
        }
      }
    }

    if (!fields.name) { skipped++; continue; }

    const year = parseInt(fields.user_add21);
    const month = parseInt(fields.user_add22);
    const day = parseInt(fields.user_add23);
    if (isNaN(year) || isNaN(month) || isNaN(day)) { skipped++; continue; }

    const date = new Date(year, month - 1, day);
    if (isNaN(date.getTime())) { skipped++; continue; }

    appointments.push({
      name: fields.name,
      category: parseInt(fields.category) || 1,
      date,
      time: fields.user_add1 || "00:00",
      phone: fields.phone || undefined,
      notes: fields.tbody || undefined,
      secret: fields.secret === "1",
      originalNo: fields.no ? parseInt(fields.no) : undefined,
    });
  }

  return { appointments, skipped, sampleLines };
}
