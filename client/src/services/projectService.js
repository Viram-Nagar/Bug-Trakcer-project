import api from "./api.js";

const projectService = {
  getProjects: async () => {
    const res = await api.get("/projects");
    return res.data;
  },

  getProjectById: async (id) => {
    const res = await api.get(`/projects/${id}`);
    return res.data;
  },

  createProject: async (projectData) => {
    const res = await api.post("/projects", projectData);
    return res.data;
  },

  updateProject: async (id, projectData) => {
    const res = await api.put(`/projects/${id}`, projectData);
    return res.data;
  },

  deleteProject: async (id) => {
    const res = await api.delete(`/projects/${id}`);
    return res.data;
  },

  addMember: async (id, email, role) => {
    const res = await api.post(`/projects/${id}/members`, { email, role });
    return res.data;
  },

  removeMember: async (id, userId) => {
    const res = await api.delete(`/projects/${id}/members/${userId}`);
    return res.data;
  },
};

export default projectService;
