import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Calendar, User, Heart, MessageCircle, Share2, Bookmark, Send } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "../context/AuthContext";

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

  const savePosts = (posts: BlogPost[]) => {
    localStorage.setItem("blog-posts", JSON.stringify(posts));
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/20 dark:from-slate-950 dark:to-indigo-950/20">
      {/* Fixed Action Bar */}
      <div className="fixed top-16 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/blog")}
            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Feed
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                isLiked
                  ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
              <span className="font-medium">{post.likes.length}</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            >
              <Share2 className="w-5 h-5" />
              <span className="font-medium">{post.shares}</span>
            </button>

            <button
              onClick={handleBookmark}
              className={`p-2 rounded-lg transition-all ${
                isBookmarked
                  ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              <Bookmark className={`w-5 h-5 ${isBookmarked ? "fill-current" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        {/* Category Badge */}
        <span className="inline-block px-4 py-1.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm font-bold uppercase tracking-wide rounded-full mb-6">
          {post.category}
        </span>

        {/* Title */}
        <h1 className="font-serif text-5xl lg:text-6xl font-bold mb-8 text-slate-900 dark:text-slate-100 leading-tight">
          {post.title}
        </h1>

        {/* Author Info */}
        <div className="flex items-center justify-between mb-12 pb-8 border-b-2 border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
              {post.author[0]}
            </div>
            <div>
              <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{post.author}</p>
              <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
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

        {/* Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none mb-16">
          <div className="whitespace-pre-wrap text-slate-700 dark:text-slate-300 leading-relaxed text-lg font-serif">
            {post.content}
          </div>
        </div>

        {/* Engagement Section */}
        <div className="border-y-2 border-slate-200 dark:border-slate-800 py-8 mb-12">
          <div className="flex items-center justify-center gap-8">
            <button
              onClick={handleLike}
              className={`flex flex-col items-center gap-2 transition-all ${
                isLiked
                  ? "text-red-600 dark:text-red-400"
                  : "text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400"
              }`}
            >
              <Heart className={`w-8 h-8 ${isLiked ? "fill-current" : ""}`} />
              <span className="text-sm font-medium">{post.likes.length} Likes</span>
            </button>

            <div className="w-px h-12 bg-slate-200 dark:bg-slate-800"></div>

            <button className="flex flex-col items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all">
              <MessageCircle className="w-8 h-8" />
              <span className="text-sm font-medium">{post.comments.length} Comments</span>
            </button>

            <div className="w-px h-12 bg-slate-200 dark:bg-slate-800"></div>

            <button
              onClick={handleShare}
              className="flex flex-col items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
            >
              <Share2 className="w-8 h-8" />
              <span className="text-sm font-medium">{post.shares} Shares</span>
            </button>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mb-8">
          <h2 className="font-serif text-3xl font-bold mb-8 text-slate-900 dark:text-slate-100">
            Comments ({post.comments.length})
          </h2>

          {/* Add Comment */}
          {user && (
            <div className="mb-10 p-6 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                  {user.name[0]}
                </div>
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your thoughts..."
                    rows={3}
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none mb-3"
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-indigo-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                    Post Comment
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-6">
            {post.comments.map((comment) => (
              <div
                key={comment.id}
                className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl"
              >
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
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
              <div className="text-center py-12 text-slate-400 dark:text-slate-500">
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