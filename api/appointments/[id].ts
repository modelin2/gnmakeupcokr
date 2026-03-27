import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

function getDb() {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const db = getDb();
  const id = parseInt(req.query.id as string);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

  if (req.method === "GET") {
    const { data, error } = await db.from("gn_appointments").select("*").eq("id", id).single();
    if (error || !data) return res.status(404).json({ error: "Appointment not found" });
    return res.json(toApiFormat(data));
  }

  if (req.method === "PUT") {
    const body = req.body;
    const updateData: Record<string, unknown> = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.time !== undefined) updateData.time = body.time;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.secret !== undefined) updateData.secret = body.secret;
    if (body.date) {
      const parsedDate = new Date(body.date);
      if (isNaN(parsedDate.getTime())) return res.status(400).json({ error: "Invalid date format" });
      updateData.date = parsedDate.toISOString();
    }

    const { data, error } = await db.from("gn_appointments").update(updateData).eq("id", id).select().single();
    if (error || !data) return res.status(404).json({ error: "Appointment not found" });
    return res.json(toApiFormat(data));
  }

  if (req.method === "DELETE") {
    const { error } = await db.from("gn_appointments").delete().eq("id", id);
    if (error) return res.status(500).json({ error: "Failed to delete appointment" });
    return res.json({ success: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
