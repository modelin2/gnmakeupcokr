import { db } from "./db";
import { appointments, users } from "@shared/schema";
import { eq, and, gte, lte, ilike, or, desc } from "drizzle-orm";
import type { InsertAppointment, Appointment, InsertUser, User } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getAppointments(filters?: {
    startDate?: Date;
    endDate?: Date;
    category?: number;
    search?: string;
  }): Promise<Appointment[]>;
  getAppointment(id: number): Promise<Appointment | undefined>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  createAppointments(appointments: InsertAppointment[]): Promise<number>;
  updateAppointment(id: number, appointment: Partial<InsertAppointment>): Promise<Appointment | undefined>;
  deleteAppointment(id: number): Promise<boolean>;
  deleteAllAppointments(): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const result = await db.insert(users).values({ ...insertUser, id }).returning();
    return result[0];
  }

  async getAppointments(filters?: {
    startDate?: Date;
    endDate?: Date;
    category?: number;
    search?: string;
  }): Promise<Appointment[]> {
    const conditions = [];

    if (filters?.startDate) {
      conditions.push(gte(appointments.date, filters.startDate));
    }
    if (filters?.endDate) {
      conditions.push(lte(appointments.date, filters.endDate));
    }
    if (filters?.category) {
      conditions.push(eq(appointments.category, filters.category));
    }
    if (filters?.search) {
      conditions.push(
        or(
          ilike(appointments.name, `%${filters.search}%`),
          ilike(appointments.phone, `%${filters.search}%`),
          ilike(appointments.notes, `%${filters.search}%`)
        )
      );
    }

    if (conditions.length > 0) {
      return db.select().from(appointments).where(and(...conditions)).orderBy(desc(appointments.date));
    }
    
    return db.select().from(appointments).orderBy(desc(appointments.date));
  }

  async getAppointment(id: number): Promise<Appointment | undefined> {
    const result = await db.select().from(appointments).where(eq(appointments.id, id)).limit(1);
    return result[0];
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const result = await db.insert(appointments).values(appointment).returning();
    return result[0];
  }

  async createAppointments(appointmentList: InsertAppointment[]): Promise<number> {
    if (appointmentList.length === 0) return 0;
    
    const batchSize = 100;
    let insertedCount = 0;
    
    for (let i = 0; i < appointmentList.length; i += batchSize) {
      const batch = appointmentList.slice(i, i + batchSize);
      await db.insert(appointments).values(batch);
      insertedCount += batch.length;
    }
    
    return insertedCount;
  }

  async updateAppointment(id: number, appointment: Partial<InsertAppointment>): Promise<Appointment | undefined> {
    const result = await db.update(appointments).set(appointment).where(eq(appointments.id, id)).returning();
    return result[0];
  }

  async deleteAppointment(id: number): Promise<boolean> {
    const result = await db.delete(appointments).where(eq(appointments.id, id)).returning();
    return result.length > 0;
  }

  async deleteAllAppointments(): Promise<number> {
    const result = await db.delete(appointments).returning();
    return result.length;
  }
}

export const storage = new DatabaseStorage();
