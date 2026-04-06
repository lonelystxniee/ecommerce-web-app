import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./index.css";
import App from "./App.jsx";
import { setupFetchInterceptor } from "./utils/fetchInterceptor";

// Kích hoạt interceptor cho window.fetch toàn cầu
setupFetchInterceptor();

const clientId =
  import.meta.env.VITE_GOOGLE_CLIENT_ID || "your_google_client_id_here";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
);
