import winston from "winston";

// 创建日志传输器
const logFormat = winston.format.printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}]: ${message}`;
});

const logger = winston.createLogger({
  level: "info", // 日志级别(info、warn、error、debug)
  format: winston.format.combine(
    winston.format.timestamp(), // 添加时间戳
    logFormat
  ),
  transports: [
    // 控制台输出
    new winston.transports.Console(),
    // 文件输出（日志文件大小达到 5MB 时会自动轮转）
    new winston.transports.File({ filename: "logs/app.log", maxsize: 5242880 }),
  ],
});

export default logger;
