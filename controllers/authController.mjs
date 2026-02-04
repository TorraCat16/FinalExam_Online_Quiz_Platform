import bcrypt from "bcrypt";
import { createUser, getUserByUsername } from "../models/users.mjs";

export const register = async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }

  try {
    const existingUser = await getUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await createUser(username, hash, role || "student");

    req.session.user = {
      id: user.id,
      username: user.username,
      role: user.role,
    };

    res.status(201).json({
      message: "Registered successfully",
      user: req.session.user,
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "Registration failed" });
  }
};

export const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }

  try {
    const user = await getUserByUsername(username);
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    req.session.user = {
      id: user.id,
      username: user.username,
      role: user.role,
    };

    res.json({
      message: "Logged in successfully",
      user: req.session.user,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
};

export const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Logout failed" });
    }
    res.clearCookie("connect.sid");
    res.json({ message: "Logged out successfully" });
  });
};
