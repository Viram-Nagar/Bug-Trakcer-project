import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import projectService from "../../services/projectService.js";

export const fetchProjects = createAsyncThunk(
  "projects/fetchAll",
  async (_, thunkAPI) => {
    try {
      const data = await projectService.getProjects();
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch projects",
      );
    }
  },
);

export const createProject = createAsyncThunk(
  "projects/create",
  async (projectData, thunkAPI) => {
    try {
      const data = await projectService.createProject(projectData);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to create project",
      );
    }
  },
);

export const updateProject = createAsyncThunk(
  "projects/update",
  async ({ id, projectData }, thunkAPI) => {
    try {
      const data = await projectService.updateProject(id, projectData);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to update project",
      );
    }
  },
);

export const deleteProject = createAsyncThunk(
  "projects/delete",
  async (id, thunkAPI) => {
    try {
      await projectService.deleteProject(id);
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to delete project",
      );
    }
  },
);

export const addMember = createAsyncThunk(
  "projects/addMember",
  async ({ id, email, role }, thunkAPI) => {
    try {
      const data = await projectService.addMember(id, email, role);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to add member",
      );
    }
  },
);

export const removeMember = createAsyncThunk(
  "projects/removeMember",
  async ({ id, userId }, thunkAPI) => {
    try {
      const data = await projectService.removeMember(id, userId);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to remove member",
      );
    }
  },
);

const initialState = {
  projects: [],
  currentProject: null,
  isLoading: false,
  error: null,
};

const projectSlice = createSlice({
  name: "projects",
  initialState,

  reducers: {
    setCurrentProject: (state, action) => {
      state.currentProject = action.payload;
    },
    clearProjectError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      .addCase(fetchProjects.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.isLoading = false;
        state.projects = action.payload.data.projects;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(createProject.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.isLoading = false;

        state.projects.unshift(action.payload.data.project);
      })
      .addCase(createProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(updateProject.fulfilled, (state, action) => {
        const updated = action.payload.data.project;
        const index = state.projects.findIndex((p) => p._id === updated._id);
        if (index !== -1) state.projects[index] = updated;
        if (state.currentProject?._id === updated._id) {
          state.currentProject = updated;
        }
      })

      .addCase(deleteProject.fulfilled, (state, action) => {
        state.projects = state.projects.filter((p) => p._id !== action.payload);
        if (state.currentProject?._id === action.payload) {
          state.currentProject = null;
        }
      })

      .addCase(addMember.fulfilled, (state, action) => {
        const updated = action.payload.data.project;
        const index = state.projects.findIndex((p) => p._id === updated._id);
        if (index !== -1) state.projects[index] = updated;
        if (state.currentProject?._id === updated._id) {
          state.currentProject = updated;
        }
      })

      .addCase(removeMember.fulfilled, (state, action) => {
        const updated = action.payload.data.project;
        const index = state.projects.findIndex((p) => p._id === updated._id);
        if (index !== -1) state.projects[index] = updated;
        if (state.currentProject?._id === updated._id) {
          state.currentProject = updated;
        }
      });
  },
});

export const { setCurrentProject, clearProjectError } = projectSlice.actions;

export const selectProjects = (state) => state.projects.projects;
export const selectCurrentProject = (state) => state.projects.currentProject;
export const selectProjectLoading = (state) => state.projects.isLoading;
export const selectProjectError = (state) => state.projects.error;

export default projectSlice.reducer;
