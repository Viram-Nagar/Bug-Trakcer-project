import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    // Which ticket this comment belongs to
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
      required: [true, "Ticket is required"],
    },

    // Who wrote the comment
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Author is required"],
    },

    // Comment text
    text: {
      type: String,
      required: [true, "Comment text is required"],
      trim: true,
      maxlength: [1000, "Comment cannot exceed 1000 characters"],
    },

    // Optional — reply to another comment (threaded)
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },

    // Soft delete — hide without removing from DB
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  },
);

// Index for fast lookup by ticket
commentSchema.index({ ticket: 1, createdAt: 1 });

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;
