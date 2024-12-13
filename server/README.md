# 六. 日志与错误管理

接下来我们来探讨 **日志与错误管理**，这是确保你的 Node.js 应用在生产环境中稳定运行的关键组成部分。日志和错误管理不仅能够帮助你在开发过程中调试和排查问题，还能够在应用发布后帮助你监控和维护服务的健康。

### 1. **日志管理**

日志是记录应用运行状态的重要工具，能够帮助开发人员和运维人员理解应用的行为并排查故障。为了避免大量冗长且混乱的日志输出，我们通常采用一些日志管理工具来格式化、存储和管理日志。

#### 1.1 使用 `winston` 进行日志记录

`winston` 是一个流行的 Node.js 日志库，提供了多种日志记录方式，如输出到控制台、文件、远程服务器等。我们将使用 `winston` 来实现日志记录。

**安装 \*\***winston\***\*：**

```sql
npm install winston
```

**配置和使用 \*\***winston\***\*：**

```sql
import winston from 'winston';

// 创建日志传输器
const logFormat = winston.format.printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level}]: ${message}`;
});

const logger = winston.createLogger({
    level: 'info', // 日志级别（info、warn、error、debug）
    format: winston.format.combine(
        winston.format.timestamp(), // 添加时间戳
        logFormat
    ),
    transports: [
        // 控制台输出
        new winston.transports.Console(),
        // 文件输出（日志文件大小达到 5MB 时会自动轮转）
        new winston.transports.File({ filename: 'logs/app.log', maxsize: 5242880 })
    ],
});

export default logger;
```

- `winston.createLogger`：创建一个日志记录器。
- `transports`：定义日志输出的方式，支持控制台输出、文件输出、远程传输等。
- `format`：定义日志的格式，包括时间戳、日志级别等。
- `maxsize`：文件日志大小的上限，达到这个大小会自动生成新的日志文件。

#### 1.2 记录日志

在你的应用中，你可以使用 `logger` 来记录不同级别的日志。

```sql
import express from 'express';
import logger from './utils/logger';

const app = express();

// 示例 API 路由
app.get('/api', (req, res) => {
    logger.info('API endpoint /api accessed');
    res.send('Hello World');
});

// 捕获错误的日志记录
app.use((err, req, res, next) => {
    logger.error(`Error occurred: ${err.message}`);
    res.status(500).send('Something went wrong!');
});

app.listen(3000, () => {
    logger.info('Server started on port 3000');
});
```

- **logger.info**：记录普通的信息日志。
- **logger.error**：记录错误日志。
- **logger.warn**：记录警告日志。
- **logger.debug**：记录调试日志，适用于开发阶段。

#### 1.3 使用日志等级

日志记录的级别通常包括：

- **info**：记录常规信息，如请求日志。
- **warn**：记录警告信息，如潜在问题。
- **error**：记录错误信息，帮助开发者或运维人员诊断问题。
- **debug**：记录调试信息，通常用于开发阶段，便于排查问题。

在生产环境中，通常将日志级别设置为 `info` 或 `warn`，而在开发环境中，可以设置为 `debug` 以获得更多的调试信息。

### 2. **错误管理**

错误管理是确保应用在出现问题时能够适当处理和响应用户请求的关键。合理的错误处理不仅可以提高用户体验，还能帮助你更快地定位和修复问题。

#### 2.1 使用 `try/catch` 处理同步和异步错误

JavaScript 中的异步函数（例如，使用 `async/await` 的函数）需要使用 `try/catch` 来捕获潜在的错误。

**同步错误示例：**

```sql
app.get('/error', (req, res) => {
    try {
        // 可能会抛出错误的代码
        throw new Error('Something went wrong!');
    } catch (err) {
        logger.error(`Error occurred: ${err.message}`);
        res.status(500).send('Internal Server Error');
    }
});
```

**异步错误示例：**

对于异步代码，建议使用 `try/catch` 来捕获错误，或者使用 `.catch()` 处理 Promises 的异常。

```sql
app.get('/async-error', async (req, res) => {
    try {
        const result = await someAsyncFunction();
        res.send(result);
    } catch (err) {
        logger.error(`Async error occurred: ${err.message}`);
        res.status(500).send('Internal Server Error');
    }
});
```

#### 2.2 错误处理中间件

Express 提供了一个专门用于处理错误的中间件，可以用来集中处理所有未捕获的错误。错误处理中间件的定义需要在所有路由之后和其他中间件之前。

```sql
// 错误处理中间件
app.use((err, req, res, next) => {
    logger.error(`Uncaught error: ${err.message}`);
    res.status(500).json({ message: 'Something went wrong!' });
});
```

- 该中间件会捕获所有未被显式捕获的错误，并记录到日志中。
- 返回一个 500 状态码给用户，表示服务器出现了问题。

#### 2.3 捕获未处理的 Promise Rejections 和未捕获的异常

Node.js 在 15.x 版本以后默认会抛出一个 `unhandledRejection` 和 `uncaughtException` 事件。为了确保应用在生产环境中尽量不崩溃，我们可以监听这些事件，并记录错误日志。

```sql
process.on('unhandledRejection', (reason, promise) => {
    logger.error(`Unhandled rejection at: ${promise}, reason: ${reason}`);
    process.exit(1); // 非正常退出，触发进程崩溃重启（如使用 PM2 进行进程管理）
});

