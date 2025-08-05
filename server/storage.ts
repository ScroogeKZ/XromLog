import { 
  users, 
  shipmentRequests,
  type User, 
  type InsertUser,
  type ShipmentRequest,
  type InsertShipmentRequest,
  type UpdateShipmentRequest
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, ilike, count, gte, lte, sql } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Shipment request methods
  getShipmentRequests(filters?: {
    status?: string;
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ requests: ShipmentRequest[]; total: number }>;
  getShipmentRequestById(id: number): Promise<ShipmentRequest | undefined>;
  getShipmentRequestByNumber(requestNumber: string): Promise<ShipmentRequest | undefined>;
  createShipmentRequest(request: InsertShipmentRequest): Promise<ShipmentRequest>;
  updateShipmentRequest(id: number, request: UpdateShipmentRequest): Promise<ShipmentRequest | undefined>;
  deleteShipmentRequest(id: number): Promise<boolean>;
  getShipmentRequestStats(): Promise<{
    total: number;
    processing: number;
    transit: number;
    delivered: number;
  }>;
  getShipmentRequestsByDateRange(startDate: Date, endDate: Date): Promise<ShipmentRequest[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getShipmentRequests(filters: {
    status?: string;
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{ requests: ShipmentRequest[]; total: number }> {
    const { status, category, search, page = 1, limit = 10 } = filters;
    const offset = (page - 1) * limit;

    let whereConditions = [];

    if (status) {
      whereConditions.push(eq(shipmentRequests.status, status));
    }
    
    if (category) {
      whereConditions.push(eq(shipmentRequests.category, category));
    }

    if (search) {
      whereConditions.push(
        or(
          ilike(shipmentRequests.requestNumber, `%${search}%`),
          ilike(shipmentRequests.cargoName, `%${search}%`),
          ilike(shipmentRequests.loadingAddress, `%${search}%`),
          ilike(shipmentRequests.unloadingAddress, `%${search}%`)
        )
      );
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const [requests, totalResult] = await Promise.all([
      db
        .select()
        .from(shipmentRequests)
        .where(whereClause)
        .orderBy(desc(shipmentRequests.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: count() })
        .from(shipmentRequests)
        .where(whereClause)
    ]);

    return {
      requests,
      total: totalResult[0].count
    };
  }

  async getShipmentRequestById(id: number): Promise<ShipmentRequest | undefined> {
    const [request] = await db
      .select()
      .from(shipmentRequests)
      .where(eq(shipmentRequests.id, id));
    return request || undefined;
  }

  async getShipmentRequestByNumber(requestNumber: string): Promise<ShipmentRequest | undefined> {
    const [request] = await db
      .select()
      .from(shipmentRequests)
      .where(eq(shipmentRequests.requestNumber, requestNumber));
    return request || undefined;
  }

  async getShipmentRequestsByUserId(userId: number): Promise<ShipmentRequest[]> {
    const requests = await db
      .select()
      .from(shipmentRequests)
      .where(eq(shipmentRequests.createdByUserId, userId))
      .orderBy(desc(shipmentRequests.createdAt));
    return requests;
  }

  async getShipmentRequestsByClientPhone(clientPhone: string): Promise<ShipmentRequest[]> {
    const requests = await db
      .select()
      .from(shipmentRequests)
      .where(eq(shipmentRequests.clientPhone, clientPhone))
      .orderBy(desc(shipmentRequests.createdAt));
    return requests;
  }

  async createShipmentRequest(insertRequest: InsertShipmentRequest): Promise<ShipmentRequest> {
    // Generate request number
    const now = new Date();
    const year = now.getFullYear();
    const prefix = insertRequest.category === 'astana' ? 'AST' : 'INT';
    
    // Get the count of requests this year for this category
    const existingCount = await db
      .select({ count: count() })
      .from(shipmentRequests)
      .where(
        and(
          eq(shipmentRequests.category, insertRequest.category),
          ilike(shipmentRequests.requestNumber, `${prefix}-${year}-%`)
        )
      );

    const nextNumber = (existingCount[0].count + 1).toString().padStart(3, '0');
    const requestNumber = `${prefix}-${year}-${nextNumber}`;

    const [request] = await db
      .insert(shipmentRequests)
      .values({
        ...insertRequest,
        requestNumber,
        updatedAt: new Date(),
      })
      .returning();
    return request;
  }

  async updateShipmentRequest(id: number, updateRequest: any): Promise<ShipmentRequest | undefined> {
    const [request] = await db
      .update(shipmentRequests)
      .set({
        ...updateRequest,
        updatedAt: new Date(),
      })
      .where(eq(shipmentRequests.id, id))
      .returning();
    return request || undefined;
  }

  async deleteShipmentRequest(id: number): Promise<boolean> {
    const result = await db
      .delete(shipmentRequests)
      .where(eq(shipmentRequests.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getShipmentRequestStats(): Promise<{
    total: number;
    processing: number;
    transit: number;
    delivered: number;
  }> {
    const [stats] = await db
      .select({
        total: count(),
        processing: sql<number>`count(case when ${shipmentRequests.status} = 'processing' then 1 end)`,
        transit: sql<number>`count(case when ${shipmentRequests.status} = 'transit' then 1 end)`,
        delivered: sql<number>`count(case when ${shipmentRequests.status} = 'delivered' then 1 end)`,
      })
      .from(shipmentRequests);

    return {
      total: stats.total,
      processing: stats.processing,
      transit: stats.transit,
      delivered: stats.delivered,
    };
  }

  async getShipmentRequestsByDateRange(startDate: Date, endDate: Date): Promise<ShipmentRequest[]> {
    return await db
      .select()
      .from(shipmentRequests)
      .where(
        and(
          gte(shipmentRequests.desiredShipmentDatetime, startDate),
          lte(shipmentRequests.desiredShipmentDatetime, endDate)
        )
      )
      .orderBy(desc(shipmentRequests.desiredShipmentDatetime));
  }
}

export const storage = new DatabaseStorage();
