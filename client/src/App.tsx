import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

import axios from "axios";
import pLimit from "p-limit";

const limit = pLimit(2);

// 模拟的异步任务，延时 1 秒
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// 创建任务队列
const tasks = [
  () => {
    console.log("Task 1 started");
    return delay(1000).then(() => console.log("Task 1 finished"));
  },
  () => {
    console.log("Task 2 started");
    return delay(1000).then(() => console.log("Task 2 finished"));
  },
  () => {
    console.log("Task 3 started");
    return delay(1000).then(() => console.log("Task 3 finished"));
  },
  () => {
    console.log("Task 4 started");
    return delay(1000).then(() => console.log("Task 4 finished"));
  },
  () => {
    console.log("Task 5 started");
    return delay(1000).then(() => console.log("Task 5 finished"));
  },
];

// 限制并发数执行任务
const results = await Promise.all(tasks.map((task) => limit(task)));

console.log("results", results);

function App() {
  const [count, setCount] = useState(0);
  const [token, setToken] = useState();

  async function fetchLimitedData(urls: string[]) {
    console.log(urls);
    const promises = urls.map((url) =>
      limit(() => {
        axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
      })
    );

    try {
      const responses = await Promise.all(promises);
      await Promise.all(responses.map((response) => response));
      // console.log(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  async function login() {
    await axios
      .post("/api/login", {
        email: "k1z_sha@outlook.com",
        password: "_st4JCf6Ala1R4c",
      })
      .then((res) => setToken(res.data.token));
  }

  useEffect(() => {
    login();
  }, []);

  useEffect(() => {
    if (!token) return;
    const urls = [
      "/api/users",
      "/api/users",
      "/api/users",
      "/api/users",
      "/api/users",
    ];
    fetchLimitedData(urls);
  }, [token]);

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
