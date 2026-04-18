import Ticket from "../models/Ticket.js";
import Project from "../models/Project.js";

const isProjectMember = (project, userId) => {
  return project.members.some((m) => m.user.toString() === userId.toString());
};

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

    if (!title || !projectId) {
      return res.status(400).json({
        success: false,
        message: "Title and project are required",
      });
    }

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
        message: "You are not a member of this project",
      });
    }

    if (assigneeId) {
      const assigneeIsMember = isProjectMember(project, assigneeId);
      if (!assigneeIsMember) {
        return res.status(400).json({
          success: false,
          message: "Assignee must be a project member",
        });
      }
    }

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

    const filter = { project: projectId };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (type) filter.type = type;

    if (assignee === "unassigned") {
      filter.assignee = null;
    } else if (assignee) {
      filter.assignee = assignee;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

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

    let sortObj = {};
    if (sortField === "priority") {
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

const getUserRole = (project, userId) => {
  const member = project.members.find(
    (m) => m.user.toString() === userId.toString(),
  );
  return member?.role || null;
};

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
