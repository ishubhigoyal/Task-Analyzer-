import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Briefcase, 
  CheckSquare, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  User as UserIcon
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuthStore } from "../store/useAuthStore";
import api from "../api/api";

const SidebarItem = ({ to, icon: Icon, label, active }: any) => (
  <Link to={to}>
    <div className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
      active ? "bg-indigo-600/10 text-indigo-400 border border-indigo-600/20" : "text-slate-400 hover:text-slate-100 hover:bg-slate-800"
    }`}>
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </div>
  </Link>
);

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      logout();
    } catch (e) {
      console.error(e);
      logout();
    }
  };

  const menuItems = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/projects", icon: Briefcase, label: "Projects" },
    { to: "/tasks", icon: CheckSquare, label: "My Tasks" },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900 shrink-0">
        <div className="p-6 flex items-center gap-3">
          <div className="h-8 w-8 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
            <div className="h-4 w-4 border-2 border-white rounded-sm"></div>
          </div>
          <span className="text-white font-bold text-xl tracking-tight uppercase">TeamTask</span>
        </div>

        <nav className="flex-1 px-4 mt-4 space-y-1">
          {menuItems.map((item) => (
            <SidebarItem 
              key={item.to} 
              {...item} 
              active={location.pathname === item.to || (item.to !== "/dashboard" && location.pathname.startsWith(item.to))} 
            />
          ))}
          {user?.role === "ADMIN" && (
             <SidebarItem to="/members" icon={Users} label="Members" active={location.pathname === "/members"} />
          )}
        </nav>

        <div className="p-6 mt-auto">
          <div className="bg-indigo-600 rounded-2xl p-4 mb-4">
            <p className="text-indigo-100 text-[10px] font-bold mb-1 uppercase tracking-wider">Upgrade to Pro</p>
            <p className="text-white text-xs mb-3">Get unlimited projects and reporting.</p>
            <button className="w-full bg-white text-indigo-600 text-[10px] font-bold py-2 rounded-lg hover:bg-indigo-50 transition-colors">Learn More</button>
          </div>

          <Link to="/profile">
            <div className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all mb-2 ${location.pathname==='/profile'?'bg-indigo-600/10 text-indigo-400 border border-indigo-600/20':'text-slate-400 hover:text-slate-100 hover:bg-slate-800'}`}>
              <UserIcon size={20} />
              <span className="font-medium">Profile</span>
            </div>
          </Link>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-900/20 hover:text-red-400 transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
            />
            <motion.aside 
              initial={{ x: "-100%" }} 
              animate={{ x: 0 }} 
              exit={{ x: "-100%" }}
              className="fixed top-0 left-0 bottom-0 w-64 bg-slate-900 z-50 flex flex-col"
            >
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                    <div className="h-4 w-4 border-2 border-white rounded-sm"></div>
                  </div>
                  <span className="text-white font-bold text-xl tracking-tight uppercase">TeamTask</span>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                  <X />
                </button>
              </div>
              <nav className="flex-1 px-4 mt-4 space-y-1">
                {menuItems.map((item) => (
                  <SidebarItem 
                    key={item.to} 
                    {...item} 
                    active={location.pathname === item.to} 
                  />
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 min-h-0 bg-slate-50">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 sticky top-0 z-20">
          <button onClick={() => setIsOpen(true)} className="lg:hidden text-slate-400 mr-4">
            <Menu />
          </button>
          
          <div className="flex items-center flex-1">
            <div className="relative w-64">
              <input 
                type="text" 
                placeholder="Search tasks or projects..." 
                className="w-full bg-slate-100 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
              <Menu className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 p-1 pr-3 rounded-full hover:bg-slate-50 transition-colors cursor-pointer">
              <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-xs font-bold ring-2 ring-white">
                {user?.fullName.charAt(0)}
              </div>
              <div className="hidden sm:block text-sm">
                <p className="font-semibold text-slate-700 leading-none mb-0.5">{user?.fullName}</p>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider leading-none">{user?.role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Area */}
        <section className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-7xl mx-auto"
          >
            {children}
          </motion.div>
        </section>
      </main>
    </div>
  );
}
