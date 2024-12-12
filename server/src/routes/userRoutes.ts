import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import authMiddleware from "../middleware/auth";
import User from "../models/User";
import { JWT_SECRET } from "../constants/env";

const router = Router();

// 增加查询接口
router.get("/users", authMiddleware, async (req: Request, res: Response) => {
  try {
    // URL 是 /users?page=example1&pageSize=example2
    const page = parseInt(req.query.page as string) || 1; // 当前页码
    const pageSize = parseInt(req.query.pageSize as string) || 10; // 每页记录数
    const skip = (page - 1) * pageSize; // 计算跳过的记录数

    const users = await User.find()
      .skip(skip) // 跳过前面的数据
      .limit(pageSize) // 限制每页返回的数量
      .select("name"); // 只返回 name 字段
    // .select("-password") // 字段名加-号就是排除, 排除多个用空格隔开，如"-password -createAt"

    // 获取总记录数
    const total = await User.countDocuments();
    // 计算总页数
    const totalPages = Math.ceil(total / pageSize);

    res.json({
      page,
      pageSize,
      users,
      total,
      totalPages,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users", error });
  }
});

router.post("/register", async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = new User({ name, email, password });
    await newUser.save();

    res.status(201).json({
      message: "User registered successfully",
      user: {
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to register user", error });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    console.log("user", user);
    if (!user) {
      return res.status(400).json({ message: "Invaild email or password" });
    }
    const isPasswordMatch = await user.matchPassword(password);
    if (!isPasswordMatch) {
      return res.status(400).json({ message: "Invaild email or password" });
    }

    const token = jwt.sign(
      { userId: user._id, name: user.name },
      JWT_SECRET, // 密钥
      { expiresIn: "1d" } // 设置过期时间为 1 天
    );

    res.json({
      message: "Login successful",
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to login user", error });
  }
});

export default router;
