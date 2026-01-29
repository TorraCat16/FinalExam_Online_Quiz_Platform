import express from "express";
import { listUsers, changeUserRole } from "../controllers/userController.mjs";

const router = express.Router();

// List all users
router.get("/", listUsers);

// Update user role
router.put("/:id/role", changeUserRole);

export default router;
