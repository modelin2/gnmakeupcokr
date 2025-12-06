import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const appointments = pgTable("appointments", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  category: integer("category").notNull().default(1),
  date: timestamp("date").notNull(),
  time: text("time").notNull(),
  phone: text("phone"),
  notes: text("notes"),
  secret: boolean("secret").default(false),
  originalNo: integer("original_no"),
});

export const insertAppointmentSchema = z.object({
  name: z.string(),
  category: z.number().default(1),
  date: z.date(),
  time: z.string(),
  phone: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  secret: z.boolean().optional().default(false),
  originalNo: z.number().optional().nullable(),
});

export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointments.$inferSelect;
