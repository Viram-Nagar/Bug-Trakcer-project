import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Project title is required"],
      trim: true,
      minlength: [2, "Title must be at least 2 characters"],
      maxlength: [100, "Title cannot exceed 100 characters"],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
      default: "",
    },

    // Who created the project
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Team members array
    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        role: {
          type: String,
          enum: ["admin", "manager", "developer", "viewer"],
          default: "developer",
        },
      },
    ],

    // Project status
    status: {
      type: String,
      enum: ["active", "on-hold", "completed"],
      default: "active",
    },

    // Color tag for UI
    color: {
      type: String,
      default: "#3b82f6",
    },

    // Emoji icon for UI
    icon: {
      type: String,
      default: "🚀",
    },
  },
  {
    timestamps: true,
    // Virtual field for ticket count (Day 4)
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

const Project = mongoose.model("Project", projectSchema);

export default Project;
