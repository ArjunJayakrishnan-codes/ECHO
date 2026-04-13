import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { FileText, BookOpen, MessageCircle, TrendingUp, Calendar, Users, Heart, BarChart3 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { format } from "date-fns";
import { ECHO_DATA_UPDATED_EVENT } from "../utils/dataEvents";

const NOTES_STORAGE_KEY = "echo_notes";
const BLOG_STORAGE_KEY = "blog-posts";

interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
  createdBy: string;
  sharedWith?: { email: string; permission: "view" | "edit" }[];
}

interface BlogPost {
  id: string;
  title: string;
  author: string;
  authorId: string;
  createdAt: string;
  likes: string[];
  comments: any[];
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalNotes: 0,
    totalBlogs: 0,
    myBlogs: 0,
    totalLikes: 0,
    totalComments: 0,
    recentNotes: [] as Note[],
    recentBlogs: [] as BlogPost[],
    allBlogs: [] as BlogPost[],
  });

  const parseStorageArray = <T,>(key: string): T[] => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) {
        return [];
      }
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch {
      return [];
    }
  };

  const loadDashboardStats = () => {
    if (!user) {
      setStats({
        totalNotes: 0,
        totalBlogs: 0,
        myBlogs: 0,
        totalLikes: 0,
        totalComments: 0,
        recentNotes: [],
        recentBlogs: [],
        allBlogs: [],
      });
      return;
    }

    const notes = parseStorageArray<Note>(NOTES_STORAGE_KEY);
    const blogPosts = parseStorageArray<BlogPost>(BLOG_STORAGE_KEY);

    const normalizedUserEmail = user.email.toLowerCase();
    const accessibleNotes = notes.filter((note) => {
      const createdByUser = note.createdBy?.toLowerCase() === normalizedUserEmail;
      const sharedWithUser = Array.isArray(note.sharedWith)
        ? note.sharedWith.some((share) => share.email?.toLowerCase() === normalizedUserEmail)
        : false;
      return createdByUser || sharedWithUser;
    });
    const myBlogs = blogPosts.filter((post) => post.authorId === user.id);

    const likedPosts = blogPosts.filter((post) =>
      Array.isArray(post.likes) ? post.likes.includes(user.id) : false,
    );

    const totalLikes = likedPosts.length;
    const totalComments = myBlogs.reduce(
      (sum, post) => sum + (Array.isArray(post.comments) ? post.comments.length : 0),
      0,
    );

    const recentNotes = [...accessibleNotes]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5);

    const recentBlogs = [...myBlogs]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    const allBlogs = [...blogPosts]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6);

    setStats({
      totalNotes: accessibleNotes.length,
      totalBlogs: myBlogs.length,
      myBlogs: myBlogs.length,
      totalLikes,
      totalComments,
      recentNotes,
      recentBlogs,
      allBlogs,
    });
  };

  useEffect(() => {
    loadDashboardStats();

    const refresh = () => loadDashboardStats();
    const refreshOnCustomEvent = () => loadDashboardStats();

    window.addEventListener("storage", refresh);
    window.addEventListener("focus", refresh);
    window.addEventListener(ECHO_DATA_UPDATED_EVENT, refreshOnCustomEvent);

    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("focus", refresh);
      window.removeEventListener(ECHO_DATA_UPDATED_EVENT, refreshOnCustomEvent);
    };
  }, [user]);

  const StatCard = ({ icon: Icon, label, value, color, onClick }: any) => (
    <div
      onClick={onClick}
      className="group cursor-pointer rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-800/80 dark:bg-slate-900/80 animate-scale-in hover:animate-pulse-ring"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className={`p-3 rounded-xl ${color} animate-glow-pulse`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 animate-bounce-gentle">{value}</div>
      </div>
      <div className="text-sm font-semibold tracking-wide text-slate-600 dark:text-slate-300">{label}</div>
    </div>
  );

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-sky-300/20 blur-3xl animate-float" />
      <div className="pointer-events-none absolute top-1/4 -right-32 h-80 w-80 rounded-full bg-blue-300/15 blur-3xl animate-float-slow" style={{ animationDelay: "2s" }} />
      <div className="pointer-events-none absolute bottom-1/4 left-1/3 h-64 w-64 rounded-full bg-emerald-300/10 blur-3xl animate-float" style={{ animationDelay: "4s" }} />
      <div className="pointer-events-none absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-cyan-200/10 blur-3xl animate-float-slow" style={{ animationDelay: "1s" }} />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        {/* Header */}
        <div className="mb-8 app-panel p-6 md:p-8 animate-fade-in-up">
          <p className="text-xs uppercase tracking-[0.24em] text-sky-700 dark:text-sky-400 font-bold mb-2">
            Operations Overview
          </p>
          <h1 className="text-4xl text-slate-900 dark:text-slate-100 mb-2">
            Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-300 max-w-2xl">
            Welcome back, {user?.name}! Here's your activity overview.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <StatCard
            icon={FileText}
            label="Total Notes"
            value={stats.totalNotes}
            color="bg-gradient-to-br from-cyan-500 to-sky-700"
            onClick={() => navigate("/notes")}
          />
          <StatCard
            icon={BookOpen}
            label="My Blogs"
            value={stats.totalBlogs}
            color="bg-gradient-to-br from-blue-600 to-indigo-700"
            onClick={() => navigate("/blog")}
          />
          <StatCard
            icon={Heart}
            label="Posts I Liked"
            value={stats.totalLikes}
            color="bg-gradient-to-br from-emerald-500 to-teal-700"
            onClick={() => navigate("/blog")}
          />
          <StatCard
            icon={MessageCircle}
            label="Total Comments"
            value={stats.totalComments}
            color="bg-gradient-to-br from-amber-500 to-orange-700"
            onClick={() => navigate("/blog")}
          />
        </div>

        {/* Activity Sections */}
        <div>
          {/* Recent Notes */}
          <div className="app-panel p-6 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                Recent Notes
              </h2>
              <button
                onClick={() => navigate("/notes")}
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                View All
              </button>
            </div>

            {stats.recentNotes.length === 0 ? (
              <div className="text-center py-12 animate-scale-in">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-bounce-gentle">
                  <FileText className="w-8 h-8 text-indigo-400 dark:text-indigo-500" />
                </div>
                <p className="text-slate-500 dark:text-slate-400">
                  No notes yet. Start writing!
                </p>
                <button
                  onClick={() => navigate("/notes")}
                  className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300 transition-all hover:scale-105"
                >
                  Create Note
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.recentNotes.map((note, idx) => (
                  <div
                    key={note.id}
                    onClick={() => navigate("/notes")}
                    className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-800/70 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-all border border-slate-200/80 dark:border-slate-700 animate-slide-in-left"
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-1 line-clamp-1">
                      {note.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      <Calendar className="w-4 h-4" />
                      <span>Updated {format(new Date(note.updatedAt), "MMM d, yyyy")}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 app-panel p-6 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate("/notes")}
              className="p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100 transition-all duration-200 flex items-center gap-3 animate-slide-in-left hover:scale-105 hover:animate-bounce-gentle"
              style={{ animationDelay: "0.35s" }}
            >
              <FileText className="w-6 h-6 text-cyan-700 dark:text-cyan-400" />
              <span className="font-medium">Create New Note</span>
            </button>
            <button
              onClick={() => navigate("/blog")}
              className="p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100 transition-all duration-200 flex items-center gap-3 animate-scale-in hover:scale-105"
              style={{ animationDelay: "0.4s" }}
            >
              <BookOpen className="w-6 h-6 text-blue-700 dark:text-blue-400" />
              <span className="font-medium">Write Blog Post</span>
            </button>
            <button
              onClick={() => navigate("/chat")}
              className="p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100 transition-all duration-200 flex items-center gap-3 animate-slide-in-right hover:scale-105"
              style={{ animationDelay: "0.45s" }}
            >
              <MessageCircle className="w-6 h-6 text-emerald-700 dark:text-emerald-400" />
              <span className="font-medium">Start Conversation</span>
            </button>
          </div>
        </div>

        {/* Blog Feed */}
        <div className="mt-8 animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-sky-700 dark:text-sky-400 font-bold mb-1">
                Community
              </p>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                Blog Feed
              </h2>
            </div>
            <button
              onClick={() => navigate("/blog")}
              className="px-4 py-2 text-sm font-semibold text-sky-700 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/40 rounded-lg transition-all"
            >
              View All Posts →
            </button>
          </div>

          {stats.allBlogs.length === 0 ? (
            <div className="app-panel p-12 text-center">
              <BookOpen className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400 text-lg">
                No blog posts yet. Be the first to write!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stats.allBlogs.map((blog, idx) => (
                <div
                  key={blog.id}
                  onClick={() => navigate(`/blog/${blog.id}`)}
                  className="group rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-gradient-to-br from-white/90 to-slate-50/80 dark:from-slate-900/90 dark:to-slate-800/80 overflow-hidden hover:shadow-xl hover:border-sky-300/50 dark:hover:border-sky-700/50 hover:-translate-y-1 transition-all duration-300 cursor-pointer animate-scale-in"
                  style={{ animationDelay: `${0.55 + idx * 0.08}s` }}
                >
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2 group-hover:text-sky-700 dark:group-hover:text-sky-300 transition-colors line-clamp-2">
                      {blog.title}
                    </h3>
                    
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                      By <span className="font-semibold text-slate-900 dark:text-slate-100">{blog.author}</span>
                    </p>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-1 animate-bounce-gentle">
                          <Heart className="w-4 h-4" />
                          <span>{blog.likes?.length || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" />
                          <span>{blog.comments?.length || 0}</span>
                        </div>
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-500 font-medium">
                        {format(new Date(blog.createdAt), "MMM d")}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
