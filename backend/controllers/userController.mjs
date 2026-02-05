import { getAllUsers, updateUserRole, deleteUser } from "../models/users.mjs";

// List all users
export const listUsers = async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (err) {
    console.error("Failed to fetch users", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

// Update a user's role
export const changeUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!role) return res.status(400).json({ error: "Role required" });

  try {
    const updated = await updateUserRole(id, role);
    res.json({ message: "User role updated", user: updated });
  } catch (err) {
    console.error("Failed to update user role", err);
    res.status(500).json({ error: "Failed to update user role" });
  }
};

// Delete a user (with dependent cleanup handled in model)
export const removeUser = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await deleteUser(id);
    if (!deleted) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Failed to delete user", err);
    res.status(500).json({ error: "Failed to delete user" });
  }
};
