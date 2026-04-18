import Ticket from "../models/Ticket.js";
import Project from "../models/Project.js";

// ─────────────────────────────────────────
// Helper — check if user is project member
// ─────────────────────────────────────────
const isProjectMember = (project, userId) => {
  return project.members.some((m) => m.user.toString() === userId.toString());
};

// ─────────────────────────────────────────
// @route   POST /api/tickets
// @desc    Create new ticket
// @access  Private (project members only)
// ─────────────────────────────────────────
export const createTicket = async (req, res) => {
  try {
    const {
      title,
      description,
      projectId,
      assigneeId,
      priority,
      type,
      status,
      dueDate,
      tags,
    } = req.body;

    // 1. Validate required fields
    if (!title || !projectId) {
      return res.status(400).json({
        success: false,
        message: "Title and project are required",
      });
    }

    // 2. Check project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // 3. Check user is a project member
    if (!isProjectMember(project, req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this project",
      });
    }

    // 4. If assignee provided, check they are also a member
    if (assigneeId) {
      const assigneeIsMember = isProjectMember(project, assigneeId);
      if (!assigneeIsMember) {
        return res.status(400).json({
          success: false,
          message: "Assignee must be a project member",
        });
      }
    }

    // 5. Create ticket
    const ticket = await Ticket.create({
      title,
      description,
      project: projectId,
      reporter: req.user._id,
      assignee: assigneeId || null,
      priority: priority || "medium",
      type: type || "bug",
      status: status || "todo",
      dueDate: dueDate || null,
      tags: tags || [],
    });

    // 6. Populate and return
    const populated = await Ticket.findById(ticket._id)
      .populate("reporter", "name email avatar")
      .populate("assignee", "name email avatar")
      .populate("project", "title color icon");

    res.status(201).json({
      success: true,
      message: "Ticket created successfully",
      data: { ticket: populated },
    });
  } catch (error) {
    console.error("CREATE TICKET ERROR:", error.message);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: messages[0],
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
    });
  }
};

// ─────────────────────────────────────────
// @route   GET /api/tickets/project/:projectId
// @desc    Get all tickets for a project
// @access  Private (project members only)
// ─────────────────────────────────────────
// export const getTicketsByProject = async (req, res) => {
//   try {
//     const { projectId } = req.params;

//     // Query params for filtering
//     const { status, priority, assignee, type, search } = req.query;

//     // 1. Check project exists and user is member
//     const project = await Project.findById(projectId);
//     if (!project) {
//       return res.status(404).json({
//         success: false,
//         message: "Project not found",
//       });
//     }

//     if (!isProjectMember(project, req.user._id)) {
//       return res.status(403).json({
//         success: false,
//         message: "Access denied",
//       });
//     }

//     // 2. Build filter object dynamically
//     const filter = { project: projectId };

//     if (status) filter.status = status;
//     if (priority) filter.priority = priority;
//     if (type) filter.type = type;
//     if (assignee) filter.assignee = assignee;

//     // Search by title or description
//     if (search) {
//       filter.$or = [
//         { title: { $regex: search, $options: "i" } },
//         { description: { $regex: search, $options: "i" } },
//       ];
//     }

//     // 3. Fetch tickets
//     const tickets = await Ticket.find(filter)
//       .populate("reporter", "name email avatar")
//       .populate("assignee", "name email avatar")
//       .sort({ createdAt: -1 }); // newest first

//     res.status(200).json({
//       success: true,
//       data: { tickets },
//     });
//   } catch (error) {
//     console.error("GET TICKETS ERROR:", error.message);
//     res.status(500).json({
//       success: false,
//       message: "Server error. Please try again.",
//     });
//   }
// };

