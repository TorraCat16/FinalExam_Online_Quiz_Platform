import { getAllUsers, updateUserRole } from "../models/users.mjs";

export const listUsers = async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

export const changeUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!role) return res.status(400).json({ error: "Role required" });

  try {
    const updated = await updateUserRole(id, role);
    res.json({ message: "User role updated", user: updated });
  } catch {
    res.status(500).json({ error: "Failed to update user role" });
  }
};
