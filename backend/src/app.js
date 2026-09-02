import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import healthRoutes from './routes/health.routes.js';
import ticketRoutes from './routes/ticket.routes.js';
import categoryRoutes from './routes/category.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import userRoutes from './routes/user.routes.js';
import errorHandler from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

const app = express();

// Basic Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoints
app.use('/health', healthRoutes);
app.use('/api/health', healthRoutes);

// Ticket Management Endpoints (Supports both root & /api prefixes)
app.use('/tickets', ticketRoutes);
app.use('/api/tickets', ticketRoutes);

// Categories Endpoints
app.use('/categories', categoryRoutes);
app.use('/api/categories', categoryRoutes);

// Dashboard Endpoints
app.use('/dashboard', dashboardRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Users Endpoints (for ticket assignment dropdown)
app.use('/users', userRoutes);
app.use('/api/users', userRoutes);

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Smart Employee Service Desk & Ticket Management API'
  });
});

// 404 Handler for unregistered routes
app.use((req, res, next) => {
  const error = new Error(`Route Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

// Centralized Error Handler
app.use(errorHandler);

export default app;
