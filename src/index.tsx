import React from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import App from "./App";
import { AuthProvider } from "./contexts/AuthContext";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error('Failed to find the root element');
const root = createRoot(rootElement);

root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);