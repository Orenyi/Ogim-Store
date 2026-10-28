import { Navigate, Route, Routes } from "react-router-dom";

import StoreLayout from "./components/layout/StoreLayout";
import Homepage from "./pages/Homepage";
import ShopPage from "./pages/ShopPage";
import SearchResultsPage from "./pages/SearchResultsPage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import CartPage from "./pages/CartPage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import PasswordResetSuccessPage from "./pages/PasswordResetSuccessPage";
import CheckoutPage from "./pages/CheckoutPage";
import ProtectedRoute from "./components/checkout/ProtectedRoute";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import AccountOverviewPage from "./pages/AccountOverviewPage";
import AccountOrdersPage from "./pages/AccountOrdersPage";
import AccountOrderDetailsPage from "./pages/AccountOrderDetailsPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import FAQPage from "./pages/FAQPage";

export default function App() {
  return (
    <Routes>
      <Route element={<StoreLayout />}>
        <Route path="/" element={<Homepage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/search" element={<SearchResultsPage />} />
        <Route path="/products/:slug" element={<ProductDetailsPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route
          path="/password-reset-success"
          element={<PasswordResetSuccessPage />}
        />
        <Route element={<ProtectedRoute />}>
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route
            path="/checkout/confirmation"
            element={<OrderConfirmationPage />}
          />
        </Route>
        <Route path="/account" element={<AccountOverviewPage />} />
        <Route path="/account" element={<AccountOverviewPage />} />
        <Route path="/account/orders" element={<AccountOrdersPage />} />
        <Route
          path="/account/orders/:orderId"
          element={<AccountOrderDetailsPage />}
        />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/faq" element={<FAQPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
