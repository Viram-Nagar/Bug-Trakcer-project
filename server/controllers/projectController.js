import Project from "../models/Project.js";
import User from "../models/User.js";

// ─────────────────────────────────────────
// @route   POST /api/projects
// @desc    Create new project
// @access  Private
// ─────────────────────────────────────────
export const createProject = async (req, res) => {
  try {
    const { title, description, color, icon } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Project title is required",
      });
    }

    // Create project — owner is logged in user
    const project = await Project.create({
      title,
      description,
      color: color || "#3b82f6",
      icon: icon || "🚀",
      owner: req.user._id,
      // Owner is also a member with admin role
      members: [{ user: req.user._id, role: "admin" }],
    });

    // Populate owner and members for response
    const populatedProject = await Project.findById(project._id)
      .populate("owner", "name email avatar")
      .populate("members.user", "name email avatar");

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: { project: populatedProject },
    });
  } catch (error) {
    console.error("CREATE PROJECT ERROR:", error.message);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages[0] });
    }

    res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
    });
  }
};

// ─────────────────────────────────────────
// @route   GET /api/projects
// @desc    Get all projects for logged in user
// @access  Private
// ─────────────────────────────────────────
export const getProjects = async (req, res) => {
  try {
    // Find projects where user is owner OR a member
    const projects = await Project.find({
      $or: [{ owner: req.user._id }, { "members.user": req.user._id }],
    })
      .populate("owner", "name email avatar")
      .populate("members.user", "name email avatar")
      .sort({ createdAt: -1 }); // newest first

    res.status(200).json({
      success: true,
      data: { projects },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
    });
  }
};

// ─────────────────────────────────────────
// @route   GET /api/projects/:id
// @desc    Get single project
// @access  Private
// ─────────────────────────────────────────
export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("owner", "name email avatar")
      .populate("members.user", "name email avatar");

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Check if user has access
    const isMember = project.members.some(
      (m) => m.user._id.toString() === req.user._id.toString(),
    );
    const isOwner = project.owner._id.toString() === req.user._id.toString();

    if (!isMember && !isOwner) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    res.status(200).json({
      success: true,
      data: { project },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
    });
  }
};

// ─────────────────────────────────────────
// @route   PUT /api/projects/:id
// @desc    Update project
// @access  Private (owner/admin only)
// ─────────────────────────────────────────
export const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Only owner can update
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only project owner can update",
      });
    }

    const { title, description, status, color, icon } = req.body;

    const updated = await Project.findByIdAndUpdate(
      req.params.id,
      { title, description, status, color, icon },
      { new: true, runValidators: true },
    )
      .populate("owner", "name email avatar")
      .populate("members.user", "name email avatar");

    res.status(200).json({
      success: true,
      message: "Project updated successfully",
      data: { project: updated },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
    });
  }
};

// ─────────────────────────────────────────
// @route   DELETE /api/projects/:id
// @desc    Delete project
// @access  Private (owner only)
// ─────────────────────────────────────────
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only project owner can delete",
      });
    }

    await Project.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
    });
  }
};

// ─────────────────────────────────────────
// @route   POST /api/projects/:id/members
// @desc    Add member to project by email
// @access  Private (owner only)
// ─────────────────────────────────────────
export const addMember = async (req, res) => {
  try {
    const { email, role } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Only owner can add members
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only project owner can add members",
      });
    }

    // Find user by email
    const userToAdd = await User.findOne({ email });
    if (!userToAdd) {
      return res.status(404).json({
        success: false,
        message: "No user found with this email",
      });
    }

    // Check if already a member
    const alreadyMember = project.members.some(
      (m) => m.user.toString() === userToAdd._id.toString(),
    );

    if (alreadyMember) {
      return res.status(400).json({
        success: false,
        message: "User is already a member",
      });
    }

    project.members.push({
      user: userToAdd._id,
      role: role || "developer",
    });

    await project.save();

    const updated = await Project.findById(project._id)
      .populate("owner", "name email avatar")
      .populate("members.user", "name email avatar");

    res.status(200).json({
      success: true,
      message: `${userToAdd.name} added successfully`,
      data: { project: updated },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
    });
  }
};

// ─────────────────────────────────────────
// @route   DELETE /api/projects/:id/members/:userId
// @desc    Remove member from project
// @access  Private (owner only)
// ─────────────────────────────────────────
export const removeMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only project owner can remove members",
      });
    }

    // Cannot remove owner
    if (project.owner.toString() === req.params.userId) {
      return res.status(400).json({
        success: false,
        message: "Cannot remove project owner",
      });
    }

    project.members = project.members.filter(
      (m) => m.user.toString() !== req.params.userId,
    );

    await project.save();

    const updated = await Project.findById(project._id)
      .populate("owner", "name email avatar")
      .populate("members.user", "name email avatar");

    res.status(200).json({
      success: true,
      message: "Member removed successfully",
      data: { project: updated },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
    });
  }
};
