import { createRoot } from "react-dom/client";
import { ThemeProvider } from "next-themes";
import App from "./App.tsx";
import "./index.css";
import { installGlobalErrorHandlers } from "./lib/errorLogger";
import { initSentry } from "./lib/sentry";

initSentry();
installGlobalErrorHandlers();

createRoot(document.getElementById("root")!).render(
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
    <App />
  </ThemeProvider>
);
