import api from "./api.js";

const commentService = {
  getComments: async (ticketId) => {
    const res = await api.get(`/comments/ticket/${ticketId}`);
    return res.data;
  },

  addComment: async (ticketId, text, parentCommentId = null) => {
    const res = await api.post("/comments", {
      ticketId,
      text,
      parentCommentId,
    });
    return res.data;
  },

  updateComment: async (id, text) => {
    const res = await api.put(`/comments/${id}`, { text });
    return res.data;
  },

  deleteComment: async (id) => {
    const res = await api.delete(`/comments/${id}`);
    return res.data;
  },
};

export default commentService;
