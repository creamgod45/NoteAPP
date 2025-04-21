import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

import App from "./App";

// 獲取根元素並進行空值檢查
const rootElement = document.getElementById("root");

if (rootElement) {
    // 創建 React 根元素
    const root = createRoot(rootElement);

    // 渲染應用
    root.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
} else {
    console.error("無法找到 ID 為 'root' 的元素");
}
