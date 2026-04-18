import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Ticket title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [150, "Title cannot exceed 150 characters"],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
      default: "",
    },

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Project is required"],
    },

    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    type: {
      type: String,
      enum: ["bug", "feature", "improvement", "task"],
      default: "bug",
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },

    status: {
      type: String,
      enum: ["todo", "in-progress", "in-review", "done"],
      default: "todo",
    },

    dueDate: {
      type: Date,
      default: null,
    },

    ticketNumber: {
      type: Number,
    },

    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  },
);

ticketSchema.pre("save", async function () {
  if (this.isNew) {
    const lastTicket = await mongoose
      .model("Ticket")
      .findOne({ project: this.project })
      .sort({ ticketNumber: -1 });

    this.ticketNumber = lastTicket ? lastTicket.ticketNumber + 1 : 1;
  }
});

ticketSchema.index({ project: 1, status: 1 });
ticketSchema.index({ project: 1, assignee: 1 });
ticketSchema.index({ project: 1, priority: 1 });

const Ticket = mongoose.model("Ticket", ticketSchema);

export default Ticket;
