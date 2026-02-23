import React from "react";
import { Menu } from "lucide-react";

function Navbar({ toggleSidebar }) {
  return (
    <nav className="bg-gradient-to-r from-sky-300 to-sky-500 text-white shadow-lg">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <button
            className="lg:hidden p-2 hover:bg-sky-200 rounded-lg transition"
            onClick={toggleSidebar}
            title="Toggle sidebar"
          >
            <Menu size={24} />
          </button>
          <div className="hidden lg:flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-sky-300">
              <span className="text-xl font-bold">🔍</span>
            </div>
            <h1 className="text-2xl font-bold">Health Monitor</h1>
          </div>
        </div>
        <div className="text-sm text-sky-100">Service Health Monitoring Dashboard</div>
      </div>
    </nav>
  );
}

export default Navbar;
