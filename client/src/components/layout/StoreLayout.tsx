import { Outlet } from "react-router-dom";
import AnnouncementBar from "./AnnouncementBar";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function StoreLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-paper)]">
      <AnnouncementBar />

      <Navbar />

      <main id="main-content" className="flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
