import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/index.css";

const el = document.getElementById("app");
if (!el) throw new Error("Root element #app not found");

createRoot(el).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
