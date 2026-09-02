import { getPool, mssql } from '../config/db.js';

/**
 * Service handling database operations for Tickets
 */
export class TicketService {
  /**
   * Create a new support ticket
   */
  static async createTicket({ title, description, category, priority, createdByUserId = null }) {
    const pool = await getPool();
    const result = await pool.request()
      .input('title', mssql.NVarChar(200), title.trim())
      .input('description', mssql.NVarChar(mssql.MAX), description.trim())
      .input('category', mssql.NVarChar(50), category.trim())
      .input('priority', mssql.NVarChar(20), priority)
      .input('status', mssql.NVarChar(20), 'Open')
      .input('createdByUserId', mssql.Int, createdByUserId)
      .query(`
        INSERT INTO Tickets (Title, Description, Category, Priority, Status, CreatedByUserId)
        OUTPUT INSERTED.*
        VALUES (@title, @description, @category, @priority, @status, @createdByUserId);
      `);
    
    return result.recordset[0];
  }

  /**
   * Get all tickets with optional filtering
   */
  static async getAllTickets({ category, status, priority, search } = {}) {
    const pool = await getPool();
    const request = pool.request();
    
    let query = `
      SELECT t.TicketId, t.Title, t.Description, t.Category, t.Priority, t.Status, t.CreatedDate,
             t.CreatedByUserId, t.AssignedToUserId,
             u1.Name AS CreatedByName, u2.Name AS AssignedToName
      FROM Tickets t
      LEFT JOIN Users u1 ON t.CreatedByUserId = u1.UserId
      LEFT JOIN Users u2 ON t.AssignedToUserId = u2.UserId
      WHERE 1=1
    `;

    if (category) {
      request.input('category', mssql.NVarChar(50), category);
      query += ` AND t.Category = @category`;
    }

    if (status) {
      request.input('status', mssql.NVarChar(20), status);
      query += ` AND t.Status = @status`;
    }

    if (priority) {
      request.input('priority', mssql.NVarChar(20), priority);
      query += ` AND t.Priority = @priority`;
    }

    if (search) {
      request.input('search', mssql.NVarChar(200), `%${search.trim()}%`);
      query += ` AND (t.Title LIKE @search OR t.Description LIKE @search)`;
    }

    query += ` ORDER BY t.CreatedDate DESC`;

    const result = await request.query(query);
    return result.recordset;
  }

  /**
   * Get single ticket details including associated comments
   */
  static async getTicketById(ticketId) {
    const pool = await getPool();
    
    const ticketResult = await pool.request()
      .input('ticketId', mssql.Int, ticketId)
      .query(`
        SELECT t.TicketId, t.Title, t.Description, t.Category, t.Priority, t.Status, t.CreatedDate,
               t.CreatedByUserId, t.AssignedToUserId,
               u1.Name AS CreatedByName, u2.Name AS AssignedToName
        FROM Tickets t
        LEFT JOIN Users u1 ON t.CreatedByUserId = u1.UserId
        LEFT JOIN Users u2 ON t.AssignedToUserId = u2.UserId
        WHERE t.TicketId = @ticketId
      `);

    if (ticketResult.recordset.length === 0) {
      return null;
    }

    const ticket = ticketResult.recordset[0];

    const commentsResult = await pool.request()
      .input('ticketId', mssql.Int, ticketId)
      .query(`
        SELECT CommentId, TicketId, Notes, CreatedDate
        FROM Comments
        WHERE TicketId = @ticketId
        ORDER BY CreatedDate ASC
      `);

    ticket.comments = commentsResult.recordset;
    return ticket;
  }

  /**
   * Update ticket properties (priority, status, title, description, assignment)
   */
  static async updateTicket(ticketId, { title, description, category, priority, status, assignedToUserId, notes }) {
    const pool = await getPool();

    // Check existence first
    const existing = await this.getTicketById(ticketId);
    if (!existing) {
      return null;
    }

    const newTitle = title !== undefined ? title.trim() : existing.Title;
    const newDescription = description !== undefined ? description.trim() : existing.Description;
    const newCategory = category !== undefined ? category.trim() : existing.Category;
    const newPriority = priority !== undefined ? priority : existing.Priority;
    const newStatus = status !== undefined ? status : existing.Status;
    const newAssignedTo = assignedToUserId !== undefined ? assignedToUserId : existing.AssignedToUserId;

    const result = await pool.request()
      .input('ticketId', mssql.Int, ticketId)
      .input('title', mssql.NVarChar(200), newTitle)
      .input('description', mssql.NVarChar(mssql.MAX), newDescription)
      .input('category', mssql.NVarChar(50), newCategory)
      .input('priority', mssql.NVarChar(20), newPriority)
      .input('status', mssql.NVarChar(20), newStatus)
      .input('assignedToUserId', mssql.Int, newAssignedTo)
      .query(`
        UPDATE Tickets
        SET Title = @title,
            Description = @description,
            Category = @category,
            Priority = @priority,
            Status = @status,
            AssignedToUserId = @assignedToUserId
        OUTPUT INSERTED.*
        WHERE TicketId = @ticketId;
      `);

    // Add optional note/comment if passed during update
    if (notes && typeof notes === 'string' && notes.trim().length > 0) {
      await pool.request()
        .input('ticketId', mssql.Int, ticketId)
        .input('notes', mssql.NVarChar(mssql.MAX), notes.trim())
        .query(`
          INSERT INTO Comments (TicketId, Notes)
          VALUES (@ticketId, @notes);
        `);
    }

    return await this.getTicketById(ticketId);
  }

  /**
   * Close a ticket directly with optional resolution notes
   */
  static async closeTicket(ticketId, notes = null) {
    const pool = await getPool();

    const existing = await this.getTicketById(ticketId);
    if (!existing) {
      return null;
    }

    await pool.request()
      .input('ticketId', mssql.Int, ticketId)
      .input('status', mssql.NVarChar(20), 'Closed')
      .query(`
        UPDATE Tickets
        SET Status = @status
        WHERE TicketId = @ticketId;
      `);

    if (notes && typeof notes === 'string' && notes.trim().length > 0) {
      await pool.request()
        .input('ticketId', mssql.Int, ticketId)
        .input('notes', mssql.NVarChar(mssql.MAX), notes.trim())
        .query(`
          INSERT INTO Comments (TicketId, Notes)
          VALUES (@ticketId, @notes);
        `);
    }

    return await this.getTicketById(ticketId);
  }

  /**
   * Fetch all categories
   */
  static async getCategories() {
    const pool = await getPool();
    const result = await pool.request().query('SELECT CategoryId, Name FROM Categories ORDER BY Name ASC');
    return result.recordset;
  }

  /**
   * Aggregate dashboard statistics
   */
  static async getDashboardSummary() {
    const pool = await getPool();

    const totalResult = await pool.request().query('SELECT COUNT(*) AS total FROM Tickets');
    
    const byCategoryResult = await pool.request().query(`
      SELECT Category, COUNT(*) AS count 
      FROM Tickets 
      GROUP BY Category
    `);

    const byPriorityResult = await pool.request().query(`
      SELECT Priority, COUNT(*) AS count 
      FROM Tickets 
      GROUP BY Priority
    `);

    const byStatusResult = await pool.request().query(`
      SELECT Status, COUNT(*) AS count 
      FROM Tickets 
      GROUP BY Status
    `);

    return {
      total: totalResult.recordset[0].total,
      byCategory: byCategoryResult.recordset,
      byPriority: byPriorityResult.recordset,
      byStatus: byStatusResult.recordset
    };
  }
}
