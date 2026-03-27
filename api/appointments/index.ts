import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

function getDb() {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const db = getDb();

  if (req.method === "GET") {
    const { startDate, endDate, category, search } = req.query;
    let query = db.from("gn_appointments").select("*").order("date", { ascending: false });

    if (startDate) query = query.gte("date", startDate as string);
    if (endDate) query = query.lte("date", endDate as string);
    if (category) query = query.eq("category", parseInt(category as string));
    if (search) {
      query = query.or(
        `name.ilike.%${search}%,phone.ilike.%${search}%,notes.ilike.%${search}%`
      );
    }

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: "Failed to fetch appointments" });
    return res.json(data);
  }

  if (req.method === "POST") {
    const body = req.body;
    if (!body?.date) return res.status(400).json({ error: "date is required" });
    const parsedDate = new Date(body.date);
    if (isNaN(parsedDate.getTime())) return res.status(400).json({ error: "Invalid date format" });

    const { data, error } = await db.from("gn_appointments").insert({
      name: body.name,
      category: body.category ?? 1,
      date: parsedDate.toISOString(),
      time: body.time,
      phone: body.phone ?? null,
      notes: body.notes ?? null,
      secret: body.secret ?? false,
      original_no: body.originalNo ?? null,
    }).select().single();

    if (error) return res.status(500).json({ error: "Failed to create appointment" });
    return res.status(201).json(toApiFormat(data));
  }

  if (req.method === "DELETE") {
    const { error, count } = await db.from("gn_appointments").delete().neq("id", 0);
    if (error) return res.status(500).json({ error: "Failed to delete appointments" });
    return res.json({ success: true, deletedCount: count ?? 0 });
  }

  return res.status(405).json({ error: "Method not allowed" });
}

function toApiFormat(row: Record<string, unknown>) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    date: row.date,
    time: row.time,
    phone: row.phone,
    notes: row.notes,
    secret: row.secret,
    originalNo: row.original_no,
  };
}
