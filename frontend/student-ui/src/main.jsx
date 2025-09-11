import React from "react";
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ConfigProvider, theme } from "antd";
import trTR from "antd/locale/tr_TR";
import "antd/dist/reset.css";
import "./global.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ConfigProvider locale={trTR} theme={{algorithm: theme.darkAlgorithm, token: { borderRadius: 8 } }}>
      <App />
    </ConfigProvider>
  </React.StrictMode>
);