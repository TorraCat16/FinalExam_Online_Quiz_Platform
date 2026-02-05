import express from "express";
import { listUsers, changeUserRole, removeUser } from "../controllers/userController.mjs";
import { requireAuth } from "../middleware/authMiddleware.mjs";
import { requireRole } from "../middleware/roleMiddleware.mjs";

const router = express.Router();

// List all users for admins only
router.get("/", requireAuth, requireRole("admin"), listUsers);

// Update user role for admins only
router.put("/:id/role", requireAuth, requireRole("admin"), changeUserRole);

// Delete a user for admins only
router.delete("/:id", requireAuth, requireRole("admin"), removeUser);

export default router;
