
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { GoogleOAuthProvider } from "@react-oauth/google";

import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";

import "./index.css";
import "react-toastify/dist/ReactToastify.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider
      clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
    >
      <BrowserRouter>
        <AuthProvider>
          <App />

          <ToastContainer
            position="top-right"
            autoClose={3000}
            newestOnTop
            closeOnClick
            pauseOnHover
            theme="light"
          />
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </StrictMode>
);
