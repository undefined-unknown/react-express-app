import mongoose, { Document } from "mongoose";
import bcrypt from "bcryptjs";

interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  matchPassword(password: string): Promise<boolean>; // 定义 matchPassword 方法
}

// 定义 User Schema
const userSchema = new mongoose.Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  {
    timestamps: true, // 自动创建 createdAt 和 updatedAt 字段
  }
);

// 密码加密处理
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10); // 生成盐
  this.password = await bcrypt.hash(this.password, salt); // 加密密码
  next();
});

// 密码比对
userSchema.methods.matchPassword = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

// 创建 User 模型
const User = mongoose.model<IUser>("User", userSchema);

export default User;
