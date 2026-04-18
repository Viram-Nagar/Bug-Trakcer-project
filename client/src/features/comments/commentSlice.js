import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import commentService from "../../services/commentService.js";

// ─── THUNKS ───────────────────────────────────────────

export const fetchComments = createAsyncThunk(
  "comments/fetchByTicket",
  async (ticketId, thunkAPI) => {
    try {
      const data = await commentService.getComments(ticketId);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch comments",
      );
    }
  },
);

export const addComment = createAsyncThunk(
  "comments/add",
  async ({ ticketId, text, parentCommentId }, thunkAPI) => {
    try {
      const data = await commentService.addComment(
        ticketId,
        text,
        parentCommentId,
      );
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to add comment",
      );
    }
  },
);

export const updateComment = createAsyncThunk(
  "comments/update",
  async ({ id, text }, thunkAPI) => {
    try {
      const data = await commentService.updateComment(id, text);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to update comment",
      );
    }
  },
);

export const deleteComment = createAsyncThunk(
  "comments/delete",
  async (id, thunkAPI) => {
    try {
      const data = await commentService.deleteComment(id);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to delete comment",
      );
    }
  },
);

// ─── SLICE ────────────────────────────────────────────

const commentSlice = createSlice({
  name: "comments",
  initialState: {
    comments: [],
    isLoading: false,
    isSubmitting: false,
    error: null,
  },

  reducers: {
    clearComments: (state) => {
      state.comments = [];
      state.error = null;
    },
    clearCommentError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // ── Fetch ──────────────────────────────
      .addCase(fetchComments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.comments = action.payload.data.comments;
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ── Add ────────────────────────────────
      .addCase(addComment.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(addComment.fulfilled, (state, action) => {
        state.isSubmitting = false;
        // Add to end of list (oldest first order)
        state.comments.push(action.payload.data.comment);
      })
      .addCase(addComment.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      })

      // ── Update ─────────────────────────────
      .addCase(updateComment.fulfilled, (state, action) => {
        const updated = action.payload.data.comment;
        const index = state.comments.findIndex((c) => c._id === updated._id);
        if (index !== -1) state.comments[index] = updated;
      })

      // ── Delete ─────────────────────────────
      .addCase(deleteComment.fulfilled, (state, action) => {
        const deletedId = action.payload.data.commentId;
        state.comments = state.comments.filter((c) => c._id !== deletedId);
      });
  },
});

export const { clearComments, clearCommentError } = commentSlice.actions;

// ─── SELECTORS ────────────────────────────────────────
export const selectComments = (state) => state.comments.comments;
export const selectCommentLoading = (state) => state.comments.isLoading;
export const selectCommentSubmitting = (state) => state.comments.isSubmitting;
export const selectCommentError = (state) => state.comments.error;

export default commentSlice.reducer;
