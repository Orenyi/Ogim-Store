import { Navigate, Route, Routes } from "react-router-dom";

import StoreLayout from "./components/layout/StoreLayout";
import Homepage from "./pages/Homepage";
import ShopPage from "./pages/ShopPage";
import SearchResultsPage from "./pages/SearchResultsPage";
// import ComponentPreview from "./pages/ComponentPreview";
// import NavbarPreview from "./pages/NavbarPreview";

export default function App() {
  return (
    <Routes>
      <Route element={<StoreLayout />}>
        <Route path="/" element={<Homepage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="search" element={<SearchResultsPage />} />

        {/* Keep these preview routes temporarily if you still use them.
        <Route path="/component-preview" element={<ComponentPreview />} />
        <Route path="/navbar-preview" element={<NavbarPreview />} /> */}

        {/* Unknown URLs return to the homepage for now. */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
