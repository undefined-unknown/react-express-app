import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../constants/env";

export interface JwtPayload {
  userId: string;
  name: string;
}

// JWT 认证中间件
const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1]; //从 Authorization 头中获取 token
  if (!token) {
    return res
      .status(401)
      .json({ message: "No token provided, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload; // 验证 token
    req.user = decoded; // 将用户信息挂载到请求对象上
    next(); // 继续处理后续路由
  } catch (error) {
    res.status(401).json({ message: "Token is not valid", error });
  }
};

export default authMiddleware;
