import { Router, Request, Response } from "express";
import mongoose from "mongoose";

// 定义 User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  age: Number,
});

// 创建 User 模型
const User = mongoose.model("User", userSchema);

const router = Router();

// 获取所有用户
router.get("/users", async (req: Request, res: Response) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

router.get("/users/:id", async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user" });
  }
});

router.post("/users", async (req: Request, res: Response) => {
  const { name, email, age } = req.body;
  try {
    const newUser = new User({ name, email, age });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: "Failed to create user" });
  }
});

router.put("/users/:id", async (req: Request, res: Response) => {
  const { name, email, age } = req.body;
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, age },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to update user" });
  }
});

router.delete("/users/:id", async (req: Request, res: Response) => {
  try {
    const updatedUser = await User.findByIdAndDelete(req.params.id);
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete user" });
  }
});

export default router;