process.on('uncaughtException', (error) => {
    logger.error(`Uncaught exception: ${error.message}`);
    process.exit(1); // 非正常退出
});
```

- **unhandledRejection**：捕获未处理的 `Promise` 异常。
- **uncaughtException**：捕获未处理的同步异常。

在生产环境中，当发生这类错误时，我们通常会选择 **退出进程**（通过 `process.exit(1)`）并使用进程管理工具（如 **PM2**）自动重启服务。这样可以防止应用长时间处于不稳定状态。

### 3. **错误日志与监控**

除了记录错误日志外，错误监控是一个更为重要的环节。借助于一些日志聚合工具或监控平台（如 **Sentry**、**Loggly**、**Datadog** 等），可以将日志和错误数据实时发送到远程系统中进行集中管理和监控。

#### 3.1 集成 `Sentry` 错误监控

Sentry 是一个强大的错误监控平台，可以实时捕获和追踪应用中的错误，并提供详细的错误堆栈信息。

**安装 Sentry SDK：**

```sql
npm install @sentry/node
```

**集成 Sentry：**

```sql
import * as Sentry from '@sentry/node';

Sentry.init({ dsn: 'https://<your-dsn>@sentry.io/<project-id>' });

app.use((err, req, res, next) => {
    logger.error(`Unhandled error: ${err.message}`);
    Sentry.captureException(err);  // 将异常发送到 Sentry
    res.status(500).send('Something went wrong!');
});
```

- 使用 `Sentry.captureException(err)` 将捕获到的错误发送到 Sentry 进行监控。
- Sentry 会提供错误的详细堆栈信息、请求的上下文数据，帮助开发人员更快地定位问题。

### 4. **总结**

在构建高可用、易于维护的应用时，良好的 **日志记录** 和 **错误管理** 是非常重要的。以下是关键点总结：

1. **日志记录**：

   - 使用 `winston` 记录不同级别的日志。
   - 通过日志可以追踪应用的行为和运行状态。
   - 可以将日志输出到控制台和文件中，支持日志轮转。

2. **错误管理**：

   - 使用 `try/catch` 处理同步和异步错误。
   - 创建全局错误处理中间件，集中管理错误。
   - 捕获未处理的 `Promise` 异常和未捕获的同步异常。

3. **监控与警报**：

   - 集成 Sentry 或其他监控平台，实时捕获和跟踪应用中的错误。
   - 在生产环境中，及时处理并报告错误，避免崩溃。
