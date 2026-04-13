import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
  ArrowRight,
  BookOpen,
  Check,
  MessageSquare,
  Moon,
  Sparkles,
  StickyNote,
  Sun,
  Workflow,
} from "lucide-react";

export function LandingPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, signup } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      let success = false;
      if (isLogin) {
        success = await login(email, password);
        if (!success) {
          setError("Invalid email or password");
        }
      } else {
        if (!name.trim()) {
          setError("Name is required");
          return;
        }
        success = await signup(email, password, name);
        if (!success) {
          setError("An account with this email already exists");
        }
      }

      if (success) {
        navigate("/dashboard");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: BookOpen,
      title: "Publishing",
      description: "Long-form writing tools with structured storytelling layouts.",
    },
    {
      icon: StickyNote,
      title: "Knowledge Base",
      description: "Rich notes, collaboration, and searchable context in one workspace.",
    },
    {
      icon: MessageSquare,
      title: "Messaging",
      description: "Fast communication with clean, focused conversation design.",
    },
  ];

  const benefits = [
    "Unified tools for writing, notes, and communication",
    "Deliberate visual system designed for clarity",
    "Secure identity flow with session persistence",
    "Responsive behavior across laptop, tablet, and phone",
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Animated Background Orbs */}
      <div className="pointer-events-none absolute -top-24 -left-20 h-80 w-80 rounded-full bg-sky-300/25 blur-3xl animate-float" />
      <div className="pointer-events-none absolute -top-16 right-0 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl animate-float-slow" style={{ animationDelay: "2s" }} />
      <div className="pointer-events-none absolute top-1/2 left-1/4 h-96 w-96 rounded-full bg-blue-200/15 blur-3xl animate-float" style={{ animationDelay: "4s" }} />
      <div className="pointer-events-none absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-cyan-200/10 blur-3xl animate-float-slow" style={{ animationDelay: "1s" }} />

      <nav className="sticky top-0 z-40 border-b border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-600 to-blue-800 flex items-center justify-center shadow-lg shadow-sky-500/25 group-hover:shadow-xl group-hover:shadow-sky-500/40 group-hover:scale-105 transition-all duration-300">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-sky-600 group-hover:to-blue-700 group-hover:bg-clip-text transition-all">
              Echo
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Digital Workspace</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 hover:shadow-md transition-all duration-200"
              title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            >
              {theme === "light" ? (
                <Moon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              ) : (
                <Sun className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              )}
            </button>
          </div>
        </div>
      </nav>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="grid lg:grid-cols-12 gap-8 xl:gap-14 items-start">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-sky-200/80 dark:border-sky-900/60 bg-gradient-to-r from-sky-50/80 to-blue-50/60 dark:from-sky-950/50 dark:to-slate-900/50 text-sky-700 dark:text-sky-300 text-xs font-bold tracking-widest uppercase mb-6 hover:border-sky-300/80 dark:hover:border-sky-800/80 transition-all group animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              <Workflow className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              Crafted with Intention
            </div>
            
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-[1.0] tracking-tight text-slate-900 dark:text-slate-100 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              Built for teams that ship,
              <span className="block bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent dark:from-sky-400 dark:via-blue-400 dark:to-cyan-400">
                write, and collaborate fast.
              </span>
            </h2>
            
            <p className="text-lg md:text-xl text-slate-700 dark:text-slate-300 mb-10 max-w-2xl leading-relaxed font-medium animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
              Your all-in-one workspace for writing, collaborating, and staying organized. Seamlessly switch between blog publishing, note-taking, and team messaging—all in one beautiful, intuitive platform.
            </p>

            <div className="space-y-3 mb-10 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3 group animate-fade-in-up" style={{ animationDelay: `${0.5 + index * 0.08}s` }}>
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                    <Check className="w-4 h-4 text-white font-bold" />
                  </div>
                  <span className="text-slate-700 dark:text-slate-200 font-medium text-base group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors">
                    {benefit}
                  </span>
                </div>
              ))}
            </div>

            <div className="grid sm:grid-cols-3 gap-3 md:gap-4 max-w-2xl animate-fade-in-up" style={{ animationDelay: "0.7s" }}>
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-gradient-to-br from-white/90 to-slate-50/80 dark:from-slate-900/90 dark:to-slate-800/80 hover:shadow-xl hover:border-sky-300/50 dark:hover:border-sky-700/50 hover:-translate-y-1 transition-all duration-300 group cursor-pointer animate-fade-in-up"
                  style={{ animationDelay: `${0.8 + index * 0.1}s` }}
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center mb-3 group-hover:shadow-lg group-hover:shadow-sky-500/30 transition-all duration-300 transform group-hover:scale-110 animate-glow-pulse">
                    <feature.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-1.5 text-sm md:text-base">{feature.title}</h3>
                  <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 xl:col-span-5 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-br from-white/95 to-slate-50/80 dark:from-slate-900/95 dark:to-slate-800/80 shadow-2xl shadow-sky-500/5 dark:shadow-slate-900/30 p-6 md:p-8 lg:p-10 backdrop-blur-sm">
              <div className="mb-7">
                <div className="inline-flex rounded-xl bg-slate-100/80 dark:bg-slate-800/80 p-1 mb-5 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
                  <button
                    onClick={() => setIsLogin(true)}
                    className={`px-4 py-2 text-sm rounded-lg font-semibold transition-all duration-300 ${
                      isLogin
                        ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/30"
                        : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => setIsLogin(false)}
                    className={`px-4 py-2 text-sm rounded-lg font-semibold transition-all duration-300 ${
                      !isLogin
                        ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/30"
                        : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
                    }`}
                  >
                    Create Account
                  </button>
                </div>

                <h3 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                  {isLogin ? "Welcome back" : "Get started"}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-base">
                  {isLogin ? "Sign in to continue with your workspace" : "Create your account in under a minute"}
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm font-medium">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {!isLogin && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 dark:focus:border-sky-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                      placeholder="John Doe"
                      required={!isLogin}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 dark:focus:border-sky-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 dark:focus:border-sky-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 bg-gradient-to-r from-sky-600 to-blue-700 text-white rounded-xl font-semibold hover:shadow-2xl hover:shadow-sky-500/40 hover:from-sky-700 hover:to-blue-800 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Please wait...</span>
                    </>
                  ) : (
                    <>
                      <span>{isLogin ? "Sign In" : "Create Account"}</span>
                      <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError("");
                    setEmail("");
                    setPassword("");
                    setName("");
                  }}
                  className="text-sky-700 dark:text-sky-300 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                >
                  {isLogin
                    ? "Don't have an account? Sign up"
                    : "Already have an account? Sign in"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}