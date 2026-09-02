const VALID_PRIORITIES = ['High', 'Medium', 'Low'];
const VALID_STATUSES = ['Open', 'In Progress', 'Resolved', 'Closed'];

/**
 * Middleware to validate Ticket Creation Request Body
 */
export const validateCreateTicket = (req, res, next) => {
  const { title, description, category, priority } = req.body;
  const errors = [];

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    errors.push('Title is required and must be a non-empty string.');
  } else if (title.trim().length > 200) {
    errors.push('Title cannot exceed 200 characters.');
  }

  if (!description || typeof description !== 'string' || description.trim().length === 0) {
    errors.push('Description is required and must be a non-empty string.');
  }

  if (!category || typeof category !== 'string' || category.trim().length === 0) {
    errors.push('Category is required.');
  }

  if (!priority || !VALID_PRIORITIES.includes(priority)) {
    errors.push(`Priority must be one of: ${VALID_PRIORITIES.join(', ')}.`);
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

/**
 * Middleware to validate Ticket Update Request Body
 */
export const validateUpdateTicket = (req, res, next) => {
  const { title, description, category, priority, status } = req.body;
  const errors = [];

  if (title !== undefined && (typeof title !== 'string' || title.trim().length === 0)) {
    errors.push('Title cannot be empty.');
  }

  if (description !== undefined && (typeof description !== 'string' || description.trim().length === 0)) {
    errors.push('Description cannot be empty.');
  }

  if (priority !== undefined && !VALID_PRIORITIES.includes(priority)) {
    errors.push(`Priority must be one of: ${VALID_PRIORITIES.join(', ')}.`);
  }

  if (status !== undefined && !VALID_STATUSES.includes(status)) {
    errors.push(`Status must be one of: ${VALID_STATUSES.join(', ')}.`);
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

/**
 * Middleware to validate numeric ID parameter
 */
export const validateIdParam = (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id) || id <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Invalid ticket ID format. Must be a positive integer.'
    });
  }
  next();
};
