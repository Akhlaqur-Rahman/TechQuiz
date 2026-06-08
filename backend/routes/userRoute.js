import express from "express";

import { clerkWehbook } from "../controllers/webhook.js";
import { getAllQuizzes } from "../controllers/adminController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post(
  "/webhook/clerk",
  express.raw({ type: "application/json" }),
  clerkWehbook
);

// Get All Quizzes For Users
router.get("/all-quizzes", protect, getAllQuizzes);

export default router;
