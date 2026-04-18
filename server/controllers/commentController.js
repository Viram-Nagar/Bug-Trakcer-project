import Comment from "../models/Comment.js";
import Ticket from "../models/Ticket.js";
import Project from "../models/Project.js";

// ── Helper ────────────────────────────────────────────
const isProjectMember = (project, userId) => {
  return project.members.some((m) => m.user.toString() === userId.toString());
};

// ─────────────────────────────────────────
// @route   POST /api/comments
// @desc    Add comment to a ticket
// @access  Private (project members)
// ─────────────────────────────────────────
export const addComment = async (req, res) => {
  try {
    const { ticketId, text, parentCommentId } = req.body;

    if (!ticketId || !text?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Ticket ID and comment text are required",
      });
    }

    // Verify ticket exists
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    // Verify user is project member
    const project = await Project.findById(ticket.project);
    if (!isProjectMember(project, req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this project",
      });
    }

    // If replying — verify parent comment exists
    if (parentCommentId) {
      const parent = await Comment.findById(parentCommentId);
      if (!parent) {
        return res.status(404).json({
          success: false,
          message: "Parent comment not found",
        });
      }
    }

    // Create comment
    const comment = await Comment.create({
      ticket: ticketId,
      author: req.user._id,
      text: text.trim(),
      parentComment: parentCommentId || null,
    });

    // Populate author for response
    const populated = await Comment.findById(comment._id).populate(
      "author",
      "name email avatar",
    );

    res.status(201).json({
      success: true,
      message: "Comment added",
      data: { comment: populated },
    });
  } catch (error) {
    console.error("ADD COMMENT ERROR:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
    });
  }
};

// ─────────────────────────────────────────
// @route   GET /api/comments/ticket/:ticketId
// @desc    Get all comments for a ticket
// @access  Private (project members)
// ─────────────────────────────────────────
export const getCommentsByTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;

    // Verify ticket exists
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    // Verify user is project member
    const project = await Project.findById(ticket.project);
    if (!isProjectMember(project, req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Fetch all non-deleted comments for ticket
    const comments = await Comment.find({
      ticket: ticketId,
      isDeleted: false,
    })
      .populate("author", "name email avatar")
      .populate("parentComment", "text author")
      .sort({ createdAt: 1 }); // oldest first

    res.status(200).json({
      success: true,
      data: { comments },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
    });
  }
};

// ─────────────────────────────────────────
// @route   PUT /api/comments/:id
// @desc    Edit a comment
// @access  Private (author only)
// ─────────────────────────────────────────
export const updateComment = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment text is required",
      });
    }

    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // Only author can edit
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own comments",
      });
    }

    comment.text = text.trim();
    await comment.save();

    const populated = await Comment.findById(comment._id).populate(
      "author",
      "name email avatar",
    );

    res.status(200).json({
      success: true,
      message: "Comment updated",
      data: { comment: populated },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
    });
  }
};

// ─────────────────────────────────────────
// @route   DELETE /api/comments/:id
// @desc    Delete a comment (soft delete)
// @access  Private (author only)
// ─────────────────────────────────────────
export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // Only author can delete
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own comments",
      });
    }

    // Soft delete — keeps thread structure intact
    comment.isDeleted = true;
    await comment.save();

    res.status(200).json({
      success: true,
      message: "Comment deleted",
      data: { commentId: comment._id },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
    });
  }
};
