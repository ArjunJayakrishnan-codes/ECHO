import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { BookOpen, MessageSquare, StickyNote, ArrowRight, Check, Sparkles, Moon, Sun } from "lucide-react";

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
      title: "Blogging",
      description: "Create and share beautiful blog posts with your audience",
    },
    {
      icon: StickyNote,
      title: "Notes",
      description: "Rich text editor with formatting, images, and organization",
    },
    {
      icon: MessageSquare,
      title: "Messaging",
      description: "Real-time conversations with contacts and read receipts",
    },
  ];

  const benefits = [
    "All-in-one productivity platform",
    "Beautiful, modern interface",
    "Secure and private",
    "Lightning fast performance",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/30">
      {/* Navigation */}
      <nav className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Echo
            </h1>
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === "light" ? (
              <Moon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            ) : (
              <Sun className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            )}
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Column - Hero Content */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              <span>Your All-in-One Workspace</span>
            </div>
            
            <h2 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Everything
              </span>
              <br />
              <span className="text-slate-800 dark:text-slate-100">you need in one place</span>
            </h2>
            
            <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
              Blog, take notes, and chat—all in one beautiful, unified platform designed for productivity and creativity.
            </p>

            {/* Benefits */}
            <div className="space-y-3 mb-10">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-slate-700 dark:text-slate-200 font-medium">{benefit}</span>
                </div>
              ))}
            </div>

            {/* Features Grid */}
            <div className="grid sm:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="p-5 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-2xl hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-200"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mb-3 shadow-md">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-1">{feature.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Auth Form */}
          <div className="lg:pl-12">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl shadow-indigo-500/10 p-8 lg:p-10">
              <div className="mb-8">
                <h3 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                  {isLogin ? "Welcome back" : "Get started"}
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {isLogin
                    ? "Sign in to continue to Echo"
                    : "Create your free account today"}
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {!isLogin && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      placeholder="John Doe"
                      required={!isLogin}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Please wait...</span>
                    </>
                  ) : (
                    <>
                      <span>{isLogin ? "Sign In" : "Create Account"}</span>
                      <ArrowRight className="w-5 h-5" />
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
                  className="text-indigo-600 dark:text-indigo-400 hover:text-purple-600 dark:hover:text-purple-400 font-medium transition-colors"
                >
                  {isLogin
                    ? "Don't have an account? Sign up"
                    : "Already have an account? Sign in"}
                </button>
              </div>
            </div>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-indigo-50/50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-2xl">
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">Quick Demo:</span> Create any account to get started, or use these credentials:
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                Email: demo@echo.com • Password: demo123
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}