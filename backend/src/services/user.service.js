import { getPool, mssql } from '../config/db.js';

/**
 * Service handling database operations for Users
 */
export class UserService {
  /**
   * Retrieve all users — used to populate the ticket assignment dropdown
   */
  static async getAllUsers() {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT UserId, Name, Email, Role
      FROM Users
      ORDER BY Name ASC
    `);
    return result.recordset;
  }

  /**
   * Verify a UserId exists in the Users table
   * Returns true if found, false if not
   */
  static async userExists(userId) {
    const pool = await getPool();
    const result = await pool.request()
      .input('userId', mssql.Int, userId)
      .query('SELECT 1 AS found FROM Users WHERE UserId = @userId');
    return result.recordset.length > 0;
  }
}