export const getTicketsByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const {
      status,
      priority,
      assignee,
      type,
      search,
      sortBy = "createdAt",
      order = "desc",
    } = req.query;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    if (!isProjectMember(project, req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Build filter object
    const filter = { project: projectId };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (type) filter.type = type;

    // ✅ Fix assignee filter — handle "unassigned" case
    if (assignee === "unassigned") {
      filter.assignee = null;
    } else if (assignee) {
      filter.assignee = assignee;
    }

    // Keyword search in title OR description
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    // ✅ Build sort object
    const validSortFields = [
      "createdAt",
      "updatedAt",
      "priority",
      "status",
      "ticketNumber",
      "dueDate",
    ];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "createdAt";
    const sortOrder = order === "asc" ? 1 : -1;

    // Priority needs custom sort order (critical > high > medium > low)
    let sortObj = {};
    if (sortField === "priority") {
      // We handle priority sort on frontend since it's enum-based
      sortObj = { createdAt: sortOrder };
    } else {
      sortObj = { [sortField]: sortOrder };
    }

    const tickets = await Ticket.find(filter)
      .populate("reporter", "name email avatar")
      .populate("assignee", "name email avatar")
      .sort(sortObj);

    res.status(200).json({
      success: true,
      data: { tickets },
    });
  } catch (error) {
    console.error("GET TICKETS ERROR:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
    });
  }
};

// ─────────────────────────────────────────
// @route   GET /api/tickets/:id
// @desc    Get single ticket by ID
// @access  Private
// ─────────────────────────────────────────
export const getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate("reporter", "name email avatar")
      .populate("assignee", "name email avatar")
      .populate("project", "title color icon members");

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    // Check user is member of the project
    const project = await Project.findById(ticket.project._id);
    if (!isProjectMember(project, req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    res.status(200).json({
      success: true,
      data: { ticket },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
    });
  }
};

// ─────────────────────────────────────────
// @route   PUT /api/tickets/:id
// @desc    Update ticket
// @access  Private (reporter or assignee)
// ─────────────────────────────────────────
// export const updateTicket = async (req, res) => {
//   try {
//     const ticket = await Ticket.findById(req.params.id);

//     if (!ticket) {
//       return res.status(404).json({
//         success: false,
//         message: "Ticket not found",
//       });
//     }

//     // Check user is project member
//     const project = await Project.findById(ticket.project);
//     if (!isProjectMember(project, req.user._id)) {
//       return res.status(403).json({
//         success: false,
//         message: "Access denied",
//       });
//     }

//     const {
//       title,
//       description,
//       priority,
//       status,
//       assigneeId,
//       type,
//       dueDate,
//       tags,
//     } = req.body;

//     // Build update object with only provided fields
//     const updateData = {};
//     if (title !== undefined) updateData.title = title;
//     if (description !== undefined) updateData.description = description;
//     if (priority !== undefined) updateData.priority = priority;
//     if (status !== undefined) updateData.status = status;
//     if (type !== undefined) updateData.type = type;
//     if (dueDate !== undefined) updateData.dueDate = dueDate;
//     if (tags !== undefined) updateData.tags = tags;
//     if (assigneeId !== undefined) updateData.assignee = assigneeId || null;

//     const updated = await Ticket.findByIdAndUpdate(req.params.id, updateData, {
//       new: true,
//       runValidators: true,
//     })
//       .populate("reporter", "name email avatar")
//       .populate("assignee", "name email avatar")
//       .populate("project", "title color icon");

//     res.status(200).json({
//       success: true,
//       message: "Ticket updated successfully",
//       data: { ticket: updated },
//     });
//   } catch (error) {
//     console.error("UPDATE TICKET ERROR:", error.message);

//     if (error.name === "ValidationError") {
//       const messages = Object.values(error.errors).map((e) => e.message);
//       return res.status(400).json({
//         success: false,
//         message: messages[0],
//       });
//     }

//     res.status(500).json({
//       success: false,
//       message: "Server error. Please try again.",
//     });
//   }
// };

// // ─────────────────────────────────────────
// // @route   DELETE /api/tickets/:id
// // @desc    Delete ticket
// // @access  Private (reporter or project owner)
// // ─────────────────────────────────────────
// export const deleteTicket = async (req, res) => {
//   try {
//     const ticket = await Ticket.findById(req.params.id);

//     if (!ticket) {
//       return res.status(404).json({
//         success: false,
//         message: "Ticket not found",
//       });
//     }

//     const project = await Project.findById(ticket.project);

//     // Only reporter or project owner can delete
//     const isReporter = ticket.reporter.toString() === req.user._id.toString();
//     const isOwner = project.owner.toString() === req.user._id.toString();

//     if (!isReporter && !isOwner) {
//       return res.status(403).json({
//         success: false,
//         message: "Only the reporter or project owner can delete this ticket",
//       });
//     }

//     await Ticket.findByIdAndDelete(req.params.id);

