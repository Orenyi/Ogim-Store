import { Outlet } from "react-router-dom";

import AnnouncementBar from "./AnnouncementBar";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function StoreLayout() {
  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
}
