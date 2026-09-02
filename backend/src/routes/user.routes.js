import express from 'express';
import { UserController } from '../controllers/user.controller.js';

const router = express.Router();

// GET /users - Retrieve all assignable users
router.get('/', UserController.getUsers);

export default router;
