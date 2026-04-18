import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import ticketService from "../../services/ticketService.js";

// ─── THUNKS ───────────────────────────────────────────

export const fetchTickets = createAsyncThunk(
  "tickets/fetchByProject",
  async ({ projectId, filters }, thunkAPI) => {
    try {
      const data = await ticketService.getTicketsByProject(projectId, filters);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch tickets",
      );
    }
  },
);

export const createTicket = createAsyncThunk(
  "tickets/create",
  async (ticketData, thunkAPI) => {
    try {
      const data = await ticketService.createTicket(ticketData);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to create ticket",
      );
    }
  },
);

export const updateTicket = createAsyncThunk(
  "tickets/update",
  async ({ id, ticketData }, thunkAPI) => {
    try {
      const data = await ticketService.updateTicket(id, ticketData);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to update ticket",
      );
    }
  },
);

export const deleteTicket = createAsyncThunk(
  "tickets/delete",
  async (id, thunkAPI) => {
    try {
      await ticketService.deleteTicket(id);
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to delete ticket",
      );
    }
  },
);

export const updateTicketStatus = createAsyncThunk(
  "tickets/updateStatus",
  async ({ id, status }, thunkAPI) => {
    try {
      const data = await ticketService.updateStatus(id, status);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to update status",
      );
    }
  },
);

// ─── INITIAL STATE ────────────────────────────────────

const initialState = {
  tickets: [],
  currentTicket: null,
  isLoading: false,
  error: null,

  // Active filters — synced with UI
  filters: {
    status: "",
    priority: "",
    type: "",
    assignee: "",
    search: "",
    sortBy: "createdAt",
    order: "desc",
  },
};

// ─── SLICE ────────────────────────────────────────────

const ticketSlice = createSlice({
  name: "tickets",
  initialState,

  reducers: {
    setCurrentTicket: (state, action) => {
      state.currentTicket = action.payload;
    },

    // Update filters in Redux — triggers re-fetch in component
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    clearFilters: (state) => {
      state.filters = {
        status: "",
        priority: "",
        type: "",
        assignee: "",
        search: "",
        sortBy: "createdAt",
        order: "desc",
      };
    },

    clearTicketError: (state) => {
      state.error = null;
    },

    // Clear tickets when switching projects
    clearTickets: (state) => {
      state.tickets = [];
      state.currentTicket = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // ── Fetch Tickets ──────────────────────
      .addCase(fetchTickets.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTickets.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tickets = action.payload.data.tickets;
      })
      .addCase(fetchTickets.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ── Create Ticket ──────────────────────
      .addCase(createTicket.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createTicket.fulfilled, (state, action) => {
        state.isLoading = false;
        // Add to beginning of list
        state.tickets.unshift(action.payload.data.ticket);
      })
      .addCase(createTicket.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ── Update Ticket ──────────────────────
      .addCase(updateTicket.fulfilled, (state, action) => {
        const updated = action.payload.data.ticket;
        const index = state.tickets.findIndex((t) => t._id === updated._id);
        if (index !== -1) state.tickets[index] = updated;
        if (state.currentTicket?._id === updated._id) {
          state.currentTicket = updated;
        }
      })

      // ── Delete Ticket ──────────────────────
      .addCase(deleteTicket.fulfilled, (state, action) => {
        state.tickets = state.tickets.filter((t) => t._id !== action.payload);
        if (state.currentTicket?._id === action.payload) {
          state.currentTicket = null;
        }
      })

      // ── Update Status ──────────────────────
      .addCase(updateTicketStatus.fulfilled, (state, action) => {
        const updated = action.payload.data.ticket;
        const index = state.tickets.findIndex((t) => t._id === updated._id);
        if (index !== -1) state.tickets[index] = updated;
      });
  },
});

export const {
  setCurrentTicket,
  setFilters,
  clearFilters,
  clearTicketError,
  clearTickets,
} = ticketSlice.actions;

// ─── SELECTORS ────────────────────────────────────────
export const selectTickets = (state) => state.tickets.tickets;
export const selectCurrentTicket = (state) => state.tickets.currentTicket;
export const selectTicketLoading = (state) => state.tickets.isLoading;
export const selectTicketError = (state) => state.tickets.error;
export const selectTicketFilters = (state) => state.tickets.filters;

export default ticketSlice.reducer;
