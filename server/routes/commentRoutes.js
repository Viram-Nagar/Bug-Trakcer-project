import express from "express";
import {
  addComment,
  getCommentsByTicket,
  updateComment,
  deleteComment,
} from "../controllers/commentController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes protected
router.use(authMiddleware);

router.post("/", addComment);
router.get("/ticket/:ticketId", getCommentsByTicket);
router.put("/:id", updateComment);
router.delete("/:id", deleteComment);

export default router;
