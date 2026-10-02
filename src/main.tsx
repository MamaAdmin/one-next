import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { getConsent, initAnalytics } from "./lib/analytics";

createRoot(document.getElementById("root")!).render(<App />);
if (getConsent() === "granted") void initAnalytics();
