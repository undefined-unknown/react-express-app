"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
// 基本路由
app.get("/", (req, res) => {
    res.send("Hello, Express with TypeScript!");
});
// 处理 GET 请求
app.get("/get-data", (req, res) => {
    res.send("GET request received");
});
// 处理 POST 请求
app.post("/post-data", (req, res) => {
    res.send("POST request received");
});
// 启动服务器，监听 3000 端口
app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
});
