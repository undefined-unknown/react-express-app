# 三. 构建 API 服务的数据存储与操作

### 1. **选择数据库和配置连接**

在这一部分，我们使用 **MongoDB** 作为数据库。MongoDB 是一个 NoSQL 数据库，非常适合存储 JSON 格式的数据。

#### 1.1 安装 Mongoose

首先，我们需要安装 `mongoose`（MongoDB 的 ODM）来简化与 MongoDB 的交互：

```sql
npm install mongoose
```

#### 1.2 连接到 MongoDB

在 `src/app.ts` 中，我们首先要连接到 MongoDB 数据库。假设我们使用本地的 MongoDB 实例（`mongodb://``localhost:27017`），并创建一个名为 `express-ts-app` 的数据库。

```sql
import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import userRoutes from './routes/userRoutes';

const app = express();

// 连接到 MongoDB
mongoose.connect('mongodb://localhost:27017/express-ts-app', {
    useNewUrlParser: true, // mongoose@6以上版本均已默认配置，无需显式
    useUnifiedTopology: true,// mongoose@6以上版本均已默认配置
})
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.log('Failed to connect to MongoDB', err));

// 使用 JSON 中间件，解析请求体中的 JSON 数据
app.use(express.json());

// 挂载路由
app.use('/api', userRoutes);

// 基本路由
app.get('/', (req: Request, res: Response) => {
    res.send('Welcome to the Express API with TypeScript!');
});

// 启动服务器
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
```

### 2. **定义 Mongoose 数据模型**

在 **Mongoose** 中，我们使用 `Schema` 来定义数据的结构，并通过 `Model` 来进行数据操作。假设我们需要存储用户的信息（例如：`name`, `email`, `age`）。

#### 2.1 创建 `userSchema` 和 `User` 模型

在 `src/routes/userRoutes.ts` 中，我们首先定义一个用户模型：

```sql
import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';

// 定义 User Schema
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    age: { type: Number, required: true },
}, {
    timestamps: true, // 自动创建 createdAt 和 updatedAt 字段
});

// 创建 User 模型
const User = mongoose.model('User', userSchema);

const router = Router();

// 获取所有用户
router.get('/users', async (req: Request, res: Response) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch users' });
    }
});

// 获取单个用户
router.get('/users/:id', async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch user' });
    }
});

// 创建新用户
router.post('/users', async (req: Request, res: Response) => {
    const { name, email, age } = req.body;
    try {
        const newUser = new User({ name, email, age });
        await newUser.save();
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create user', error });
    }
});

// 更新用户信息
router.put('/users/:id', async (req: Request, res: Response) => {
    const { name, email, age } = req.body;
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { name, email, age },
            { new: true }
        );
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update user', error });
    }
});

// 删除用户
router.delete('/users/:id', async (req: Request, res: Response) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete user', error });
    }
});

export default router;
```

### 3. **数据存储与操作**

#### 3.1 创建用户 (`POST`)

在 `POST /users` 路由中，我们从请求体中获取 `name`, `email`, 和 `age` 字段，然后创建一个新的用户并保存到数据库中：

```sql
router.post('/users', async (req: Request, res: Response) => {
    const { name, email, age } = req.body;
    try {
        const newUser = new User({ name, email, age });
        await newUser.save();
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create user', error });
    }
});
```

- 使用 `new User({})` 创建一个新的用户实例。
- 使用 `save()` 方法保存用户数据到 MongoDB 数据库。

#### 3.2 获取所有用户 (`GET`)

在 `GET /users` 路由中，我们获取所有的用户记录：

```sql
router.get('/users', async (req: Request, res: Response) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch users' });
    }
});
```

- 使用 `User.find()` 查找数据库中的所有用户记录。

#### 3.3 获取单个用户 (`GET`)

在 `GET /users/:id` 路由中，我们根据 `id` 获取单个用户：

```sql
router.get('/users/:id', async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch user' });
    }
});
```

- 使用 `User.findById()` 根据 `id` 查找指定用户。

#### 3.4 更新用户 (`PUT`)

在 `PUT /users/:id` 路由中，我们根据 `id` 更新指定用户的信息：

```sql
router.put('/users/:id', async (req: Request, res: Response) => {
    const { name, email, age } = req.body;
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { name, email, age },
            { new: true } // 返回更新后的用户对象
        );
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update user', error });
    }
});
```

- 使用 `User.findByIdAndUpdate()` 根据 `id` 更新用户数据。

#### 3.5 删除用户 (`DELETE`)

在 `DELETE /users/:id` 路由中，我们根据 `id` 删除用户：

```sql
router.delete('/users/:id', async (req: Request, res: Response) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete user', error });
    }
});
```

- 使用 `User.findByIdAndDelete()` 根据 `id` 删除用户。

### 4. **测试与验证**

你可以使用 Postman 或其他工具来测试这些 API 接口，确保所有的增、删、改、查操作都能正常工作。

---

### 总结

通过这一部分，你已经学习了如何：

