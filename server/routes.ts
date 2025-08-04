import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertShipmentRequestSchema, updateShipmentRequestSchema, insertUserSchema } from "@shared/schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";

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
  app.get("/api/shipment-requests", authenticateToken, async (req, res) => {
    try {
      const { status, category, search, page, limit } = req.query;
      const result = await storage.getShipmentRequests({
        status: status as string,
        category: category as string,
        search: search as string,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });
      
      res.json(result);
    } catch (error) {
      console.error("Get requests error:", error);
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

  // Public route for shipment requests (no authentication required)
  app.post("/api/shipment-requests", async (req: any, res) => {
    try {
      // Check if this is a public request by looking at authorization header
      const authHeader = req.headers['authorization'];
      const isPublicRequest = authHeader === 'Bearer public-request';
      
      let requestData;
      
      if (isPublicRequest) {
        // For public requests, use default system user ID
        requestData = insertShipmentRequestSchema.parse({
          ...req.body,
          createdByUserId: req.body.createdByUserId || 1 // Default system user
        });
      } else {
        // For authenticated requests, verify token first
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
          
          requestData = insertShipmentRequestSchema.parse({
            ...req.body,
            createdByUserId: user.id
          });
        } catch (error) {
          return res.status(403).json({ message: 'Invalid token' });
        }
      }
      
      const request = await storage.createShipmentRequest(requestData);
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
      
      const request = await storage.updateShipmentRequest(id, updateData);
      if (!request) {
        return res.status(404).json({ message: "Request not found" });
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

  const httpServer = createServer(app);
  return httpServer;
}
