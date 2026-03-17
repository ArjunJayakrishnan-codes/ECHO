import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Plus, Calendar, User, Heart, MessageCircle, Share2, Bookmark, TrendingUp, Users } from "lucide-react";
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
  imageUrl?: string;
  likes: string[];
  comments: BlogComment[];
  shares: number;
}

interface Subscription {
  userId: string;
  subscribedTo: string[];
}

export function BlogPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription>({ userId: user?.id || "", subscribedTo: [] });
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Technology");
  const [filter, setFilter] = useState<"all" | "following">("all");

  useEffect(() => {
    const saved = localStorage.getItem("blog-posts");
    if (saved) {
      setPosts(JSON.parse(saved));
    } else {
      // Initialize with sample posts
      const samplePosts: BlogPost[] = [
        {
          id: "1",
          title: "The Future of Web Development: What's Next in 2026",
          content: "As we progress through 2026, web development continues to evolve at an unprecedented pace. From AI-powered development tools to revolutionary frameworks, the landscape is changing rapidly.\n\nKey trends include:\n\n1. AI-Assisted Coding: Tools are becoming smarter and more intuitive\n2. WebAssembly adoption: Performance-critical applications are moving to WASM\n3. Edge computing: Bringing computation closer to users\n4. Progressive Web Apps: Blurring the line between web and native\n\nThe future is exciting, and developers need to stay adaptable to thrive in this ever-changing environment.",
          author: "Sarah Chen",
          authorId: "author-1",
          createdAt: new Date().toISOString(),
          excerpt: "As we progress through 2026, web development continues to evolve at an unprecedented pace. Discover the key trends shaping our industry.",
          category: "Technology",
          likes: ["user-1", "user-2", "user-3"],
          comments: [
            {
              id: "c1",
              author: "Alex Johnson",
              content: "Great insights! I'm particularly excited about WebAssembly.",
              createdAt: new Date(Date.now() - 3600000).toISOString(),
            }
          ],
          shares: 12,
        },
        {
          id: "2",
          title: "10 Tips for Better Writing",
          content: "Writing is an essential skill that transcends professions. Whether you're crafting emails, reports, or creative content, these tips will elevate your writing:\n\n1. Write every day - consistency builds skill\n2. Read widely - exposure to different styles enriches your voice\n3. Edit ruthlessly - your first draft is just the beginning\n4. Keep it simple - clarity trumps complexity\n5. Show, don't tell - engage your readers' senses\n6. Know your audience - tailor your tone and style\n7. Use active voice - it's more engaging and direct\n8. Embrace revision - great writing is rewriting\n9. Read aloud - catch awkward phrasing\n10. Practice empathy - connect with your readers\n\nRemember, becoming a better writer is a journey, not a destination.",
          author: "Michael Torres",
          authorId: "author-2",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          excerpt: "Master the art of writing with these proven techniques that will transform your communication skills.",
          category: "Writing",
          likes: ["user-4", "user-5"],
          comments: [],
          shares: 8,
        },
        {
          id: "3",
          title: "Understanding Modern Design Systems",
          content: "Design systems have become the backbone of consistent, scalable product development. They're more than just style guides - they're living ecosystems that bridge design and development.\n\nA robust design system includes:\n- Component libraries\n- Design tokens\n- Documentation\n- Accessibility guidelines\n- Best practices\n\nCompanies like Airbnb, IBM, and Shopify have shown how powerful design systems can streamline workflows and improve product quality.",
          author: "Emma Wilson",
          authorId: "author-3",
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          excerpt: "Explore how design systems are revolutionizing the way teams build products.",
          category: "Design",
          likes: ["user-1"],
          comments: [],
          shares: 5,
        },
        {
          id: "4",
          title: "The Art of Productive Remote Work",
          content: "Remote work has transformed from a perk to a standard. Here's how to make it work for you:\n\nCreate boundaries between work and personal life. Set up a dedicated workspace, maintain regular hours, and communicate effectively with your team.\n\nKey strategies:\n- Over-communicate to avoid misunderstandings\n- Use video calls for complex discussions\n- Take regular breaks to avoid burnout\n- Invest in good equipment\n- Stay connected with colleagues\n\nRemote work offers flexibility, but success requires discipline and intentionality.",
          author: "David Park",
          authorId: "author-4",
          createdAt: new Date(Date.now() - 259200000).toISOString(),
          excerpt: "Master the art of remote work with these practical strategies for productivity and work-life balance.",
          category: "Productivity",
          likes: [],
          comments: [],
          shares: 3,
        },
      ];
      setPosts(samplePosts);
      localStorage.setItem("blog-posts", JSON.stringify(samplePosts));
    }

    // Load subscriptions
    const savedSubs = localStorage.getItem(`subscriptions-${user?.id}`);
    if (savedSubs) {
      setSubscriptions(JSON.parse(savedSubs));
    }
  }, [user]);

  const savePosts = (updatedPosts: BlogPost[]) => {
    setPosts(updatedPosts);
    localStorage.setItem("blog-posts", JSON.stringify(updatedPosts));
  };

  const saveSubscriptions = (subs: Subscription) => {
    setSubscriptions(subs);
    localStorage.setItem(`subscriptions-${user?.id}`, JSON.stringify(subs));
  };

  const handleCreate = () => {
    if (!title || !content || !user) return;

    const newPost: BlogPost = {
      id: Date.now().toString(),
      title,
      content,
      author: user.name,
      authorId: user.id,
      createdAt: new Date().toISOString(),
      excerpt: content.substring(0, 150) + (content.length > 150 ? "..." : ""),
      category,
      likes: [],
      comments: [],
      shares: 0,
    };

    savePosts([newPost, ...posts]);
    setTitle("");
    setContent("");
    setCategory("Technology");
    setIsCreating(false);
  };

  const handleLike = (postId: string) => {
    if (!user) return;

    const updatedPosts = posts.map((post) => {
      if (post.id === postId) {
        const likes = post.likes.includes(user.id)
          ? post.likes.filter((id) => id !== user.id)
          : [...post.likes, user.id];
        return { ...post, likes };
      }
      return post;
    });
    savePosts(updatedPosts);
  };

  const handleSubscribe = (authorId: string) => {
    if (!user || authorId === user.id) return;

    const isSubscribed = subscriptions.subscribedTo.includes(authorId);
    const newSubs = {
      ...subscriptions,
      subscribedTo: isSubscribed
        ? subscriptions.subscribedTo.filter((id) => id !== authorId)
        : [...subscriptions.subscribedTo, authorId],
    };
    saveSubscriptions(newSubs);
  };

  const isSubscribed = (authorId: string) => {
    return subscriptions.subscribedTo.includes(authorId);
  };

  const handleShare = (postId: string) => {
    const updatedPosts = posts.map((post) => {
      if (post.id === postId) {
        return { ...post, shares: post.shares + 1 };
      }
      return post;
    });
    savePosts(updatedPosts);
    
    // Copy link to clipboard with fallback
    const url = `${window.location.origin}/blog/${postId}`;
    
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

  const filteredPosts = filter === "following" 
    ? posts.filter((post) => subscriptions.subscribedTo.includes(post.authorId))
    : posts;

  const featuredPost = filteredPosts[0];
  const trendingPosts = filteredPosts.slice(1, 4);
  const regularPosts = filteredPosts.slice(4);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/20 dark:from-slate-950 dark:to-indigo-950/20">
      {/* Newspaper Header */}
      <div className="border-b-4 border-slate-900 dark:border-slate-100 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-6">
            <h1 className="font-serif text-6xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              The Echo Times
            </h1>
            <div className="flex items-center justify-center gap-4 text-sm text-slate-600 dark:text-slate-400">
              <span className="font-medium">{format(new Date(), "EEEE, MMMM d, yyyy")}</span>
              <span>•</span>
              <span>{posts.length} Articles</span>
              <span>•</span>
              <span>{subscriptions.subscribedTo.length} Following</span>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === "all"
                    ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                All Stories
              </button>
              <button
                onClick={() => setFilter("following")}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  filter === "following"
                    ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Users className="w-4 h-4" />
                Following
              </button>
            </div>
            
            <button
              onClick={() => setIsCreating(!isCreating)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-200 font-medium"
            >
              <Plus className="w-5 h-5" />
              Write Story
            </button>
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-6">
              <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Write Your Story</h2>
            </div>
            
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xl font-semibold"
                  placeholder="Enter a compelling title..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option>Technology</option>
                  <option>Design</option>
                  <option>Writing</option>
                  <option>Productivity</option>
                  <option>Business</option>
                  <option>Lifestyle</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Content</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={12}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  placeholder="Tell your story..."
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-6 flex gap-3">
              <button
                onClick={handleCreate}
                disabled={!title || !content}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Publish Story
              </button>
              <button
                onClick={() => setIsCreating(false)}
                className="px-6 py-3 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200 text-slate-700 dark:text-slate-300 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Newspaper Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-10 h-10 text-indigo-400 dark:text-indigo-500" />
            </div>
            <p className="text-lg text-slate-400 dark:text-slate-500">
              {filter === "following" ? "Follow some writers to see their stories here" : "No stories yet. Be the first to write!"}
            </p>
          </div>
        ) : (
          <>
            {/* Featured Article */}
            {featuredPost && (
              <article
                onClick={() => navigate(`/blog/${featuredPost.id}`)}
                className="mb-12 border-4 border-slate-900 dark:border-slate-100 bg-white dark:bg-slate-900 cursor-pointer group overflow-hidden"
              >
                <div className="grid md:grid-cols-2 gap-0">
                  <div className="p-8 lg:p-12 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold uppercase tracking-wide">
                          Featured
                        </span>
                        <span className="text-sm text-slate-500 dark:text-slate-400">{featuredPost.category}</span>
                      </div>
                      <h2 className="font-serif text-4xl lg:text-5xl font-bold mb-4 text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight">
                        {featuredPost.title}
                      </h2>
                      <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                        {featuredPost.excerpt}
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                            {featuredPost.author[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-slate-100">{featuredPost.author}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              {format(new Date(featuredPost.createdAt), "MMM d, yyyy")}
                            </p>
                          </div>
                        </div>
                        
                        {user && featuredPost.authorId !== user.id && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSubscribe(featuredPost.authorId);
                            }}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${
                              isSubscribed(featuredPost.authorId)
                                ? "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                                : "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200"
                            }`}
                          >
                            {isSubscribed(featuredPost.authorId) ? "Following" : "Follow"}
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLike(featuredPost.id);
                          }}
                          className={`flex items-center gap-2 transition-colors ${
                            user && featuredPost.likes.includes(user.id)
                              ? "text-red-500"
                              : "text-slate-600 dark:text-slate-400 hover:text-red-500"
                          }`}
                        >
                          <Heart className={`w-5 h-5 ${user && featuredPost.likes.includes(user.id) ? "fill-current" : ""}`} />
                          <span className="font-medium">{featuredPost.likes.length}</span>
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/blog/${featuredPost.id}`);
                          }}
                          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        >
                          <MessageCircle className="w-5 h-5" />
                          <span className="font-medium">{featuredPost.comments.length}</span>
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShare(featuredPost.id);
                          }}
                          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        >
                          <Share2 className="w-5 h-5" />
                          <span className="font-medium">{featuredPost.shares}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="h-full min-h-[400px] bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                    <div className="text-white text-6xl font-bold opacity-20">
                      {featuredPost.category[0]}
                    </div>
                  </div>
                </div>
              </article>
            )}

            {/* Trending Section */}
            {trendingPosts.length > 0 && (
              <div className="mb-12">
                <h2 className="font-serif text-3xl font-bold mb-6 text-slate-900 dark:text-slate-100 border-b-2 border-slate-900 dark:border-slate-100 pb-2">
                  Trending Now
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {trendingPosts.map((post) => (
                    <article
                      key={post.id}
                      onClick={() => navigate(`/blog/${post.id}`)}
                      className="border-2 border-slate-900 dark:border-slate-100 bg-white dark:bg-slate-900 cursor-pointer group hover:shadow-xl transition-all"
                    >
                      <div className="h-48 bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center">
                        <span className="text-white text-5xl font-bold opacity-30">{post.category[0]}</span>
                      </div>
                      <div className="p-6">
                        <span className="text-xs font-bold uppercase tracking-wide text-indigo-600 dark:text-indigo-400 mb-2 block">
                          {post.category}
                        </span>
                        <h3 className="font-serif text-xl font-bold mb-3 text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 leading-tight">
                          {post.title}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 mb-4">
                          {post.excerpt}
                        </p>
                        
                        <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                              {post.author[0]}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{post.author}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {format(new Date(post.createdAt), "MMM d")}
                              </p>
                            </div>
                          </div>
                          
                          {user && post.authorId !== user.id && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSubscribe(post.authorId);
                              }}
                              className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                                isSubscribed(post.authorId)
                                  ? "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                                  : "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900"
                              }`}
                            >
                              {isSubscribed(post.authorId) ? "Following" : "Follow"}
                            </button>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-sm">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLike(post.id);
                            }}
                            className={`flex items-center gap-1 ${
                              user && post.likes.includes(user.id)
                                ? "text-red-500"
                                : "text-slate-600 dark:text-slate-400"
                            }`}
                          >
                            <Heart className={`w-4 h-4 ${user && post.likes.includes(user.id) ? "fill-current" : ""}`} />
                            <span>{post.likes.length}</span>
                          </button>
                          
                          <button className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                            <MessageCircle className="w-4 h-4" />
                            <span>{post.comments.length}</span>
                          </button>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShare(post.id);
                            }}
                            className="flex items-center gap-1 text-slate-600 dark:text-slate-400"
                          >
                            <Share2 className="w-4 h-4" />
                            <span>{post.shares}</span>
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {/* More Stories */}
            {regularPosts.length > 0 && (
              <div>
                <h2 className="font-serif text-3xl font-bold mb-6 text-slate-900 dark:text-slate-100 border-b-2 border-slate-900 dark:border-slate-100 pb-2">
                  More Stories
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {regularPosts.map((post) => (
                    <article
                      key={post.id}
                      onClick={() => navigate(`/blog/${post.id}`)}
                      className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 cursor-pointer group hover:border-slate-900 dark:hover:border-slate-100 transition-all"
                    >
                      <span className="text-xs font-bold uppercase tracking-wide text-indigo-600 dark:text-indigo-400 mb-2 block">
                        {post.category}
                      </span>
                      <h3 className="font-serif text-2xl font-bold mb-3 text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-300 line-clamp-2 mb-4">
                        {post.excerpt}
                      </p>
                      
                      <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                            {post.author[0]}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{post.author}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {format(new Date(post.createdAt), "MMM d, yyyy")}
                            </p>
                          </div>
                        </div>
                        
                        {user && post.authorId !== user.id && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSubscribe(post.authorId);
                            }}
                            className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                              isSubscribed(post.authorId)
                                ? "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                                : "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900"
                            }`}
                          >
                            {isSubscribed(post.authorId) ? "Following" : "Follow"}
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLike(post.id);
                          }}
                          className={`flex items-center gap-1 ${
                            user && post.likes.includes(user.id)
                              ? "text-red-500"
                              : "text-slate-600 dark:text-slate-400"
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${user && post.likes.includes(user.id) ? "fill-current" : ""}`} />
                          <span>{post.likes.length}</span>
                        </button>
                        
                        <button className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                          <MessageCircle className="w-4 h-4" />
                          <span>{post.comments.length}</span>
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShare(post.id);
                          }}
                          className="flex items-center gap-1 text-slate-600 dark:text-slate-400"
                        >
                          <Share2 className="w-4 h-4" />
                          <span>{post.shares}</span>
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}