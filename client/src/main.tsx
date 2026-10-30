import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

import App from "./App";
import { ToastProvider } from "./components/ui/ToastProvider";
import "./index.css";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { CheckoutProvider } from "./context/CheckoutContext";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

if (!googleClientId) {
  console.error(
    "VITE_GOOGLE_CLIENT_ID is missing. Add it to your client/.env file.",
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={googleClientId ?? ""}>
      <BrowserRouter>
        <ToastProvider>
          <CartProvider>
            <AuthProvider>
              <CheckoutProvider>
                <App />
              </CheckoutProvider>
            </AuthProvider>
          </CartProvider>
        </ToastProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>,
);
