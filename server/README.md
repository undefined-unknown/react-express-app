# 二. 构建 RESTful API 服务

### 1. **理解 RESTful API 设计原则**

**REST（Representational State Transfer）** 是一种架构风格，用于设计网络应用程序的通信方式。设计 RESTful API 时，主要遵循以下几个原则：

- **资源导向**：每个 URL 都代表一个资源（例如，`/users` 代表用户资源，`/products` 代表产品资源）。
- **HTTP 方法**：使用标准的 HTTP 方法来处理资源：

  - `GET`：获取资源
  - `POST`：创建新资源
  - `PUT`：更新现有资源
  - `DELETE`：删除资源

- **无状态性**：每个请求都应该包含足够的信息，服务器不应在请求之间保存任何状态。
- **路径设计**：路径应该是名词，并且尽量简洁。路径中的单数和复数需要统一。

### 2. **创建 RESTful API 路由**

首先，我们继续在 TypeScript 中使用 Express，设计一个简单的用户管理系统，具备增、删、改、查（CRUD）功能。

#### 2.1 创建文件结构

假设我们在 `src` 目录下创建一个 `routes` 目录，用于存放路由文件。

```sql
express-ts-app/
├── node_modules/
├── src/
│   ├── routes/
│   │   └── userRoutes.ts
│   ├── app.ts
├── tsconfig.json
├── package.json
```

#### 2.2 安装依赖

在开发环境中，我们还需要安装一个数据库，这里我们选择使用 **MongoDB** 和 **Mongoose**（一个 MongoDB 的对象建模工具）：

```sql
npm install mongoose
```

然后在 `src/app.ts` 中，我们需要连接到 MongoDB 数据库。

#### 2.3 编写 API 路由代码

1. 创建 `userRoutes.ts` 文件

```sql
import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';

// 定义 User Schema
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    age: Number
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
        res.status(500).json({ message: 'Failed to create user' });
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
        res.status(500).json({ message: 'Failed to update user' });
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
        res.status(500).json({ message: 'Failed to delete user' });
    }
});

export default router;
```

1. 在 `app.ts` 中引入并使用路由

在 `app.ts` 文件中，我们需要连接数据库，并将路由挂载到应用上。

```sql
import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import userRoutes from './routes/userRoutes';

const app = express();

// 连接到 MongoDB
mongoose.connect('mongodb://localhost:27017/express-ts-app', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
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

### 3. **测试 API**

#### 3.1 运行应用

你可以通过以下命令启动应用：

```sql
npm run dev
```

然后，你可以使用 Postman 或任何其他的 API 测试工具来测试以下 API 路由：

- **GET \*\***/api/users\*\*：获取所有用户
- **GET \*\***/api/users/:id\*\*：获取单个用户，替换 `:id` 为有效的用户 ID
- **POST \*\***/api/users\*\*：创建一个新用户，提交 JSON 数据（如：`{ "name": "John", "email": "john@example.com", "age": 30 }`）
- **PUT \*\***/api/users/:id\*\*：更新用户信息，提交 JSON 数据
- **DELETE \*\***/api/users/:id\*\*：删除用户，替换 `:id` 为有效的用户 ID

#### 3.2 测试示例（Postman）

1. **POST 请求**：

   - URL: `http://localhost:3000/api/users`
   - Body (JSON):

   ```sql

   ```

{
"name": "Alice",
"email": "alice@example.com",
"age": 28
}

````

2. **GET 请求**：
	- URL: `http://localhost:3000/api/users`

3. **PUT 请求**：
	- URL: `http://localhost:3000/api/users/{userId}`
	- Body (JSON):
	```sql
{
    "name": "Updated Name",
    "email": "updated@example.com",
    "age": 29
}
````

4. **DELETE 请求**：
   - URL: `http://localhost:3000/api/users/{userId}`

---

### 总结

通过这一部分，你已经学习了如何：

1. 使用 TypeScript 和 Express 构建 RESTful API。
2. 创建 CRUD 操作（创建、读取、更新、删除）以管理资源（如用户）。
3. 使用 MongoDB 和 Mongoose 进行数据存储与操作。
4. 测试和调试 API 路由。

你可以根据实际需求扩展此 API，例如加入分页、排序、数据验证等功能，或者实现用户身份验证等。