//     res.status(200).json({
//       success: true,
//       message: "Ticket deleted successfully",
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Server error. Please try again.",
//     });
//   }
// };

// ── Helper — get user role in project ────────────────
const getUserRole = (project, userId) => {
  const member = project.members.find(
    (m) => m.user.toString() === userId.toString(),
  );
  return member?.role || null;
};

// ─────────────────────────────────────────
// @route   PUT /api/tickets/:id
// @desc    Update ticket (role-based)
// @access  Private
// ─────────────────────────────────────────
export const updateTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    const project = await Project.findById(ticket.project);

    if (!isProjectMember(project, req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // ✅ Role-based edit check
    const role = getUserRole(project, req.user._id);
    const isOwner = project.owner.toString() === req.user._id.toString();
    const isReporter = ticket.reporter.toString() === req.user._id.toString();

    const canEdit =
      isOwner ||
      role === "admin" ||
      role === "manager" ||
      (role === "developer" && isReporter);

    if (!canEdit) {
      return res.status(403).json({
        success: false,
        message:
          "Viewers cannot edit tickets. " +
          "Developers can only edit their own tickets.",
      });
    }

    const {
      title,
      description,
      priority,
      status,
      assigneeId,
      type,
      dueDate,
      tags,
    } = req.body;

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (priority !== undefined) updateData.priority = priority;
    if (status !== undefined) updateData.status = status;
    if (type !== undefined) updateData.type = type;
    if (dueDate !== undefined) updateData.dueDate = dueDate;
    if (tags !== undefined) updateData.tags = tags;
    if (assigneeId !== undefined) {
      updateData.assignee = assigneeId || null;
    }

    const updated = await Ticket.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("reporter", "name email avatar")
      .populate("assignee", "name email avatar")
      .populate("project", "title color icon");

    res.status(200).json({
      success: true,
      message: "Ticket updated successfully",
      data: { ticket: updated },
    });
  } catch (error) {
    console.error("UPDATE TICKET ERROR:", error.message);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: messages[0],
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
    });
  }
};

// ─────────────────────────────────────────
// @route   DELETE /api/tickets/:id
// @desc    Delete ticket (role-based)
// @access  Private
// ─────────────────────────────────────────
export const deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    const project = await Project.findById(ticket.project);
    const role = getUserRole(project, req.user._id);
    const isOwner = project.owner.toString() === req.user._id.toString();
    const isReporter = ticket.reporter.toString() === req.user._id.toString();

    // ✅ Role-based delete check
    const canDelete =
      isOwner ||
      role === "admin" ||
      ((role === "manager" || role === "developer") && isReporter);

    if (!canDelete) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to delete this ticket.",
      });
    }

    await Ticket.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Ticket deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
    });
  }
};

// ─────────────────────────────────────────
// @route   PATCH /api/tickets/:id/assign
// @desc    Assign ticket to a user
// @access  Private (project members)
// ─────────────────────────────────────────
export const assignTicket = async (req, res) => {
  try {
    const { assigneeId } = req.body;

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    const project = await Project.findById(ticket.project);
    if (!isProjectMember(project, req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Validate assignee is a project member
    if (assigneeId && !isProjectMember(project, assigneeId)) {
      return res.status(400).json({
        success: false,
        message: "Assignee must be a project member",
      });
    }

    const updated = await Ticket.findByIdAndUpdate(
      req.params.id,
      { assignee: assigneeId || null },
      { new: true },
    )
      .populate("reporter", "name email avatar")
      .populate("assignee", "name email avatar")
      .populate("project", "title color icon");

    res.status(200).json({
      success: true,
      message: assigneeId ? "Ticket assigned" : "Ticket unassigned",
      data: { ticket: updated },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
    });
  }
};

// ─────────────────────────────────────────
// @route   PATCH /api/tickets/:id/status
// @desc    Update ticket status only (for Kanban drag drop - Day 8)
// @access  Private
// ─────────────────────────────────────────
export const updateTicketStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = ["todo", "in-progress", "in-review", "done"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    const project = await Project.findById(ticket.project);
    if (!isProjectMember(project, req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const updated = await Ticket.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    )
      .populate("reporter", "name email avatar")
      .populate("assignee", "name email avatar");

    res.status(200).json({
      success: true,
      message: "Status updated",
      data: { ticket: updated },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
    });
  }
};
