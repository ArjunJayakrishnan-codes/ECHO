import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { FileText, BookOpen, MessageCircle, TrendingUp, Calendar, Users, Heart, BarChart3 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { format } from "date-fns";

interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
  createdBy: string;
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
  });

  useEffect(() => {
    // Load notes
    const notes = JSON.parse(localStorage.getItem("notes") || "[]") as Note[];
    const myNotes = notes.filter((note) => note.createdBy === user?.email);

    // Load blog posts
    const blogPosts = JSON.parse(localStorage.getItem("blog-posts") || "[]") as BlogPost[];
    const myBlogs = blogPosts.filter((post) => post.authorId === user?.id);

    // Calculate stats
    const totalLikes = myBlogs.reduce((sum, post) => sum + post.likes.length, 0);
    const totalComments = myBlogs.reduce((sum, post) => sum + post.comments.length, 0);

    // Get recent items
    const recentNotes = myNotes
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5);

    const recentBlogs = myBlogs
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    setStats({
      totalNotes: myNotes.length,
      totalBlogs: myBlogs.length,
      myBlogs: myBlogs.length,
      totalLikes,
      totalComments,
      recentNotes,
      recentBlogs,
    });
  }, [user]);

  const StatCard = ({ icon: Icon, label, value, color, onClick }: any) => (
    <div
      onClick={onClick}
      className={`p-6 rounded-2xl bg-gradient-to-br ${color} backdrop-blur-sm border border-white/20 cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-xl`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="text-3xl font-bold text-white">{value}</div>
      </div>
      <div className="text-sm text-white/90 font-medium">{label}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/20 dark:from-slate-950 dark:to-indigo-950/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Welcome back, {user?.name}! Here's your activity overview.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={FileText}
            label="Total Notes"
            value={stats.totalNotes}
            color="from-blue-500 to-cyan-500"
            onClick={() => navigate("/notes")}
          />
          <StatCard
            icon={BookOpen}
            label="Total Blogs"
            value={stats.totalBlogs}
            color="from-purple-500 to-pink-500"
            onClick={() => navigate("/blog")}
          />
          <StatCard
            icon={Heart}
            label="Total Likes"
            value={stats.totalLikes}
            color="from-rose-500 to-red-500"
            onClick={() => navigate("/blog")}
          />
          <StatCard
            icon={MessageCircle}
            label="Total Comments"
            value={stats.totalComments}
            color="from-emerald-500 to-teal-500"
            onClick={() => navigate("/blog")}
          />
        </div>

        {/* Activity Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Notes */}
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
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
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-indigo-400 dark:text-indigo-500" />
                </div>
                <p className="text-slate-500 dark:text-slate-400">
                  No notes yet. Start writing!
                </p>
                <button
                  onClick={() => navigate("/notes")}
                  className="mt-4 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
                >
                  Create Note
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.recentNotes.map((note) => (
                  <div
                    key={note.id}
                    onClick={() => navigate("/notes")}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-all border border-slate-200 dark:border-slate-700"
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

          {/* Recent Blogs */}
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                Recent Blogs
              </h2>
              <button
                onClick={() => navigate("/blog")}
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                View All
              </button>
            </div>

            {stats.recentBlogs.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-purple-400 dark:text-purple-500" />
                </div>
                <p className="text-slate-500 dark:text-slate-400">
                  No blog posts yet. Share your story!
                </p>
                <button
                  onClick={() => navigate("/blog")}
                  className="mt-4 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
                >
                  Write Story
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.recentBlogs.map((blog) => (
                  <div
                    key={blog.id}
                    onClick={() => navigate(`/blog/${blog.id}`)}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-all border border-slate-200 dark:border-slate-700"
                  >
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-2 line-clamp-1">
                      {blog.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{format(new Date(blog.createdAt), "MMM d")}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        <span>{blog.likes.length}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        <span>{blog.comments.length}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate("/notes")}
              className="p-4 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200 flex items-center gap-3"
            >
              <FileText className="w-6 h-6" />
              <span className="font-medium">Create New Note</span>
            </button>
            <button
              onClick={() => navigate("/blog")}
              className="p-4 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-200 flex items-center gap-3"
            >
              <BookOpen className="w-6 h-6" />
              <span className="font-medium">Write Blog Post</span>
            </button>
            <button
              onClick={() => navigate("/chat")}
              className="p-4 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-200 flex items-center gap-3"
            >
              <MessageCircle className="w-6 h-6" />
              <span className="font-medium">Start Conversation</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
