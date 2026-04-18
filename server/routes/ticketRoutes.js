import express from "express";
import {
  createTicket,
  getTicketsByProject,
  getTicketById,
  updateTicket,
  deleteTicket,
  assignTicket,
  updateTicketStatus,
} from "../controllers/ticketController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// All ticket routes are protected
router.use(authMiddleware);

// Main CRUD
router.post("/", createTicket);
router.get("/project/:projectId", getTicketsByProject);
router.get("/:id", getTicketById);
router.put("/:id", updateTicket);
router.delete("/:id", deleteTicket);

// Special actions
router.patch("/:id/assign", assignTicket);
router.patch("/:id/status", updateTicketStatus);

export default router;
