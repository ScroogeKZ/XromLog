import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertShipmentRequestSchema, publicInsertShipmentRequestSchema, updateShipmentRequestSchema, insertUserSchema } from "@shared/schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { telegramService } from "./telegram";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Middleware to verify JWT token
const authenticateToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await storage.getUser(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });
      
      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword
      });

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });
      
      res.status(201).json({
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role
        }
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: any, res) => {
    res.json({
      user: {
        id: req.user.id,
        username: req.user.username,
        role: req.user.role
      }
    });
  });

  // Shipment request routes
  app.get("/api/shipment-requests", authenticateToken, async (req: any, res) => {
    try {
      const user = req.user;
      const { status, category, search, page, limit } = req.query;
      
      // If user is employee (not manager), only show their own requests
      if (user.role === 'employee') {
        const requests = await storage.getShipmentRequestsByUserId(user.id);
        res.json({ requests, total: requests.length });
      } else {
        // Managers see all requests
        const result = await storage.getShipmentRequests({
          status: status as string,
          category: category as string,
          search: search as string,
          page: page ? parseInt(page as string) : undefined,
          limit: limit ? parseInt(limit as string) : undefined,
        });
        res.json(result);
      }
    } catch (error) {
      console.error("Get requests error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Public endpoint to track shipment by request number
  app.get("/api/shipment-requests/public/:requestNumber", async (req, res) => {
    try {
      const requestNumber = req.params.requestNumber;
      const request = await storage.getShipmentRequestByNumber(requestNumber);
      
      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }
      
      // Return only essential information for public tracking
      const publicRequest = {
        id: request.id,
        requestNumber: request.requestNumber,
        category: request.category,
        status: request.status,
        cargoName: request.cargoName,
        cargoWeightKg: request.cargoWeightKg,
        cargoVolumeM3: request.cargoVolumeM3,
        cargoDimensions: request.cargoDimensions,

        loadingAddress: request.loadingAddress,
        unloadingAddress: request.unloadingAddress,
        transportInfo: request.transportInfo,
        createdAt: request.createdAt,
        desiredShipmentDatetime: request.desiredShipmentDatetime
      };
      
      res.json(publicRequest);
    } catch (error) {
      console.error("Get public request error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Public POST endpoint for creating shipment requests (no authentication required)
  app.post("/api/shipment-requests/public", async (req, res) => {
    try {
      // Use the public schema for validation
      const publicData = publicInsertShipmentRequestSchema.parse(req.body);
      
      // Transform the data for storage
      const requestData = {
        category: publicData.category,
        cargoName: publicData.cargoName,
        cargoWeightKg: publicData.cargoWeightKg && String(publicData.cargoWeightKg).trim() !== "" ? String(publicData.cargoWeightKg) : null,
        cargoVolumeM3: publicData.cargoVolumeM3 && String(publicData.cargoVolumeM3).trim() !== "" ? String(publicData.cargoVolumeM3) : null,
        cargoDimensions: publicData.cargoDimensions || null,
        specialRequirements: publicData.specialRequirements || null,
        loadingCity: publicData.loadingCity || null,
        loadingAddress: publicData.loadingAddress,
        loadingContactPerson: publicData.loadingContactPerson || null,
        loadingContactPhone: publicData.loadingContactPhone || null,
        unloadingCity: publicData.unloadingCity || null,
        unloadingAddress: publicData.unloadingAddress,
        unloadingContactPerson: publicData.unloadingContactPerson || null,
        unloadingContactPhone: publicData.unloadingContactPhone || null,
        desiredShipmentDatetime: publicData.desiredShipmentDatetime && publicData.desiredShipmentDatetime.trim() !== "" 
          ? new Date(publicData.desiredShipmentDatetime) 
          : null,
        notes: publicData.notes || null,
        createdByUserId: 1 // Default system user for public requests
      };
      
      const request = await storage.createShipmentRequest(requestData);
      
      // Send Telegram notification for new request
      try {
        await telegramService.sendNewRequestNotification(request);
      } catch (error) {
        console.error("Failed to send Telegram notification:", error);
        // Don't fail the request if notification fails
      }
      
      res.status(201).json({
        requestNumber: request.requestNumber,
        message: "Заявка успешно создана"
      });
    } catch (error) {
      console.error("Create public request error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Ошибка валидации", 
          errors: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      res.status(500).json({ message: "Внутренняя ошибка сервера" });
    }
  });

  // Calendar endpoint for shipments with dates
  app.get("/api/shipment-requests/calendar", authenticateToken, async (req, res) => {
    try {
      const { start, end } = req.query;
      
      if (!start || !end) {
        return res.status(400).json({ message: "Start and end dates are required" });
      }

      const startDate = new Date(start as string);
      const endDate = new Date(end as string);
      
      const shipments = await storage.getShipmentRequestsByDateRange(startDate, endDate);
      
      res.json(shipments);
    } catch (error) {
      console.error("Get calendar shipments error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/shipment-requests/:id", authenticateToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const request = await storage.getShipmentRequestById(id);
      
      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }
      
      res.json(request);
    } catch (error) {
      console.error("Get request error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Personal cabinet - get user's own requests only
  app.get("/api/my-requests", authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const requests = await storage.getShipmentRequestsByUserId(userId);
      res.json({ requests });
    } catch (error) {
      console.error("Get my requests error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Public endpoint to get requests by phone number (for public users)
  app.post("/api/requests-by-phone", async (req, res) => {
    try {
      const { clientPhone } = req.body;
      
      if (!clientPhone) {
        return res.status(400).json({ message: "Номер телефона обязателен" });
      }
      
      const requests = await storage.getShipmentRequestsByClientPhone(clientPhone);
      
      // Return only public information for security
      const publicRequests = requests.map(request => ({
        id: request.id,
        requestNumber: request.requestNumber,
        category: request.category,
        status: request.status,
        cargoName: request.cargoName,
        cargoWeightKg: request.cargoWeightKg,
        cargoVolumeM3: request.cargoVolumeM3,
        loadingAddress: request.loadingAddress,
        unloadingAddress: request.unloadingAddress,
        loadingCity: request.loadingCity,
        unloadingCity: request.unloadingCity,
        desiredShipmentDatetime: request.desiredShipmentDatetime,
        createdAt: request.createdAt,
        priceKzt: request.priceKzt,
        transportInfo: request.transportInfo
      }));
      
      res.json({ requests: publicRequests });
    } catch (error) {
      console.error("Get requests by phone error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Protected route for shipment requests (authentication required)
  app.post("/api/shipment-requests", authenticateToken, async (req: any, res) => {
    try {
      const requestData = insertShipmentRequestSchema.parse({
        ...req.body,
        createdByUserId: req.user.id
      });
      
      const request = await storage.createShipmentRequest(requestData);
      
      // Send Telegram notification for new request
      try {
        await telegramService.sendNewRequestNotification(request);
      } catch (error) {
        console.error("Failed to send Telegram notification:", error);
      }
      
      res.status(201).json(request);
    } catch (error) {
      console.error("Create request error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/shipment-requests/:id", authenticateToken, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = updateShipmentRequestSchema.parse(req.body);
      
      // Convert number fields to strings for database storage
      const processedUpdateData = {
        ...updateData,
        cargoWeightKg: updateData.cargoWeightKg !== undefined && updateData.cargoWeightKg !== null 
          ? String(updateData.cargoWeightKg) : updateData.cargoWeightKg,
        cargoVolumeM3: updateData.cargoVolumeM3 !== undefined && updateData.cargoVolumeM3 !== null 
          ? String(updateData.cargoVolumeM3) : updateData.cargoVolumeM3,
        priceKzt: updateData.priceKzt !== undefined && updateData.priceKzt !== null 
          ? String(updateData.priceKzt) : updateData.priceKzt,
        desiredShipmentDatetime: updateData.desiredShipmentDatetime instanceof Date 
          ? updateData.desiredShipmentDatetime 
          : updateData.desiredShipmentDatetime && typeof updateData.desiredShipmentDatetime === 'string'
            ? new Date(updateData.desiredShipmentDatetime)
            : updateData.desiredShipmentDatetime
      };
      
      // Get the current request to track status changes
      const currentRequest = await storage.getShipmentRequestById(id);
      const oldStatus = currentRequest?.status;
      
      const request = await storage.updateShipmentRequest(id, processedUpdateData);
      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }
      
      // Send Telegram notification if status changed
      if (updateData.status && oldStatus && updateData.status !== oldStatus) {
        try {
          await telegramService.sendStatusUpdateNotification(request, oldStatus, updateData.status);
        } catch (error) {
          console.error("Failed to send Telegram status notification:", error);
        }
      }
      
      res.json(request);
    } catch (error) {
      console.error("Update request error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/shipment-requests/:id", authenticateToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteShipmentRequest(id);
      
      if (!success) {
        return res.status(404).json({ message: "Request not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Delete request error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/stats", authenticateToken, async (req, res) => {
    try {
      const stats = await storage.getShipmentRequestStats();
      res.json(stats);
    } catch (error) {
      console.error("Get stats error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/reports", authenticateToken, async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start date and end date are required" });
      }
      
      const requests = await storage.getShipmentRequestsByDateRange(
        new Date(startDate as string),
        new Date(endDate as string)
      );
      
      res.json(requests);
    } catch (error) {
      console.error("Get reports error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Test endpoint to check Telegram connection
  app.get("/api/telegram/test", authenticateToken, async (req, res) => {
    try {
      const isConnected = await telegramService.testConnection();
      res.json({ 
        connected: isConnected,
        message: isConnected ? "Telegram подключен успешно" : "Ошибка подключения к Telegram"
      });
    } catch (error) {
      console.error("Telegram test error:", error);
      res.status(500).json({ message: "Ошибка тестирования Telegram" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
