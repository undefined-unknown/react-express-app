# 一. 搭建 Typescript 的 Express 项目

### 1. **安装 TypeScript 和相关依赖**

首先，确保你已经安装了 Node.js。如果还没有，请按照上面的步骤进行安装。

在项目根目录下初始化项目：

```sql
mkdir express-ts-app
cd express-ts-app
npm init -y
```

然后安装 TypeScript 及相关依赖：

```sql
npm install typescript @types/node @types/express express
```

- `typescript`：TypeScript 编译器
- `@types/node`：Node.js 的类型定义
- `@types/express`：Express 的类型定义
- `express`：Express 库

### 2. **配置 TypeScript**

创建一个 `tsconfig.json` 文件，配置 TypeScript 编译选项：

```sql
npx tsc --init
```

修改 `tsconfig.json` 文件，确保以下配置项正确（关键是设置 `target` 和 `moduleResolution`）：

```sql
{
  "compilerOptions": {
    "target": "ES6",
    "moduleResolution": "node",
    "outDir": "./dist",
    "rootDir": "./src",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- `outDir`：编译后的 JavaScript 文件存放目录
- `rootDir`：TypeScript 源代码目录

### 3. **创建项目结构**

创建以下项目文件结构：

```sql
express-ts-app/
├── node_modules/
├── src/
│   └── app.ts
├── tsconfig.json
├── package.json
└── package-lock.json
```

### 4. **编写 Express 应用代码**

在 `src/app.ts` 中编写 TypeScript 版本的 Express 应用：

```sql
import express, { Request, Response } from 'express';

const app = express();

// 基本路由
app.get('/', (req: Request, res: Response) => {
    res.send('Hello, Express with TypeScript!');
});

// 处理 GET 请求
app.get('/get-data', (req: Request, res: Response) => {
    res.send('GET request received');
});

// 处理 POST 请求
app.post('/post-data', (req: Request, res: Response) => {
    res.send('POST request received');
});

// 启动服务器，监听 3000 端口
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
```

这里使用了 TypeScript 的类型注解：

- `Request` 和 `Response` 来标注请求和响应对象的类型。
- `express()` 返回一个 Express 实例，它会根据 TypeScript 类型推导出相应的类型。

### 5. **编译 TypeScript 代码**

在终端中运行以下命令编译 TypeScript 代码：

```sql
npx tsc
```

这会将 TypeScript 代码编译到 `dist` 目录中。

### 6. **运行应用**

使用 Node.js 运行编译后的 JavaScript 文件：

```sql
node dist/app.js
```

打开浏览器，访问 `http://localhost:3000`，你应该会看到 `Hello, Express with TypeScript!` 的响应。

### 7. **使用 nodemon 自动重载（可选）**

如果你希望在修改 TypeScript 代码时自动重新启动应用，可以使用 `nodemon` 配合 TypeScript：

安装 `nodemon` 和 `ts-node`：

```sql
npm install nodemon ts-node
```

在 `package.json` 中添加一个启动脚本：

```sql
{
  "scripts": {
    "dev": "nodemon --exec ts-node src/app.ts"
  }
}
```

然后运行以下命令启动开发模式：

```sql
npm run dev
```

现在，每次修改 `src/app.ts` 文件后，`nodemon` 会自动重新启动应用。

### 8. **添加更多功能（中间件、路由等）**

你可以继续使用 TypeScript 来扩展应用，例如添加中间件、解析请求体、处理路由等。

- **中间件示例**：

```sql
app.use(express.json()); // 解析 JSON 请求体
app.use(express.urlencoded({ extended: true })); // 解析 URL 编码的请求体
```

- **路由示例**：

```sql
app.get('/user/:id', (req: Request, res: Response) => {
    const userId = req.params.id;
    res.send(`User ID: ${userId}`);
});

app.get('/search', (req: Request, res: Response) => {
    const { name, age } = req.query;
    res.send(`Search results for ${name}, age: ${age}`);
});
```

---

### 总结

通过这些步骤，你已经成功创建了一个使用 TypeScript 的 Express 应用，并掌握了以下内容：

- 如何设置 TypeScript 项目并配置 `tsconfig.json`。
- 如何使用 TypeScript 编写 Express 应用代码，并正确类型化请求和响应。
- 如何使用 `nodemon` 和 `ts-node` 实现自动重载功能。
- 如何处理常见的路由和请求类型。
