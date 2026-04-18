import api from "./api.js";

const ticketService = {
  // Create ticket
  createTicket: async (ticketData) => {
    const res = await api.post("/tickets", ticketData);
    return res.data;
  },

  // Get all tickets for a project (with optional filters)
  getTicketsByProject: async (projectId, filters = {}) => {
    // Convert filters object to query string
    // e.g. { status: "todo", priority: "high" } → "?status=todo&priority=high"
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });

    const query = params.toString() ? `?${params.toString()}` : "";
    const res = await api.get(`/tickets/project/${projectId}${query}`);
    return res.data;
  },

  // Get single ticket
  getTicketById: async (id) => {
    const res = await api.get(`/tickets/${id}`);
    return res.data;
  },

  // Update ticket
  updateTicket: async (id, ticketData) => {
    const res = await api.put(`/tickets/${id}`, ticketData);
    return res.data;
  },

  // Delete ticket
  deleteTicket: async (id) => {
    const res = await api.delete(`/tickets/${id}`);
    return res.data;
  },

  // Assign ticket
  assignTicket: async (id, assigneeId) => {
    const res = await api.patch(`/tickets/${id}/assign`, { assigneeId });
    return res.data;
  },

  // Update status only (Kanban - Day 8)
  updateStatus: async (id, status) => {
    const res = await api.patch(`/tickets/${id}/status`, { status });
    return res.data;
  },
};

export default ticketService;
