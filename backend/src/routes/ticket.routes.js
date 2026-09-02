import express from 'express';
import { TicketController } from '../controllers/ticket.controller.js';
import { validateCreateTicket, validateUpdateTicket, validateIdParam } from '../middleware/validate.js';

const router = express.Router();

// POST /tickets - Create ticket
router.post('/', validateCreateTicket, TicketController.createTicket);

// GET /tickets - List all tickets
router.get('/', TicketController.getTickets);

// GET /tickets/:id - Get ticket by ID
router.get('/:id', validateIdParam, TicketController.getTicketById);

// PUT /tickets/:id - Update ticket
router.put('/:id', validateIdParam, validateUpdateTicket, TicketController.updateTicket);

// PUT /tickets/:id/close - Close ticket
router.put('/:id/close', validateIdParam, TicketController.closeTicket);

export default router;
