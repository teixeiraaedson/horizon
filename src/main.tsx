import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Enforce dark mode class on the document root to ensure class-based dark tokens always apply.
document.documentElement.classList.add("dark");

createRoot(document.getElementById("root")!).render(<App />);