import { Link, useLocation } from "react-router-dom";
import { Heart, Radio } from "lucide-react";

export default function SidebarMenu({ isOpen }) {
  const location = useLocation();

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path);

  return (
    <div
      className={`${isOpen ? "w-64" : "w-0"
        } bg-gradient-to-b from-slate-800 to-slate-900 text-white flex flex-col transition-all duration-300 overflow-hidden shadow-xl`}
    >
      <div className="flex-1 flex flex-col gap-2 p-4">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 py-2">Menu</p>
        <Link
          to="/dashboard/health"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive("/dashboard/health")
              ? "bg-sky-300 text-white shadow-lg"
              : "text-slate-300 hover:bg-slate-700 hover:text-white"
            }`}
        >
          <Heart size={20} />
          <span className="font-medium">Health Status</span>
        </Link>
        <Link
          to="/dashboard/ping"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive("/dashboard/ping")
              ? "bg-sky-300 text-white shadow-lg"
              : "text-slate-300 hover:bg-slate-700 hover:text-white"
            }`}
        >
          <Radio size={20} />
          <span className="font-medium">Ping History</span>
        </Link>
      </div>
    </div>
  );
}
