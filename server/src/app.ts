import express, { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import userRoutes from "./routes/userRoutes";
import authRoutes from "./routes/authRoutes";
import logger from "./utils/logger";

const app = express();

const dbURI =
  "mongodb+srv://zyz82777:Kevin293.@cluster0.ndu93.mongodb.net/react-express-app?retryWrites=true&w=majority&appName=Cluster0";

mongoose
  .connect(dbURI)
  .then(() => console.log("Connected to MongoDB Atlas!"))
  .catch((err) => console.log("Failed to connect to MongoDB Atlas", err));

app.use(express.json()); // 解析 JSON 请求体
app.use(express.urlencoded({ extended: true })); // 解析 URL 编码的请求体

app.use("/api", userRoutes);
app.use("/api", authRoutes);

// 基本路由
app.get("/", (req: Request, res: Response) => {
  setTimeout(() => {
    throw new Error("Test Uncaught Exception");
  }, 1000);
  res.send("Hello, Express with TypeScript!");
});

// 处理 GET 请求
app.get("/get-data", (req: Request, res: Response) => {
  res.send("GET request received");
});

// 处理 POST 请求
app.post("/post-data", (req: Request, res: Response) => {
  res.send("POST request received");
});

app.get("/user/:id", (req: Request, res: Response) => {
  const userId = req.params.id;
  res.send(`User ID: ${userId}`);
});

app.get("/search", (req: Request, res: Response) => {
  const { name, age } = req.query;
  res.send(`Search results for ${name}, age: ${age}`);
});

// 集中处理所有未捕获的错误,需定义在所有路由之后和其他中间件之前
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(`Error occurred: ${err.message}`);
  res.status(500).send("Something went wrong!");
});

/**
 * 在生产环境中，当发生这类错误时，
 * 我们通常会选择 退出进程（通过 process.exit(1)）
 * 并使用进程管理工具（如 PM2）自动重启服务。
 * 这样可以防止应用长时间处于不稳定状态。
 * */

// 捕获未处理的 Promise 异常
process.on("unhandledRejection", (reason, promise) => {
  logger.error(`Unhandled rejection at: ${promise}, reason: ${reason}`);
  process.exit(1); // 非正常退出，触发进程崩溃重启（如使用 PM2 进行进程管理）
});

// 捕获未处理的同步异常
process.on("uncaughtException", (error) => {
  logger.error(`Uncaught exception: ${error.message}`);
  process.exit(1); // 非正常退出
});

// 启动服务器，监听 3000 端口
app.listen(3000, () => {
  logger.info("Server is running on http://localhost:3000");
});
