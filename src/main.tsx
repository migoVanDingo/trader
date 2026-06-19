import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { themeStyleSheet } from "./theme";
import "./styles/index.css";

// Inject the theme CSS variables (generated from the single source in theme.ts)
// before first paint so there's no flash of unstyled content.
const themeStyle = document.createElement("style");
themeStyle.id = "theme-vars";
themeStyle.textContent = themeStyleSheet();
document.head.appendChild(themeStyle);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
