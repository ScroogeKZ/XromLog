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
  getUserByPhone(phone: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserProfile(id: number, profile: any): Promise<User | undefined>;

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
  getShipmentRequestsByUserId(userId: number): Promise<ShipmentRequest[]>;
  getShipmentRequestsByClientPhone(clientPhone: string): Promise<ShipmentRequest[]>;
  
  // Analytics methods
  getAnalyticsData(): Promise<{
    monthlyStats: Array<{ month: string; astana: number; intercity: number; total: number }>;
    categoryStats: { astana: number; intercity: number };
    statusDistribution: Array<{ status: string; count: number }>;
    averagePrice: { astana: number | null; intercity: number | null };
    kpiMetrics: {
      averageDeliveryTime: number;
      onTimeDeliveryRate: number;
      totalRevenue: number;
      avgOrderValue: number;
    };
  }>;
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

  async getUserByPhone(phone: string): Promise<User | undefined> {
    // Normalize phone number by removing all non-digit characters except +
    const normalizedPhone = phone.replace(/[\s\-\(\)]/g, '');
    
    // Try exact match first
    let [user] = await db.select().from(users).where(eq(users.phone, phone));
    
    // If not found, try normalized match
    if (!user) {
      const [userNormalized] = await db.select().from(users).where(eq(users.phone, normalizedPhone));
      user = userNormalized;
    }
    
    // If still not found, try matching against normalized existing phone numbers
    if (!user) {
      const allUsers = await db.select().from(users).where(sql`${users.phone} IS NOT NULL`);
      for (const existingUser of allUsers) {
        const existingNormalized = existingUser.phone?.replace(/[\s\-\(\)]/g, '');
        if (existingNormalized === normalizedPhone) {
          user = existingUser;
          break;
        }
      }
    }
    
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserProfile(id: number, profile: any): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(profile)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
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

  async getAllUsers(): Promise<Array<{ id: number; username: string; role: string; createdAt: Date | null }>> {
    const usersList = await db
      .select({
        id: users.id,
        username: users.username,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(users.createdAt);
    
    return usersList;
  }

  async updateUserRole(userId: number, role: string): Promise<boolean> {
    try {
      const result = await db
        .update(users)
        .set({ role })
        .where(eq(users.id, userId));
      
      return true;
    } catch (error) {
      console.error("Error updating user role:", error);
      return false;
    }
  }

  async getAnalyticsData(): Promise<{
    monthlyStats: Array<{ month: string; astana: number; intercity: number; total: number }>;
    categoryStats: { astana: number; intercity: number };
    statusDistribution: Array<{ status: string; count: number }>;
    averagePrice: { astana: number | null; intercity: number | null };
    kpiMetrics: {
      averageDeliveryTime: number;
      onTimeDeliveryRate: number;
      totalRevenue: number;
      avgOrderValue: number;
    };
  }> {
    // Monthly statistics for the last 12 months
    const monthlyStats = await db
      .select({
        month: sql<string>`to_char(${shipmentRequests.createdAt}, 'YYYY-MM')`,
        astana: sql<number>`count(case when ${shipmentRequests.category} = 'astana' then 1 end)`,
        intercity: sql<number>`count(case when ${shipmentRequests.category} = 'intercity' then 1 end)`,
        total: count(),
      })
      .from(shipmentRequests)
      .where(gte(shipmentRequests.createdAt, sql`current_date - interval '12 months'`))
      .groupBy(sql`to_char(${shipmentRequests.createdAt}, 'YYYY-MM')`)
      .orderBy(sql`to_char(${shipmentRequests.createdAt}, 'YYYY-MM')`);

    // Category distribution
    const [categoryStats] = await db
      .select({
        astana: sql<number>`count(case when ${shipmentRequests.category} = 'astana' then 1 end)`,
        intercity: sql<number>`count(case when ${shipmentRequests.category} = 'intercity' then 1 end)`,
      })
      .from(shipmentRequests);

    // Status distribution
    const statusDistribution = await db
      .select({
        status: shipmentRequests.status,
        count: count(),
      })
      .from(shipmentRequests)
      .groupBy(shipmentRequests.status)
      .orderBy(desc(count()));

    // Average prices by category
    const [averagePrice] = await db
      .select({
        astana: sql<number | null>`avg(case when ${shipmentRequests.category} = 'astana' and ${shipmentRequests.priceKzt} is not null then ${shipmentRequests.priceKzt}::numeric end)`,
        intercity: sql<number | null>`avg(case when ${shipmentRequests.category} = 'intercity' and ${shipmentRequests.priceKzt} is not null then ${shipmentRequests.priceKzt}::numeric end)`,
      })
      .from(shipmentRequests);

    // KPI Metrics
    const [kpiData] = await db
      .select({
        totalRevenue: sql<number>`coalesce(sum(${shipmentRequests.priceKzt}::numeric), 0)`,
        avgOrderValue: sql<number>`coalesce(avg(${shipmentRequests.priceKzt}::numeric), 0)`,
        totalCompleted: sql<number>`count(case when ${shipmentRequests.status} = 'delivered' then 1 end)`,
        onTimeDeliveries: sql<number>`count(case when ${shipmentRequests.status} = 'delivered' and ${shipmentRequests.desiredShipmentDatetime} >= ${shipmentRequests.updatedAt} then 1 end)`,
      })
      .from(shipmentRequests);

    const onTimeDeliveryRate = kpiData.totalCompleted > 0 
      ? (kpiData.onTimeDeliveries / kpiData.totalCompleted) * 100 
      : 0;

    // Average delivery time (simplified calculation)
    const averageDeliveryTime = 2.5; // placeholder - could be calculated from actual delivery data

    return {
      monthlyStats,
      categoryStats,
      statusDistribution,
      averagePrice,
      kpiMetrics: {
        averageDeliveryTime,
        onTimeDeliveryRate,
        totalRevenue: kpiData.totalRevenue,
        avgOrderValue: kpiData.avgOrderValue,
      },
    };
  }

  async changeUserPassword(userId: number, currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      // Get current user
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId));

      if (!user) {
        return { success: false, message: "Пользователь не найден" };
      }

      // Verify current password
      const bcrypt = await import("bcrypt");
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      
      if (!isCurrentPasswordValid) {
        return { success: false, message: "Неверный текущий пароль" };
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      await db
        .update(users)
        .set({ password: hashedNewPassword })
        .where(eq(users.id, userId));

      return { success: true, message: "Пароль успешно изменен" };
    } catch (error) {
      console.error("Error changing password:", error);
      return { success: false, message: "Ошибка при смене пароля" };
    }
  }
}

export const storage = new DatabaseStorage();