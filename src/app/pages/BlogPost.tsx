import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Calendar, User, Heart, MessageCircle, Share2, Bookmark, Send } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "../context/AuthContext";
import { notifyEchoDataUpdated } from "../utils/dataEvents";

interface BlogComment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

interface BlogPost {
  id: string;
  title: string;
  content: string;
  author: string;
  authorId: string;
  createdAt: string;
  excerpt: string;
  category: string;
  likes: string[];
  comments: BlogComment[];
  shares: number;
}

export function BlogPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [newComment, setNewComment] = useState("");
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem("blog-posts");
    if (saved) {
      const posts: BlogPost[] = JSON.parse(saved);
      const found = posts.find((p) => p.id === id);
      setPost(found || null);
    }

    // Check if bookmarked
    const bookmarks = JSON.parse(localStorage.getItem(`bookmarks-${user?.id}`) || "[]");
    setIsBookmarked(bookmarks.includes(id));
  }, [id, user]);

  useEffect(() => {
    const handleScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll <= 0) {
        setScrollProgress(0);
        return;
      }
      setScrollProgress((window.scrollY / maxScroll) * 100);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const savePosts = (posts: BlogPost[]) => {
    localStorage.setItem("blog-posts", JSON.stringify(posts));
    notifyEchoDataUpdated();
  };

  const handleLike = () => {
    if (!post || !user) return;

    const saved = localStorage.getItem("blog-posts");
    if (!saved) return;

    const posts: BlogPost[] = JSON.parse(saved);
    const updatedPosts = posts.map((p) => {
      if (p.id === post.id) {
        const likes = p.likes.includes(user.id)
          ? p.likes.filter((id) => id !== user.id)
          : [...p.likes, user.id];
        const updated = { ...p, likes };
        setPost(updated);
        return updated;
      }
      return p;
    });
    savePosts(updatedPosts);
  };

  const handleShare = () => {
    if (!post) return;

    const saved = localStorage.getItem("blog-posts");
    if (!saved) return;

    const posts: BlogPost[] = JSON.parse(saved);
    const updatedPosts = posts.map((p) => {
      if (p.id === post.id) {
        const updated = { ...p, shares: p.shares + 1 };
        setPost(updated);
        return updated;
      }
      return p;
    });
    savePosts(updatedPosts);

    // Copy link to clipboard with fallback
    const url = window.location.href;
    
    // Try modern clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url)
        .then(() => {
          alert("Link copied to clipboard!");
        })
        .catch(() => {
          // Fallback: show URL in alert
          alert(`Share this link:\n${url}`);
        });
    } else {
      // Fallback for browsers without clipboard API
      alert(`Share this link:\n${url}`);
    }
  };

  const handleBookmark = () => {
    if (!user || !post) return;

    const bookmarks = JSON.parse(localStorage.getItem(`bookmarks-${user.id}`) || "[]");
    const newBookmarks = isBookmarked
      ? bookmarks.filter((bId: string) => bId !== post.id)
      : [...bookmarks, post.id];
    
    localStorage.setItem(`bookmarks-${user.id}`, JSON.stringify(newBookmarks));
    setIsBookmarked(!isBookmarked);
  };

  const handleAddComment = () => {
    if (!post || !user || !newComment.trim()) return;

    const saved = localStorage.getItem("blog-posts");
    if (!saved) return;

    const comment: BlogComment = {
      id: Date.now().toString(),
      author: user.name,
      content: newComment,
      createdAt: new Date().toISOString(),
    };

    const posts: BlogPost[] = JSON.parse(saved);
    const updatedPosts = posts.map((p) => {
      if (p.id === post.id) {
        const updated = { ...p, comments: [...p.comments, comment] };
        setPost(updated);
        return updated;
      }
      return p;
    });
    savePosts(updatedPosts);
    setNewComment("");
  };

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50/20 dark:from-slate-950 dark:to-indigo-950/20">
        <div className="text-center">
          <button
            onClick={() => navigate("/blog")}
            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 mb-8 mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Feed
          </button>
          <p className="text-slate-500 dark:text-slate-400 text-lg">Post not found</p>
        </div>
      </div>
    );
  }

  const isLiked = user && post.likes.includes(user.id);

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950/70">
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-transparent">
        <div
          className="h-full bg-gradient-to-r from-sky-600 to-blue-700 transition-[width] duration-150"
          style={{ width: `${Math.max(0, Math.min(100, scrollProgress))}%` }}
        />
      </div>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-10 pb-20">
        <div className="sticky top-24 z-30 mb-7 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-sm p-3">
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => navigate("/blog")}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-semibold text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Feed
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleLike}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                  isLiked
                    ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
                {post.likes.length}
              </button>

              <button
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                <Share2 className="w-4 h-4" />
                {post.shares}
              </button>

              <button
                onClick={handleBookmark}
                className={`p-2 rounded-xl transition-all ${
                  isBookmarked
                    ? "bg-sky-50 dark:bg-sky-900/25 text-sky-700 dark:text-sky-300"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Category Badge */}
        <span className="inline-block px-4 py-1.5 bg-sky-700 text-white text-xs font-bold uppercase tracking-[0.16em] rounded-full mb-5">
          {post.category}
        </span>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-7 text-slate-900 dark:text-slate-100 leading-[1.06] tracking-tight">
          {post.title}
        </h1>

        <div className="app-panel p-5 md:p-6 mb-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-600 to-blue-800 flex items-center justify-center text-white text-xl font-bold">
              {post.author[0]}
            </div>
            <div>
              <p className="text-lg md:text-xl font-bold text-slate-800 dark:text-slate-100">{post.author}</p>
              <div className="flex flex-wrap items-center gap-2 md:gap-3 text-sm text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(post.createdAt), "MMMM d, yyyy")}
                </span>
                <span>•</span>
                <span>{Math.ceil(post.content.split(" ").length / 200)} min read</span>
              </div>
            </div>
          </div>
        </div>

        <div className="app-panel p-6 md:p-8 mb-10">
          <div className="whitespace-pre-wrap text-slate-700 dark:text-slate-300 leading-relaxed text-lg md:text-[1.12rem]">
            {post.content}
          </div>
        </div>

        <div className="app-panel py-7 px-5 mb-10">
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={handleLike}
              className={`flex flex-col items-center gap-2 transition-all rounded-xl py-3 ${
                isLiked
                  ? "text-red-600 dark:text-red-400"
                  : "text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400"
              }`}
            >
              <Heart className={`w-7 h-7 ${isLiked ? "fill-current" : ""}`} />
              <span className="text-xs md:text-sm font-medium">{post.likes.length} Likes</span>
            </button>

            <button className="flex flex-col items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all">
              <MessageCircle className="w-7 h-7" />
              <span className="text-xs md:text-sm font-medium">{post.comments.length} Comments</span>
            </button>

            <button
              onClick={handleShare}
              className="flex flex-col items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
            >
              <Share2 className="w-7 h-7" />
              <span className="text-xs md:text-sm font-medium">{post.shares} Shares</span>
            </button>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-6 text-slate-900 dark:text-slate-100">
            Comments ({post.comments.length})
          </h2>

          {user && (
            <div className="mb-8 app-panel p-5 md:p-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-600 to-blue-800 flex items-center justify-center text-white font-semibold flex-shrink-0">
                  {user.name[0]}
                </div>
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your thoughts..."
                    rows={3}
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none mb-3"
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-sky-600 to-blue-700 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-sky-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                    Post Comment
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {post.comments.map((comment) => (
              <div
                key={comment.id}
                className="app-panel p-5 md:p-6"
              >
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-600 to-blue-800 flex items-center justify-center text-white font-semibold flex-shrink-0">
                    {comment.author[0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-slate-800 dark:text-slate-100">{comment.author}</p>
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        {format(new Date(comment.createdAt), "MMM d, yyyy 'at' h:mm a")}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{comment.content}</p>
                  </div>
                </div>
              </div>
            ))}

            {post.comments.length === 0 && (
              <div className="app-panel text-center py-12 text-slate-400 dark:text-slate-500">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No comments yet. Be the first to share your thoughts!</p>
              </div>
            )}
          </div>
        </div>
      </article>
    </div>
  );
}