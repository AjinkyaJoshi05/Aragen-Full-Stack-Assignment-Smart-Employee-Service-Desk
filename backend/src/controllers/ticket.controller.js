import { TicketService } from '../services/ticket.service.js';

/**
 * Controller handling HTTP requests for Tickets
 */
export class TicketController {
  /**
   * POST /tickets
   * Create a new ticket
   */
  static async createTicket(req, res, next) {
    try {
      const { title, description, category, priority, createdByUserId } = req.body;

      const ticket = await TicketService.createTicket({
        title,
        description,
        category,
        priority,
        createdByUserId: createdByUserId ? parseInt(createdByUserId, 10) : null
      });

      return res.status(201).json({
        success: true,
        message: 'Ticket created successfully',
        data: ticket
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /tickets
   * Retrieve all tickets with optional filtering
   */
  static async getTickets(req, res, next) {
    try {
      const { category, status, priority, search } = req.query;

      const tickets = await TicketService.getAllTickets({
        category,
        status,
        priority,
        search
      });

      return res.status(200).json({
        success: true,
        count: tickets.length,
        data: tickets
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /tickets/:id
   * Retrieve single ticket details
   */
  static async getTicketById(req, res, next) {
    try {
      const ticketId = parseInt(req.params.id, 10);
      const ticket = await TicketService.getTicketById(ticketId);

      if (!ticket) {
        return res.status(404).json({
          success: false,
          message: `Ticket with ID ${ticketId} not found`
        });
      }

      return res.status(200).json({
        success: true,
        data: ticket
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /tickets/:id
   * Update ticket fields
   */
  static async updateTicket(req, res, next) {
    try {
      const ticketId = parseInt(req.params.id, 10);
      const { title, description, category, priority, status, assignedToUserId, notes } = req.body;

      const updatedTicket = await TicketService.updateTicket(ticketId, {
        title,
        description,
        category,
        priority,
        status,
        assignedToUserId: assignedToUserId ? parseInt(assignedToUserId, 10) : undefined,
        notes
      });

      if (!updatedTicket) {
        return res.status(404).json({
          success: false,
          message: `Ticket with ID ${ticketId} not found`
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Ticket updated successfully',
        data: updatedTicket
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /tickets/:id/close
   * Close a ticket directly
   */
  static async closeTicket(req, res, next) {
    try {
      const ticketId = parseInt(req.params.id, 10);
      const { notes } = req.body || {};

      const closedTicket = await TicketService.closeTicket(ticketId, notes);

      if (!closedTicket) {
        return res.status(404).json({
          success: false,
          message: `Ticket with ID ${ticketId} not found`
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Ticket closed successfully',
        data: closedTicket
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /categories
   * Fetch categories list
   */
  static async getCategories(req, res, next) {
    try {
      const categories = await TicketService.getCategories();
      return res.status(200).json({
        success: true,
        data: categories
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /dashboard/summary
   * Fetch aggregate reporting summary
   */
  static async getDashboardSummary(req, res, next) {
    try {
      const summary = await TicketService.getDashboardSummary();
      return res.status(200).json({
        success: true,
        data: summary
      });
    } catch (error) {
      next(error);
    }
  }
}
