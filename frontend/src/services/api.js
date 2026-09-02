const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Generic HTTP Request Helper
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  try {
    const response = await fetch(url, { ...options, headers });
    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data.message || (data.errors ? data.errors.join('; ') : 'HTTP Request Failed');
      const error = new Error(errorMsg);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    console.error(`[API Error] ${options.method || 'GET'} ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  // Fetch all tickets with optional query filters
  async getTickets(filters = {}) {
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.status) params.append('status', filters.status);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.search) params.append('search', filters.search);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    return request(`/tickets${queryString}`);
  },

  // Fetch single ticket details by ID
  async getTicketById(id) {
    return request(`/tickets/${id}`);
  },

  // Create new ticket
  async createTicket(ticketData) {
    return request('/tickets', {
      method: 'POST',
      body: JSON.stringify(ticketData)
    });
  },

  // Update existing ticket
  async updateTicket(id, updateData) {
    return request(`/tickets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    });
  },

  // Close ticket with optional resolution note
  async closeTicket(id, notes) {
    return request(`/tickets/${id}/close`, {
      method: 'PUT',
      body: JSON.stringify({ notes })
    });
  },

  // Fetch categories
  async getCategories() {
    return request('/categories');
  },

  // Fetch aggregate dashboard metrics
  async getDashboardSummary() {
    return request('/dashboard/summary');
  }
};

export default api;
