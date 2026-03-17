import { Outlet, NavLink, useNavigate } from "react-router";
import { BookOpen, StickyNote, MessageSquare, Sparkles, LogOut, User, Moon, Sun, LayoutDashboard } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export function Layout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/30">
      {/* Header */}
      <header className="border-b border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Echo
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Create. Organize. Connect.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <nav className="flex gap-2 bg-slate-100/50 dark:bg-slate-800/50 rounded-xl p-1.5">
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all duration-200 ${
                      isActive
                        ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-md shadow-indigo-100 dark:shadow-indigo-900/30"
                        : "hover:bg-white/60 dark:hover:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                    }`
                  }
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="font-medium">Dashboard</span>
                </NavLink>

                <NavLink
                  to="/blog"
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all duration-200 ${
                      isActive
                        ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-md shadow-indigo-100 dark:shadow-indigo-900/30"
                        : "hover:bg-white/60 dark:hover:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                    }`
                  }
                >
                  <BookOpen className="w-4 h-4" />
                  <span className="font-medium">Blog</span>
                </NavLink>

                <NavLink
                  to="/notes"
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all duration-200 ${
                      isActive
                        ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-md shadow-indigo-100 dark:shadow-indigo-900/30"
                        : "hover:bg-white/60 dark:hover:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                    }`
                  }
                >
                  <StickyNote className="w-4 h-4" />
                  <span className="font-medium">Notes</span>
                </NavLink>

                <NavLink
                  to="/chat"
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all duration-200 ${
                      isActive
                        ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-md shadow-indigo-100 dark:shadow-indigo-900/30"
                        : "hover:bg-white/60 dark:hover:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                    }`
                  }
                >
                  <MessageSquare className="w-4 h-4" />
                  <span className="font-medium">Chat</span>
                </NavLink>
              </nav>

              {/* Theme Toggle & User Menu */}
              <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-700">
                <button
                  onClick={toggleTheme}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all text-slate-600 dark:text-slate-300"
                  title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                >
                  {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                </button>
                
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200 hidden sm:block">
                    {user?.name}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}