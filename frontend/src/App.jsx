import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SidebarMenu from "./pages/components/sidebar";
import Dashboard from "./pages/dashboard";
import AddService from "./services/addService";
import PingCheck from "./pages/components/pingCheck";
import Navbar from "./pages/components/navbar";
import Footer from "./pages/components/footer";

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <BrowserRouter>
      <div className="flex h-screen flex-col bg-gray-50">
        <Navbar toggleSidebar={toggleSidebar} />

        <div className="flex flex-1 overflow-hidden">
          <SidebarMenu isOpen={isSidebarOpen} />

          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 via-sky-100 to-gray-50 p-6">
              <Routes>
                <Route path="/dashboard/health" element={<Dashboard viewType="health" />} />

                <Route path="/dashboard/ping" element={<Dashboard viewType="ping" />} />

                <Route path="/add" element={<AddService />} />
                <Route path="/ping-check" element={<PingCheck />} />

                <Route path="/" element={<Dashboard viewType="health" />} />
              </Routes>
            </div>
            <Footer />
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}