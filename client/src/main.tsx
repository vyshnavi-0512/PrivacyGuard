import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";
import { trackEvent } from "@/lib/analytics";
window.addEventListener("error", (event) => {
  console.log("GLOBAL ERROR CAUGHT", event);

  trackEvent("error", window.location.pathname, {
    source: "privacyguard",
    message: event.message,
  });
});
window.addEventListener("unhandledrejection", (event) => {
  console.log("PROMISE ERROR CAUGHT", event);

  trackEvent("error", window.location.pathname, {
    source: "privacyguard",
    message: String(event.reason),
  });
});
createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <App />
  </AuthProvider>
);
