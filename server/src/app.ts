import express, { Request, Response } from "express";
import mongoose from "mongoose";
import userRoutes from "./routes/userRoutes";
import authRoutes from "./routes/authRoutes";

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

// 启动服务器，监听 3000 端口
app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
