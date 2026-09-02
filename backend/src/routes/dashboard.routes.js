import express from 'express';
import { TicketController } from '../controllers/ticket.controller.js';

const router = express.Router();

// GET /dashboard/summary
router.get('/summary', TicketController.getDashboardSummary);

export default router;
