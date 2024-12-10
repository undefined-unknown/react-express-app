import { Router, Request, Response } from "express";
import authMiddleware from "../middleware/auth";

const router = Router();

// 获取当前用户信息
router.get("/me", authMiddleware, (req: Request, res: Response) => {
  const user = req.user;
  res.json({
    message: "User information",
    user,
  });
});

export default router;
