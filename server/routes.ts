import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertApplicationSchema, 
  insertUserSchema, 
  insertTransactionSchema,
  insertAuditSchema,
  insertAlertSchema,
  insertNotificationSchema,
  insertActivityLogSchema
} from "@shared/schema";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes prefix
  const api = express.Router();
  app.use("/api", api);

  // Health check
  api.get("/health", (req: Request, res: Response) => {
    res.json({ status: "ok" });
  });

  // Auth endpoints
  api.post("/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password, role } = req.body;
      
      if (!username || !password || !role) {
        return res.status(400).json({ message: "Username, password and role are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // In a real app, we would hash passwords, but for this demo we'll check them directly
      if (user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      if (user.role !== role) {
        return res.status(403).json({ message: "Invalid role for this user" });
      }
      
      // Set user in session
      req.session.user = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        fullName: user.fullName
      };
      
      return res.json({ 
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          fullName: user.fullName
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  api.post("/auth/logout", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  api.get("/auth/me", (req: Request, res: Response) => {
    if (!req.session.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    return res.json({ user: req.session.user });
  });

  // Application submission
  api.post("/applications", async (req: Request, res: Response) => {
    try {
      const applicationData = insertApplicationSchema.parse(req.body);
      const application = await storage.createApplication(applicationData);
      
      // Log activity
      await storage.createActivityLog({
        action: "create_application",
        details: { applicationId: application.id },
        ipAddress: req.ip || "",
        userAgent: req.headers["user-agent"] || ""
      });
      
      return res.status(201).json({ application });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error("Application submission error:", error);
      return res.status(500).json({ message: "Failed to submit application" });
    }
  });

  // Get all applications (admin only)
  api.get("/applications", async (req: Request, res: Response) => {
    try {
      if (!req.session.user || !["admin", "bank"].includes(req.session.user.role)) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const applications = await storage.getAllApplications();
      return res.json({ applications });
    } catch (error) {
      console.error("Get applications error:", error);
      return res.status(500).json({ message: "Failed to retrieve applications" });
    }
  });

  // Review application (admin/bank officer only)
  api.patch("/applications/:id", async (req: Request, res: Response) => {
    try {
      if (!req.session.user || !["admin", "bank"].includes(req.session.user.role)) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const { id } = req.params;
      const { status, notes } = req.body;
      
      if (!status || !["approved", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Valid status (approved/rejected) is required" });
      }
      
      const application = await storage.updateApplicationStatus(
        parseInt(id),
        status,
        notes || "",
        req.session.user.id
      );
      
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      
      // Log activity
      await storage.createActivityLog({
        userId: req.session.user.id,
        action: `${status}_application`,
        details: { applicationId: parseInt(id) },
        ipAddress: req.ip || "",
        userAgent: req.headers["user-agent"] || ""
      });
      
      return res.json({ application });
    } catch (error) {
      console.error("Review application error:", error);
      return res.status(500).json({ message: "Failed to update application" });
    }
  });

  // Get CSPs
  api.get("/csps", async (req: Request, res: Response) => {
    try {
      if (!req.session.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const csps = await storage.getAllCSPs();
      return res.json({ csps });
    } catch (error) {
      console.error("Get CSPs error:", error);
      return res.status(500).json({ message: "Failed to retrieve CSPs" });
    }
  });

  // Get single CSP
  api.get("/csps/:id", async (req: Request, res: Response) => {
    try {
      if (!req.session.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const { id } = req.params;
      const csp = await storage.getCSP(parseInt(id));
      
      if (!csp) {
        return res.status(404).json({ message: "CSP not found" });
      }
      
      return res.json({ csp });
    } catch (error) {
      console.error("Get CSP error:", error);
      return res.status(500).json({ message: "Failed to retrieve CSP" });
    }
  });

  // Get transactions
  api.get("/transactions", async (req: Request, res: Response) => {
    try {
      if (!req.session.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // CSP agents can only see their own transactions
      if (req.session.user.role === "csp") {
        const csp = await storage.getCSPByUserId(req.session.user.id);
        if (!csp) {
          return res.json({ transactions: [] });
        }
        
        const transactions = await storage.getTransactionsByCSPId(csp.id);
        return res.json({ transactions });
      }
      
      // Other roles can see all transactions
      const transactions = await storage.getAllTransactions();
      return res.json({ transactions });
    } catch (error) {
      console.error("Get transactions error:", error);
      return res.status(500).json({ message: "Failed to retrieve transactions" });
    }
  });

  // Create transaction
  api.post("/transactions", async (req: Request, res: Response) => {
    try {
      if (!req.session.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const transactionData = insertTransactionSchema.parse(req.body);
      
      // Only CSP can create transactions
      if (req.session.user.role === "csp") {
        const csp = await storage.getCSPByUserId(req.session.user.id);
        if (!csp) {
          return res.status(403).json({ message: "No CSP profile found for this user" });
        }
        
        // Ensure the transaction is for this CSP
        if (transactionData.cspId !== csp.id) {
          return res.status(403).json({ message: "Cannot create transactions for other CSPs" });
        }
      }
      
      const transaction = await storage.createTransaction(transactionData);
      
      // Log activity
      await storage.createActivityLog({
        userId: req.session.user.id,
        action: "create_transaction",
        details: { transactionId: transaction.id, amount: transaction.amount, type: transaction.type },
        ipAddress: req.ip || "",
        userAgent: req.headers["user-agent"] || ""
      });
      
      return res.status(201).json({ transaction });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error("Create transaction error:", error);
      return res.status(500).json({ message: "Failed to create transaction" });
    }
  });

  // Get audits
  api.get("/audits", async (req: Request, res: Response) => {
    try {
      if (!req.session.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // Auditors can only see their assigned audits
      if (req.session.user.role === "auditor") {
        const audits = await storage.getAuditsByAuditorId(req.session.user.id);
        return res.json({ audits });
      }
      
      // CSPs can only see audits of their outlet
      if (req.session.user.role === "csp") {
        const csp = await storage.getCSPByUserId(req.session.user.id);
        if (!csp) {
          return res.json({ audits: [] });
        }
        
        const audits = await storage.getAuditsByCSPId(csp.id);
        return res.json({ audits });
      }
      
      // Admin and Bank Officers can see all audits
      const audits = await storage.getAllAudits();
      return res.json({ audits });
    } catch (error) {
      console.error("Get audits error:", error);
      return res.status(500).json({ message: "Failed to retrieve audits" });
    }
  });

  // Create audit assignment
  api.post("/audits", async (req: Request, res: Response) => {
    try {
      if (!req.session.user || !["admin", "bank"].includes(req.session.user.role)) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const auditData = insertAuditSchema.parse(req.body);
      const audit = await storage.createAudit(auditData);
      
      // Log activity
      await storage.createActivityLog({
        userId: req.session.user.id,
        action: "create_audit",
        details: { auditId: audit.id, cspId: audit.cspId, auditorId: audit.auditorId },
        ipAddress: req.ip || "",
        userAgent: req.headers["user-agent"] || ""
      });
      
      // Create notification for auditor
      await storage.createNotification({
        userId: audit.auditorId,
        title: "New Audit Assignment",
        message: `You have been assigned a new audit scheduled for ${new Date(audit.scheduledDate).toLocaleDateString()}`,
        type: "system"
      });
      
      return res.status(201).json({ audit });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error("Create audit error:", error);
      return res.status(500).json({ message: "Failed to create audit" });
    }
  });

  // Update audit (for auditors to complete)
  api.patch("/audits/:id", async (req: Request, res: Response) => {
    try {
      if (!req.session.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const { id } = req.params;
      const auditId = parseInt(id);
      const { status, notes, photos, videos, location, rating, issues } = req.body;
      
      // Verify the audit exists and belongs to this auditor (if auditor role)
      const audit = await storage.getAudit(auditId);
      
      if (!audit) {
        return res.status(404).json({ message: "Audit not found" });
      }
      
      if (req.session.user.role === "auditor" && audit.auditorId !== req.session.user.id) {
        return res.status(403).json({ message: "Cannot update audits assigned to other auditors" });
      }
      
      // Update the audit
      const updatedAudit = await storage.updateAudit(auditId, {
        status,
        notes,
        photos,
        videos,
        location,
        rating,
        issues,
        completedDate: status === "completed" ? new Date() : undefined
      });
      
      // Log activity
      await storage.createActivityLog({
        userId: req.session.user.id,
        action: "update_audit",
        details: { auditId, status },
        ipAddress: req.ip || "",
        userAgent: req.headers["user-agent"] || ""
      });
      
      // Notify admin if audit is completed
      if (status === "completed") {
        const admins = await storage.getUsersByRole("admin");
        for (const admin of admins) {
          await storage.createNotification({
            userId: admin.id,
            title: "Audit Completed",
            message: `Audit #${auditId} has been completed by ${req.session.user.fullName}`,
            type: "system"
          });
        }
      }
      
      return res.json({ audit: updatedAudit });
    } catch (error) {
      console.error("Update audit error:", error);
      return res.status(500).json({ message: "Failed to update audit" });
    }
  });

  // Get alerts
  api.get("/alerts", async (req: Request, res: Response) => {
    try {
      if (!req.session.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // CSPs can only see their own alerts
      if (req.session.user.role === "csp") {
        const csp = await storage.getCSPByUserId(req.session.user.id);
        if (!csp) {
          return res.json({ alerts: [] });
        }
        
        const alerts = await storage.getAlertsByCSPId(csp.id);
        return res.json({ alerts });
      }
      
      // Other roles see all alerts
      const alerts = await storage.getAllAlerts();
      return res.json({ alerts });
    } catch (error) {
      console.error("Get alerts error:", error);
      return res.status(500).json({ message: "Failed to retrieve alerts" });
    }
  });

  // Create alert
  api.post("/alerts", async (req: Request, res: Response) => {
    try {
      if (!req.session.user || !["admin", "bank", "fi"].includes(req.session.user.role)) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const alertData = insertAlertSchema.parse(req.body);
      const alert = await storage.createAlert(alertData);
      
      // Log activity
      await storage.createActivityLog({
        userId: req.session.user.id,
        action: "create_alert",
        details: { alertId: alert.id, type: alert.type, severity: alert.severity },
        ipAddress: req.ip || "",
        userAgent: req.headers["user-agent"] || ""
      });
      
      // Notify the CSP
      if (alert.cspId) {
        const csp = await storage.getCSP(alert.cspId);
        if (csp && csp.userId) {
          await storage.createNotification({
            userId: csp.userId,
            title: `New ${alert.severity.toUpperCase()} Alert`,
            message: alert.message,
            type: "system"
          });
        }
      }
      
      return res.status(201).json({ alert });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error("Create alert error:", error);
      return res.status(500).json({ message: "Failed to create alert" });
    }
  });

  // Update alert status
  api.patch("/alerts/:id", async (req: Request, res: Response) => {
    try {
      if (!req.session.user || !["admin", "bank", "fi"].includes(req.session.user.role)) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const { id } = req.params;
      const alertId = parseInt(id);
      const { status } = req.body;
      
      if (!status || !["acknowledged", "resolved", "false_positive"].includes(status)) {
        return res.status(400).json({ message: "Valid status is required" });
      }
      
      const alert = await storage.updateAlertStatus(
        alertId,
        status,
        req.session.user.id
      );
      
      if (!alert) {
        return res.status(404).json({ message: "Alert not found" });
      }
      
      // Log activity
      await storage.createActivityLog({
        userId: req.session.user.id,
        action: "update_alert",
        details: { alertId, status },
        ipAddress: req.ip || "",
        userAgent: req.headers["user-agent"] || ""
      });
      
      return res.json({ alert });
    } catch (error) {
      console.error("Update alert error:", error);
      return res.status(500).json({ message: "Failed to update alert" });
    }
  });

  // Get notifications
  api.get("/notifications", async (req: Request, res: Response) => {
    try {
      if (!req.session.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const notifications = await storage.getNotificationsByUserId(req.session.user.id);
      return res.json({ notifications });
    } catch (error) {
      console.error("Get notifications error:", error);
      return res.status(500).json({ message: "Failed to retrieve notifications" });
    }
  });

  // Mark notification as read
  api.patch("/notifications/:id", async (req: Request, res: Response) => {
    try {
      if (!req.session.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const { id } = req.params;
      const notificationId = parseInt(id);
      
      const notification = await storage.getNotification(notificationId);
      
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      
      if (notification.userId !== req.session.user.id) {
        return res.status(403).json({ message: "Cannot mark other users' notifications as read" });
      }
      
      const updatedNotification = await storage.markNotificationAsRead(notificationId);
      
      return res.json({ notification: updatedNotification });
    } catch (error) {
      console.error("Mark notification as read error:", error);
      return res.status(500).json({ message: "Failed to update notification" });
    }
  });

  // Get activity logs (admin/bank only)
  api.get("/activity-logs", async (req: Request, res: Response) => {
    try {
      if (!req.session.user || !["admin", "bank"].includes(req.session.user.role)) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const activityLogs = await storage.getAllActivityLogs();
      return res.json({ activityLogs });
    } catch (error) {
      console.error("Get activity logs error:", error);
      return res.status(500).json({ message: "Failed to retrieve activity logs" });
    }
  });

  // Get users (admin only)
  api.get("/users", async (req: Request, res: Response) => {
    try {
      if (!req.session.user || req.session.user.role !== "admin") {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const users = await storage.getAllUsers();
      return res.json({ users });
    } catch (error) {
      console.error("Get users error:", error);
      return res.status(500).json({ message: "Failed to retrieve users" });
    }
  });

  // Create user (admin only)
  api.post("/users", async (req: Request, res: Response) => {
    try {
      if (!req.session.user || req.session.user.role !== "admin") {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username or email already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }
      
      const user = await storage.createUser(userData);
      
      // Log activity
      await storage.createActivityLog({
        userId: req.session.user.id,
        action: "create_user",
        details: { newUserId: user.id, role: user.role },
        ipAddress: req.ip || "",
        userAgent: req.headers["user-agent"] || ""
      });
      
      return res.status(201).json({ 
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          fullName: user.fullName,
          status: user.status
        } 
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error("Create user error:", error);
      return res.status(500).json({ message: "Failed to create user" });
    }
  });

  // Update user status (admin only)
  api.patch("/users/:id", async (req: Request, res: Response) => {
    try {
      if (!req.session.user || req.session.user.role !== "admin") {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const { id } = req.params;
      const userId = parseInt(id);
      const { status } = req.body;
      
      if (!status || !["active", "inactive", "suspended"].includes(status)) {
        return res.status(400).json({ message: "Valid status is required" });
      }
      
      const user = await storage.updateUserStatus(userId, status);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Log activity
      await storage.createActivityLog({
        userId: req.session.user.id,
        action: "update_user_status",
        details: { targetUserId: userId, status },
        ipAddress: req.ip || "",
        userAgent: req.headers["user-agent"] || ""
      });
      
      return res.json({ 
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          fullName: user.fullName,
          status: user.status
        } 
      });
    } catch (error) {
      console.error("Update user status error:", error);
      return res.status(500).json({ message: "Failed to update user status" });
    }
  });

  // Export data (admin/bank only)
  api.get("/export/:type", async (req: Request, res: Response) => {
    try {
      if (!req.session.user || !["admin", "bank"].includes(req.session.user.role)) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const { type } = req.params;
      let data: any[] = [];
      
      switch (type) {
        case "csps":
          data = await storage.getAllCSPs();
          break;
        case "transactions":
          data = await storage.getAllTransactions();
          break;
        case "audits":
          data = await storage.getAllAudits();
          break;
        case "alerts":
          data = await storage.getAllAlerts();
          break;
        case "applications":
          data = await storage.getAllApplications();
          break;
        case "users":
          if (req.session.user.role !== "admin") {
            return res.status(403).json({ message: "Unauthorized" });
          }
          data = await storage.getAllUsers();
          break;
        default:
          return res.status(400).json({ message: "Invalid export type" });
      }
      
      // Log activity
      await storage.createActivityLog({
        userId: req.session.user.id,
        action: "export_data",
        details: { type, count: data.length },
        ipAddress: req.ip || "",
        userAgent: req.headers["user-agent"] || ""
      });
      
      return res.json({ data });
    } catch (error) {
      console.error("Export data error:", error);
      return res.status(500).json({ message: "Failed to export data" });
    }
  });

  // Create the HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
