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
    <div className="app-shell flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-950/80 animate-fade-in-up">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 animate-slide-in-left" style={{ animationDelay: "0.1s" }}>
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center shadow-lg shadow-cyan-500/25">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                  Echo
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Workspace Suite
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3 animate-slide-in-right" style={{ animationDelay: "0.15s" }}>
              <div className="hidden sm:flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                <User className="w-4 h-4" />
                <span className="font-semibold">{user?.name}</span>
              </div>
                <button
                  onClick={toggleTheme}
                className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all text-slate-600 dark:text-slate-300"
                  title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                >
                  {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                </button>
                <button
                  onClick={handleLogout}
                className="p-2.5 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-xl transition-all text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
            </div>
          </div>

          <nav className="mt-3 overflow-x-auto no-scrollbar animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <div className="inline-flex min-w-full md:min-w-fit items-center gap-1 rounded-2xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200 text-sm font-semibold animate-scale-in ${
                    isActive
                      ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`
                }
                style={{ animationDelay: "0.25s" }}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </NavLink>

              <NavLink
                to="/blog"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200 text-sm font-semibold animate-scale-in ${
                    isActive
                      ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`
                }
                style={{ animationDelay: "0.3s" }}
              >
                <BookOpen className="w-4 h-4" />
                <span>Blog</span>
              </NavLink>

              <NavLink
                to="/notes"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200 text-sm font-semibold animate-scale-in ${
                    isActive
                      ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`
                }
                style={{ animationDelay: "0.35s" }}
              >
                <StickyNote className="w-4 h-4" />
                <span>Notes</span>
              </NavLink>

              <NavLink
                to="/chat"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200 text-sm font-semibold animate-scale-in ${
                    isActive
                      ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`
                }
                style={{ animationDelay: "0.4s" }}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Chat</span>
              </NavLink>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}