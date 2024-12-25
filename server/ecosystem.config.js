module.exports = {
  apps: [
    {
      name: "express-server",
      script: "dist/app.js",
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "development",
        DB_USERNAME: "zyz82777",
        DB_PASSWORD: "Kevin293.",
        DB_NAME: "react-express-app",
        JWT_SECRET: "your_jwt_secret",
        FLAG: "development",
      },
      env_production: {
        NODE_ENV: "production", // 生产环境的 NODE_ENV 设置
        DB_USERNAME: "zyz82777",
        DB_PASSWORD: "Kevin293.",
        DB_NAME: "react-express-app",
        JWT_SECRET: "your_jwt_secret",
        FLAG: "production",
      },
      env_test: {
        NODE_ENV: "test",
        DB_USERNAME: "zyz82777",
        DB_PASSWORD: "Kevin293.",
        DB_NAME: "react-express-app",
        JWT_SECRET: "your_jwt_secret",
        FLAG: "test",
      },
    },
  ],
};
