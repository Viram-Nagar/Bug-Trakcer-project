import api from "./api.js";

const ticketService = {
  createTicket: async (ticketData) => {
    const res = await api.post("/tickets", ticketData);
    return res.data;
  },

  getTicketsByProject: async (projectId, filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });

    const query = params.toString() ? `?${params.toString()}` : "";
    const res = await api.get(`/tickets/project/${projectId}${query}`);
    return res.data;
  },

  getTicketById: async (id) => {
    const res = await api.get(`/tickets/${id}`);
    return res.data;
  },

  updateTicket: async (id, ticketData) => {
    const res = await api.put(`/tickets/${id}`, ticketData);
    return res.data;
  },

  deleteTicket: async (id) => {
    const res = await api.delete(`/tickets/${id}`);
    return res.data;
  },

  assignTicket: async (id, assigneeId) => {
    const res = await api.patch(`/tickets/${id}/assign`, { assigneeId });
    return res.data;
  },

  updateStatus: async (id, status) => {
    const res = await api.patch(`/tickets/${id}/status`, { status });
    return res.data;
  },
};

export default ticketService;