1. 配置 MongoDB 和 Mongoose，连接数据库。
2. 使用 Mongoose 定义数据模型和进行数据存储。
3. 在 Express 中实现 CRUD 操作，并将数据保存到数据库。
4. 测试和验证/routes/userRoutes.ts `中，创建一个` User` 模型：

```sql
import mongoose from 'mongoose';

// 定义 User Schema
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    age: { type: Number, required: true },
}, {
    timestamps: true // 自动创建 createdAt 和 updatedAt 字段
});

// 创建 User 模型
const User = mongoose.model('User', userSchema);

export default User;
```

- `userSchema`：定义了用户的属性（`name`, `email`, `age`）和它们的类型。
- `timestamps: true`：表示自动添加 `createdAt` 和 `updatedAt` 字段，分别记录创建和更新时间。

### 3. **数据存储与操作**

现在，我们可以基于 Mongoose 提供的模型，执行各种数据库操作：**创建**、**查询**、**更新**、**删除**。

#### 3.1 创建用户（POST 请求）

我们先来看看如何在 `userRoutes.ts` 中处理 **创建用户**（`POST` 请求）。

```sql
import { Router, Request, Response } from 'express';
import User from '../models/User';

const router = Router();

// 创建新用户
router.post('/users', async (req: Request, res: Response) => {
    const { name, email, age } = req.body;
    
    try {
        const newUser = new User({ name, email, age });
        await newUser.save(); // 保存新用户到数据库
        res.status(201).json(newUser); // 返回成功创建的用户信息
    } catch (error) {
        res.status(500).json({ message: 'Failed to create user', error });
    }
});

export default router;
```

- 我们从请求体中解构出用户的 `name`, `email`, 和 `age`，并创建一个新的 `User` 实例。
- 使用 `newUser.save()` 方法将用户数据保存到 MongoDB 中。
- `res.status(201)`：HTTP 201 表示资源已成功创建。

#### 3.2 查询所有用户（GET 请求）

接下来，我们处理 **获取所有用户** 的请求（`GET` 请求）。

```sql
router.get('/users', async (req: Request, res: Response) => {
    try {
        const users = await User.find(); // 获取所有用户
        res.json(users); // 返回用户列表
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch users', error });
    }
});
```

- `User.find()`：查询 MongoDB 中的所有用户。
- 返回所有用户信息作为响应。

#### 3.3 查询单个用户（GET 请求）

接下来，处理 **获取单个用户** 的请求（`GET /users/:id`）。

```sql
router.get('/users/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const user = await User.findById(id); // 根据用户 ID 查找用户
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user); // 返回找到的用户信息
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch user', error });
    }
});
```

- `User.findById(id)`：根据用户 ID 查询 MongoDB 中的单个用户。

#### 3.4 更新用户（PUT 请求）

我们接着处理 **更新用户** 的请求（`PUT /users/:id`）。

```sql
router.put('/users/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, email, age } = req.body;
    
    try {
        const updatedUser = await User.findByIdAndUpdate(
            id,
            { name, email, age }, // 更新内容
            { new: true } // 返回更新后的文档
        );
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(updatedUser); // 返回更新后的用户信息
    } catch (error) {
        res.status(500).json({ message: 'Failed to update user', error });
    }
});
```

- `User.findByIdAndUpdate()`：根据用户 ID 更新用户信息。`{ new: true }` 确保返回更新后的文档。

#### 3.5 删除用户（DELETE 请求）

最后，处理 **删除用户** 的请求（`DELETE /users/:id`）。

```sql
router.delete('/users/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    
    try {
        const deletedUser = await User.findByIdAndDelete(id); // 根据用户 ID 删除用户
        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' }); // 返回删除成功消息
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete user', error });
    }
});
```

- `User.findByIdAndDelete(id)`：根据用户 ID 删除用户。

### 4. **数据库操作总结**

到此为止，我们完成了以下数据操作：

1. **创建**：使用 `new User().save()` 创建新用户并保存到数据库。
2. **读取**：使用 `User.find()` 获取所有用户，使用 `User.findById(id)` 获取单个用户。
3. **更新**：使用 `User.findByIdAndUpdate(id, updatedData)` 更新用户信息。
4. **删除**：使用 `User.findByIdAndDelete(id)` 删除用户。

### 5. **测试数据操作**

你可以使用 Postman 或类似工具来测试 API：

- **POST** 请求：`POST /api/users` 创建新用户
- **GET** 请求：`GET /api/users` 获取所有用户，`GET /api/users/:id` 获取单个用户
- **PUT** 请求：`PUT /api/users/:id` 更新用户
- **DELETE** 请求：`DELETE /api/users/:id` 删除用户

### 总结

到此为止，你已经学会了如何使用 **Mongoose** 与 **MongoDB** 配合，构建一个完整的 API 服务。你学会了：

- 如何定义 Mongoose 数据模型。
- 如何通过 Mongoose 进行基本的数据库操作（CRUD）。
- 如何通过 Express 路由来处理数据库请求。

你可以在此基础上扩展更复杂的功能，例如：

- **数据验证**（例如使用 `Joi` 或 `express-validator`）
- **分页和排序**。
- **身份验证与授权**（例如使用 JWT）
