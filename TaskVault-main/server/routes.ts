import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import rateLimit from "express-rate-limit";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import { authService } from "./auth";
import { verifyEmailConfiguration } from "./email";
import {
  loginSchema,
  otpVerificationSchema,
  insertTaskSchema,
  insertUserSchema,
} from "@shared/schema";
import { z } from "zod";

// Extend session data interface
declare module "express-session" {
  interface SessionData {
    userId: number;
    email: string;
  }
}

// Session configuration
function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });

  return session({
    secret: process.env.SESSION_SECRET || "your-super-secret-session-key-change-in-production",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
    },
  });
}

// Rate limiting configurations
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: { message: "Too many authentication attempts, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

const otpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // 10 OTP attempts per window
  message: { message: "Too many OTP attempts, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: { message: "Too many requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

// Authentication middleware
function requireAuth(req: Request, res: Response, next: Function) {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

// Get client IP helper
function getClientIP(req: Request): string {
  return (req.headers['x-forwarded-for'] as string)?.split(',')[0] || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress || 
         'unknown';
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Trust proxy for rate limiting
  app.set("trust proxy", 1);

  // Session middleware
  app.use(getSession());

  // Apply rate limiting
  app.use('/api/auth', authLimiter);
  app.use('/api/otp', otpLimiter);
  app.use('/api', apiLimiter);

  // Verify email configuration on startup
  await verifyEmailConfiguration();

  // Auth routes
  app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const result = await authService.registerUser(
        userData.email,
        userData.password,
        userData.firstName || undefined,
        userData.lastName || undefined
      );
      res.json({ message: 'User registered successfully', user: result });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : 'Registration failed' 
      });
    }
  });

  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const loginData = loginSchema.parse(req.body);
      const result = await authService.initiateLogin(
        loginData,
        getClientIP(req),
        req.headers['user-agent']
      );
      res.json(result);
    } catch (error) {
      console.error('Login error:', error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : 'Login failed' 
      });
    }
  });

  app.post('/api/otp/verify', async (req: Request, res: Response) => {
    try {
      const otpData = otpVerificationSchema.parse(req.body);
      const result = await authService.verifyOTP(
        otpData,
        getClientIP(req),
        req.headers['user-agent']
      );
      
      // Set session
      req.session.userId = result.user.id;
      req.session.email = result.user.email;
      
      res.json({ message: 'Login successful', user: result.user });
    } catch (error) {
      console.error('OTP verification error:', error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : 'OTP verification failed' 
      });
    }
  });

  app.post('/api/otp/resend', async (req: Request, res: Response) => {
    try {
      const { email } = z.object({ email: z.string().email() }).parse(req.body);
      const result = await authService.resendOTP(
        email,
        getClientIP(req),
        req.headers['user-agent']
      );
      res.json(result);
    } catch (error) {
      console.error('OTP resend error:', error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : 'Failed to resend OTP' 
      });
    }
  });

  app.post('/api/auth/logout', requireAuth, async (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ message: 'Logout failed' });
      }
      res.json({ message: 'Logged out successfully' });
    });
  });

  app.get('/api/auth/user', requireAuth, async (req: Request, res: Response) => {
    try {
      const user = await authService.getUserProfile(req.session.userId!);
      res.json(user);
    } catch (error) {
      console.error('Get user error:', error);
      res.status(404).json({ 
        message: error instanceof Error ? error.message : 'User not found' 
      });
    }
  });

  // Task routes
  app.get('/api/tasks', requireAuth, async (req: Request, res: Response) => {
    try {
      const tasks = await storage.getTasks(req.session.userId!);
      res.json(tasks);
    } catch (error) {
      console.error('Get tasks error:', error);
      res.status(500).json({ message: 'Failed to fetch tasks' });
    }
  });

  app.post('/api/tasks', requireAuth, async (req: Request, res: Response) => {
    try {
      const taskData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask({
        ...taskData,
        userId: req.session.userId!,
      });
      res.json(task);
    } catch (error) {
      console.error('Create task error:', error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : 'Failed to create task' 
      });
    }
  });

  app.patch('/api/tasks/:id', requireAuth, async (req: Request, res: Response) => {
    try {
      const taskId = parseInt(req.params.id);
      const updates = z.object({
        description: z.string().optional(),
        isCompleted: z.boolean().optional(),
      }).parse(req.body);

      const task = await storage.updateTask(taskId, updates);
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }
      res.json(task);
    } catch (error) {
      console.error('Update task error:', error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : 'Failed to update task' 
      });
    }
  });

  app.delete('/api/tasks/:id', requireAuth, async (req: Request, res: Response) => {
    try {
      const taskId = parseInt(req.params.id);
      const deleted = await storage.deleteTask(taskId, req.session.userId!);
      if (!deleted) {
        return res.status(404).json({ message: 'Task not found' });
      }
      res.json({ message: 'Task deleted successfully' });
    } catch (error) {
      console.error('Delete task error:', error);
      res.status(500).json({ message: 'Failed to delete task' });
    }
  });

  // Analytics routes
  app.get('/api/analytics', requireAuth, async (req: Request, res: Response) => {
    try {
      const analytics = await storage.getTaskAnalytics(req.session.userId!);
      const completionRate = analytics.total > 0 
        ? Math.round((analytics.completed / analytics.total) * 100) 
        : 0;
      
      res.json({
        ...analytics,
        completionRate,
      });
    } catch (error) {
      console.error('Get analytics error:', error);
      res.status(500).json({ message: 'Failed to fetch analytics' });
    }
  });

  // Security routes
  app.get('/api/security/logs', requireAuth, async (req: Request, res: Response) => {
    try {
      const logs = await storage.getSecurityLogs(req.session.userId!, 20);
      res.json(logs);
    } catch (error) {
      console.error('Get security logs error:', error);
      res.status(500).json({ message: 'Failed to fetch security logs' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
