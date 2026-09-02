import express from 'express';
import { TicketController } from '../controllers/ticket.controller.js';

const router = express.Router();

// GET /categories
router.get('/', TicketController.getCategories);

export default router;
