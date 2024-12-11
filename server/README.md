# 四. 用户认证与权限控制

接下来我们来学习如何实现 **用户认证与权限控制**，具体使用 **JWT（JSON Web Token）** 来完成认证过程。

JWT 是一种非常流行的 **基于令牌的身份验证** 方式，广泛应用于 Web 应用和 RESTful API 中。JWT 的基本思路是通过验证用户的身份生成一个令牌（Token），用户可以通过该令牌进行身份认证，而不需要每次都重新登录。

### 1. **JWT 基本概念**

JWT 是一种简洁的开放标准（RFC 7519），用于在网络应用环境间传递声明。JWT 由三部分组成：

1. **Header**：头部，通常会说明签名算法（例如，HMAC SHA256 或 RSA）。
2. **Payload**：有效载荷，包含声明（如用户信息），但信息不加密。
3. **Signature**：签名，确保数据不被篡改。

#### JWT 的基本结构：

```sql
<Header>.<Payload>.<Signature>
```

例如：

```sql
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

### 2. **JWT 安装与配置**

我们将使用 `jsonwebtoken` 来创建和验证 JWT。首先需要安装相关依赖：

```sql
npm install jsonwebtoken bcryptjs
npm install @types/jsonwebtoken @types/bcryptjs
```

- `jsonwebtoken`：用于生成和验证 JWT。
- `bcryptjs`：用于加密和解密密码。

### 3. **用户注册与登录**

在此步骤中，我们将实现用户注册、登录以及生成 JWT 令牌的过程。

#### 3.1 创建 `User` 模型与密码加密

首先，我们修改 `User` 模型，使其支持密码的加密存储。

```sql
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// 定义 User Schema
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
}, {
    timestamps: true,
});

// 密码加密处理
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10); // 生成盐
    this.password = await bcrypt.hash(this.password, salt); // 加密密码
    next();
});

// 比对密码
userSchema.methods.matchPassword = async function(password: string) {
    return await bcrypt.compare(password, this.password);
};

// 创建 User 模型
const User = mongoose.model('User', userSchema);

export default User;
```

- 在用户注册时，我们会使用 `bcryptjs` 来加密密码。
- `matchPassword` 方法用于验证用户输入的密码与数据库中的密码是否匹配。

#### 3.2 创建注册和登录 API

接下来，我们创建用户的注册和登录接口，使用 JWT 来认证和授权。

在 `src/routes/userRoutes.ts` 中添加以下代码：

```sql
import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const router = Router();

// 注册新用户
router.post('/register', async (req: Request, res: Response) => {
    const { name, email, password } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const newUser = new User({ name, email, password });
        await newUser.save();

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                name: newUser.name,
                email: newUser.email,
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to register user', error });
    }
});

// 用户登录并生成 JWT
router.post('/login', async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const isPasswordMatch = await user.matchPassword(password);
        if (!isPasswordMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // 生成 JWT
        const token = jwt.sign(
            { userId: user._id, name: user.name },
            'your_jwt_secret', // 密钥
            { expiresIn: '1h' } // 设置过期时间为1小时
        );

        res.json({
            message: 'Login successful',
            token,
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to login', error });
    }
});

export default router;
```

- **用户注册**：我们首先检查用户是否已经存在（通过邮箱），如果存在则返回错误。如果用户不存在，我们将其存入数据库，并返回成功消息。
- **用户登录**：我们验证邮箱和密码是否正确。如果正确，我们生成一个 JWT 令牌并返回给用户。

### 4. **JWT 保护路由**

JWT 的一个关键应用是通过令牌保护需要身份验证的 API 路由。用户需要提供有效的 JWT 才能访问这些路由。

#### 4.1 创建认证中间件

我们创建一个中间件函数 `authMiddleware` 来验证 JWT 是否有效。

在 `src/middleware/authMiddleware.ts` 中添加以下代码：

```sql
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
    userId: string;
    name: string;
}

// JWT 认证中间件
const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1]; // 从 Authorization 头中获取 token

    if (!token) {
        return res.status(401).json({ message: 'No token provided, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, 'your_jwt_secret') as JwtPayload; // 验证 token
        req.user = decoded; // 将用户信息挂载到请求对象上
        next(); // 继续处理后续路由
    } catch (error) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

export default authMiddleware;
```

- `authMiddleware`：检查请求头是否带有有效的 JWT。如果有效，则通过 `jwt.verify` 验证令牌，解析出用户信息并挂载到 `req.user` 上。如果没有令牌或令牌无效，则返回 401 错误。

#### 4.2 保护 API 路由

我们可以使用 `authMiddleware` 来保护需要认证的 API 路由。例如，获取当前用户信息的路由。

```sql
import { Router, Request, Response } from 'express';
import authMiddleware from '../middleware/authMiddleware';

const router = Router();

// 获取当前用户信息
router.get('/me', authMiddleware, (req: Request, res: Response) => {
    const user = req.user;
    res.json({
        message: 'User information',
        user,
    });
});

export default router;
```

- 这里的 `GET /me` 路由会被 `authMiddleware` 保护，只有携带有效 JWT 的用户才能访问。
- 用户信息（如 `userId` 和 `name`）会被挂载到 `req.user` 上，我们可以在路由中访问它。

### 5. **测试 JWT 认证**

你可以使用 Postman 来测试这些 API：

1. **注册**：发送 `POST /api/register` 请求，传递用户的 `name`, `email`, 和 `password`。
2. **登录**：发送 `POST /api/login` 请求，使用正确的 `email` 和 `password`，获取 JWT 令牌。
3. **访问保护路由**：发送 `GET /api/me` 请求，在请求头中添加 `Authorization: Bearer <JWT_TOKEN>`，其中 `<JWT_TOKEN>` 是你从登录请求中获取的令牌。

---

### 总结

到此为止，你已经学会了如何使用 **JWT** 完成用户认证与权限控制，包括：

1. **用户注册** 和 **登录**：加密密码并生成 JWT。
2. **JWT 认证中间件**：保护需要身份验证的路由，确保用户通过有效的 JWT 进行访问。
3. **权限控制**：通过验证 JWT 来确定用户身份，并返回相应的用户数据。

这为你的 RESTful API 提供了一个有效的身份验证机制，可以确保只有合法用户才能访问受保护的资源。
