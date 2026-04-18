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

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

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

    status: {
      type: String,
      enum: ["active", "on-hold", "completed"],
      default: "active",
    },

    color: {
      type: String,
      default: "#3b82f6",
    },

    icon: {
      type: String,
      default: "🚀",
    },
  },
  {
    timestamps: true,

    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

const Project = mongoose.model("Project", projectSchema);

export default Project;
