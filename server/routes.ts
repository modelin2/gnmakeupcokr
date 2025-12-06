import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAppointmentSchema } from "@shared/schema";
import { z } from "zod";

const updateAppointmentSchema = insertAppointmentSchema.partial();

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // GET /api/appointments - list with optional filters
  app.get("/api/appointments", async (req, res) => {
    try {
      const { startDate, endDate, category, search } = req.query;
      const appointments = await storage.getAppointments({
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        category: category ? parseInt(category as string) : undefined,
        search: search as string | undefined,
      });
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch appointments" });
    }
  });

  // GET /api/appointments/:id - get single appointment
  app.get("/api/appointments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID" });
      }
      const appointment = await storage.getAppointment(id);
      if (!appointment) {
        return res.status(404).json({ error: "Appointment not found" });
      }
      res.json(appointment);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch appointment" });
    }
  });

  // POST /api/appointments - create appointment
  app.post("/api/appointments", async (req, res) => {
    try {
      if (!req.body.date || typeof req.body.date !== "string") {
        return res.status(400).json({ error: "date is required and must be a valid date string" });
      }
      const parsedDate = new Date(req.body.date);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({ error: "Invalid date format" });
      }
      const parsed = insertAppointmentSchema.safeParse({
        ...req.body,
        date: parsedDate,
      });
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors });
      }
      const appointment = await storage.createAppointment(parsed.data);
      res.status(201).json(appointment);
    } catch (error) {
      res.status(500).json({ error: "Failed to create appointment" });
    }
  });

  // PUT /api/appointments/:id - update appointment
  app.put("/api/appointments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID" });
      }
      const updateData = { ...req.body };
      if (req.body.date) {
        const parsedDate = new Date(req.body.date);
        if (isNaN(parsedDate.getTime())) {
          return res.status(400).json({ error: "Invalid date format" });
        }
        updateData.date = parsedDate;
      }
      const parsed = updateAppointmentSchema.safeParse(updateData);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors });
      }
      const appointment = await storage.updateAppointment(id, parsed.data);
      if (!appointment) {
        return res.status(404).json({ error: "Appointment not found" });
      }
      res.json(appointment);
    } catch (error) {
      res.status(500).json({ error: "Failed to update appointment" });
    }
  });

  // DELETE /api/appointments/:id - delete single appointment
  app.delete("/api/appointments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID" });
      }
      const deleted = await storage.deleteAppointment(id);
      if (!deleted) {
        return res.status(404).json({ error: "Appointment not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete appointment" });
    }
  });

  // DELETE /api/appointments - delete all appointments
  app.delete("/api/appointments", async (req, res) => {
    try {
      const count = await storage.deleteAllAppointments();
      res.json({ success: true, deletedCount: count });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete appointments" });
    }
  });

  // POST /api/appointments/import - import from SQL backup
  app.post("/api/appointments/import", async (req, res) => {
    try {
      const { sqlContent } = req.body;
      if (!sqlContent || typeof sqlContent !== "string") {
        return res.status(400).json({ error: "sqlContent is required" });
      }

      const result = parseSqlBackup(sqlContent);
      if (result.appointments.length === 0) {
        return res.status(400).json({ 
          error: "No valid appointments found in SQL content",
          skipped: result.skipped 
        });
      }

      const count = await storage.createAppointments(result.appointments);
      res.json({ success: true, importedCount: count, skipped: result.skipped });
    } catch (error) {
      res.status(500).json({ error: "Failed to import appointments" });
    }
  });

  return httpServer;
}

function parseSqlBackup(sqlContent: string) {
  const delimiter = "#TNT_QUERY_DELIMITER#";
  const queries = sqlContent.split(delimiter);
  const appointments: Array<{
    name: string;
    category: number;
    date: Date;
    time: string;
    phone?: string;
    notes?: string;
    secret?: boolean;
    originalNo?: number;
  }> = [];
  let skipped = 0;

  for (const query of queries) {
    const trimmed = query.trim();
    if (!trimmed.toLowerCase().startsWith("insert into a_tn2_makeupday3_list")) {
      continue;
    }

    const fields: Record<string, string> = {};
    const setMatch = trimmed.match(/set\s+(.+)$/i);
    if (!setMatch) {
      skipped++;
      continue;
    }

    const setPart = setMatch[1];
    const fieldRegex = /(\w+)\s*=\s*'([^']*)'/g;
    let match;
    while ((match = fieldRegex.exec(setPart)) !== null) {
      fields[match[1]] = match[2];
    }

    if (!fields.name) {
      skipped++;
      continue;
    }

    const year = parseInt(fields.user_add21);
    const month = parseInt(fields.user_add22);
    const day = parseInt(fields.user_add23);

    if (isNaN(year) || isNaN(month) || isNaN(day)) {
      skipped++;
      continue;
    }

    const date = new Date(year, month - 1, day);
    if (isNaN(date.getTime())) {
      skipped++;
      continue;
    }

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

  return { appointments, skipped };
}
