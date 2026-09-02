import { UserService } from '../services/user.service.js';

/**
 * Controller handling HTTP requests for Users
 */
export class UserController {
  /**
   * GET /users
   * Return all users from the Users table (used for ticket assignment dropdown)
   */
  static async getUsers(req, res, next) {
    try {
      const users = await UserService.getAllUsers();
      return res.status(200).json({
        success: true,
        data: users
      });
    } catch (error) {
      next(error);
    }
  }
}
