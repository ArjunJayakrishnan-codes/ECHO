import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  Clock,
  MessageSquare,
  Plus,
  Save,
  Search,
  Share2,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { format } from "date-fns";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useAuth } from "../context/AuthContext";
import { notifyEchoDataUpdated } from "../utils/dataEvents";

interface Comment {
  id: string;
  author: string;
  authorEmail?: string;
  content: string;
  createdAt: string;
}

interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
  createdBy: string;
  sharedWith: { email: string; permission: "view" | "edit" }[];
  comments: Comment[];
  lastEditedBy?: string;
}

export function NotesPage() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareEmail, setShareEmail] = useState("");
  const [sharePermission, setSharePermission] = useState<"view" | "edit">("view");
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [viewMode, setViewMode] = useState<"my" | "shared">("my");

  const loadNotes = () => {
    if (!user) return;

    try {
      const notesData = localStorage.getItem("echo_notes");
      const allNotes = notesData ? (JSON.parse(notesData) as Note[]) : [];
      setNotes(allNotes);
    } catch (error) {
      console.log("Error loading notes:", error);
      setNotes([]);
    }
  };

  const saveNotesToStorage = (updatedNotes: Note[]) => {
    try {
      localStorage.setItem("echo_notes", JSON.stringify(updatedNotes));
      notifyEchoDataUpdated();
    } catch (error) {
      console.log("Error saving notes:", error);
    }
  };

  useEffect(() => {
    loadNotes();
  }, [user]);

  useEffect(() => {
    if (!selectedNote) return;
    const hasChanges = editTitle !== selectedNote.title || editContent !== selectedNote.content;
    setHasUnsavedChanges(hasChanges);
    if (hasChanges) {
      setSaveStatus("unsaved");
    }
  }, [editTitle, editContent, selectedNote]);

  const filteredNotes = useMemo(() => {
    let filtered = notes;

    if (viewMode === "my") {
      filtered = notes.filter((note) => note.createdBy === user?.email);
    } else {
      filtered = notes.filter((note) => note.sharedWith.some((share) => share.email === user?.email));
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (note) =>
          note.title.toLowerCase().includes(query) ||
          note.content.toLowerCase().includes(query),
      );
    }

    return [...filtered].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  }, [notes, searchQuery, viewMode, user]);

  const handleCreateNote = () => {
    if (!user?.email) return;

    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: "Untitled Note",
      content: "",
      createdBy: user.email,
      updatedAt: new Date().toISOString(),
      sharedWith: [],
      comments: [],
    };

    const updatedNotes = [newNote, ...notes];
    setNotes(updatedNotes);
    saveNotesToStorage(updatedNotes);

    setSelectedNote(newNote);
    setEditTitle(newNote.title);
    setEditContent(newNote.content);
    setSaveStatus("saved");
    setHasUnsavedChanges(false);
  };

  const handleSelectNote = (note: Note) => {
    if (hasUnsavedChanges) {
      handleSaveNote();
    }
    setSelectedNote(note);
    setEditTitle(note.title);
    setEditContent(note.content);
    setSaveStatus("saved");
    setHasUnsavedChanges(false);
  };

  const handleSaveNote = () => {
    if (!selectedNote || !hasUnsavedChanges || !user?.email) return;

    setSaveStatus("saving");

    const updatedNote: Note = {
      ...selectedNote,
      title: editTitle,
      content: editContent,
      updatedAt: new Date().toISOString(),
      lastEditedBy: user.email,
    };

    const updatedNotes = notes.map((note) => (note.id === selectedNote.id ? updatedNote : note));
    setNotes(updatedNotes);
    saveNotesToStorage(updatedNotes);
    setSelectedNote(updatedNote);
    setHasUnsavedChanges(false);
    setSaveStatus("saved");
  };

  const handleDeleteNote = (id: string) => {
    const updatedNotes = notes.filter((note) => note.id !== id);
    setNotes(updatedNotes);
    saveNotesToStorage(updatedNotes);

    if (selectedNote?.id === id) {
      setSelectedNote(null);
      setEditTitle("");
      setEditContent("");
    }
  };

  const handleShareNote = () => {
    if (!selectedNote || !shareEmail.trim()) return;

    const sharedWith = selectedNote.sharedWith.filter((share) => share.email !== shareEmail);
    sharedWith.push({ email: shareEmail.trim(), permission: sharePermission });

    const updatedNote: Note = {
      ...selectedNote,
      sharedWith,
      updatedAt: new Date().toISOString(),
    };

    const updatedNotes = notes.map((note) => (note.id === selectedNote.id ? updatedNote : note));
    setNotes(updatedNotes);
    saveNotesToStorage(updatedNotes);
    setSelectedNote(updatedNote);
    setShareEmail("");
    setShowShareModal(false);
  };

  const handleRemoveShare = (email: string) => {
    if (!selectedNote) return;

    const updatedNote: Note = {
      ...selectedNote,
      sharedWith: selectedNote.sharedWith.filter((share) => share.email !== email),
      updatedAt: new Date().toISOString(),
    };

    const updatedNotes = notes.map((note) => (note.id === selectedNote.id ? updatedNote : note));
    setNotes(updatedNotes);
    saveNotesToStorage(updatedNotes);
    setSelectedNote(updatedNote);
  };

  const handleAddComment = () => {
    if (!selectedNote || !newComment.trim() || !user?.email) return;

    const comment: Comment = {
      id: `comment-${Date.now()}`,
      author: user.name || user.email,
      authorEmail: user.email,
      content: newComment.trim(),
      createdAt: new Date().toISOString(),
    };

    const updatedNote: Note = {
      ...selectedNote,
      comments: [...selectedNote.comments, comment],
      updatedAt: new Date().toISOString(),
    };

    const updatedNotes = notes.map((note) => (note.id === selectedNote.id ? updatedNote : note));
    setNotes(updatedNotes);
    saveNotesToStorage(updatedNotes);
    setSelectedNote(updatedNote);
    setNewComment("");
  };

  const canEdit = () => {
    if (!selectedNote || !user) return false;
    if (selectedNote.createdBy === user.email) return true;
    const share = selectedNote.sharedWith.find((entry) => entry.email === user.email);
    return share?.permission === "edit";
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ align: [] }],
      ["link", "image"],
      [{ color: [] }, { background: [] }],
      ["clean"],
    ],
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "align",
    "link",
    "image",
    "color",
    "background",
  ];

  return (
    <div className="min-h-[calc(100vh-7rem)] lg:h-[calc(100vh-7rem)] flex flex-col lg:flex-row relative overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="pointer-events-none absolute -top-24 -left-32 h-80 w-80 rounded-full bg-sky-300/25 blur-3xl animate-float" />
      <div className="pointer-events-none absolute top-1/2 -right-20 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl animate-float-slow" style={{ animationDelay: "2s" }} />
      <div className="pointer-events-none absolute -bottom-32 left-1/4 h-96 w-96 rounded-full bg-blue-300/15 blur-3xl animate-float" style={{ animationDelay: "4s" }} />

      <aside className={`${selectedNote ? "hidden lg:flex" : "flex"} w-full lg:w-80 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex-col relative z-10`}>
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 animate-fade-in-up">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Notes</h2>
            <button
              onClick={handleCreateNote}
              className="p-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-700 text-white hover:shadow-lg hover:shadow-sky-500/30 transition-all"
              title="Create note"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="flex gap-2 mb-4 p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
            <button
              onClick={() => setViewMode("my")}
              className={`flex-1 px-3 py-2 text-sm rounded-lg font-semibold transition-all ${
                viewMode === "my"
                  ? "bg-white dark:bg-slate-700 text-sky-700 dark:text-sky-300 shadow-sm"
                  : "text-slate-600 dark:text-slate-300"
              }`}
            >
              My Notes
            </button>
            <button
              onClick={() => setViewMode("shared")}
              className={`flex-1 px-3 py-2 text-sm rounded-lg font-semibold transition-all ${
                viewMode === "shared"
                  ? "bg-white dark:bg-slate-700 text-sky-700 dark:text-sky-300 shadow-sm"
                  : "text-slate-600 dark:text-slate-300"
              }`}
            >
              Shared
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredNotes.map((note, idx) => {
            const plainText = note.content.replace(/<[^>]*>/g, "").substring(0, 90);
            const isShared = note.sharedWith.length > 0;
            const isSharedWithMe = note.createdBy !== user?.email;

            return (
              <div
                key={note.id}
                onClick={() => handleSelectNote(note)}
                className={`p-4 border-b border-slate-100 dark:border-slate-800 cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-slate-800/60 animate-slide-in-left ${
                  selectedNote?.id === note.id ? "bg-slate-100 dark:bg-slate-800 border-l-4 border-l-sky-600" : ""
                }`}
                style={{ animationDelay: `${0.08 + idx * 0.06}s` }}
              >
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate">{note.title}</h3>
                    {isShared && !isSharedWithMe && <Users className="w-3.5 h-3.5 text-sky-600" />}
                    {isSharedWithMe && <UserPlus className="w-3.5 h-3.5 text-violet-600" />}
                  </div>
                  {note.createdBy === user?.email && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNote(note.id);
                      }}
                      className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    </button>
                  )}
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{plainText || "No content"}</p>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {format(new Date(note.updatedAt), "MMM d, h:mm a")}
                  </span>
                  {note.comments.length > 0 && (
                    <span className="inline-flex items-center gap-1 text-sky-700 dark:text-sky-300">
                      <MessageSquare className="w-3 h-3" />
                      {note.comments.length}
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {filteredNotes.length === 0 && (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400">
              {viewMode === "shared" ? "No shared notes" : "No notes found"}
            </div>
          )}
        </div>
      </aside>

      <section className={`${selectedNote ? "flex" : "hidden lg:flex"} flex-1 relative z-10`}>
        <div className="flex-1 flex flex-col bg-slate-50/70 dark:bg-slate-950/50 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          {selectedNote ? (
            <>
              <div className="p-4 md:p-6 border-b border-slate-200 dark:border-slate-800 bg-white/85 dark:bg-slate-900/85">
                <div className="flex items-center gap-3 mb-3">
                  <button
                    onClick={() => setSelectedNote(null)}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    disabled={!canEdit()}
                    placeholder="Note title"
                    className="flex-1 bg-transparent text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none disabled:opacity-70"
                  />
                  <button
                    onClick={() => setShowComments(!showComments)}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                  >
                    <MessageSquare className="w-4 h-4" />
                    {selectedNote.comments.length > 0 && <span className="text-sm">{selectedNote.comments.length}</span>}
                  </button>
                  {selectedNote.createdBy === user?.email && (
                    <button
                      onClick={() => setShowShareModal(true)}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                    >
                      <Share2 className="w-4 h-4" />
                      <span className="text-sm">Share</span>
                    </button>
                  )}
                  <button
                    onClick={handleSaveNote}
                    disabled={!hasUnsavedChanges || !canEdit()}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
                      hasUnsavedChanges && canEdit()
                        ? "bg-gradient-to-r from-sky-600 to-blue-700 text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    {saveStatus === "saving" ? <Save className="w-4 h-4 animate-pulse" /> : <Check className="w-4 h-4" />}
                    {saveStatus === "saving" ? "Saving" : saveStatus === "unsaved" ? "Save" : "Saved"}
                  </button>
                </div>

                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Last updated {format(new Date(selectedNote.updatedAt), "MMM d, yyyy 'at' h:mm a")}
                  {selectedNote.createdBy !== user?.email && <span className="ml-2">• Shared by {selectedNote.createdBy}</span>}
                  {!canEdit() && <span className="ml-2 text-amber-600 dark:text-amber-400">• View only</span>}
                </p>
              </div>

              <div className="flex-1 overflow-hidden">
                <ReactQuill
                  theme="snow"
                  value={editContent}
                  onChange={setEditContent}
                  modules={modules}
                  formats={formats}
                  className="h-full notes-editor"
                  placeholder="Start typing your note..."
                  readOnly={!canEdit()}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500 dark:text-slate-400">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center text-white">
                  <Plus className="w-10 h-10" />
                </div>
                <p className="text-lg">Create or select a note to start writing</p>
              </div>
            </div>
          )}
        </div>

        {showComments && selectedNote && (
          <>
            <button
              type="button"
              aria-label="Close comments"
              onClick={() => setShowComments(false)}
              className="fixed inset-0 z-30 bg-black/30 backdrop-blur-[1px] lg:hidden"
            />
            <aside className="fixed inset-y-0 right-0 z-40 w-full sm:w-80 lg:static lg:w-80 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shadow-2xl lg:shadow-none animate-slide-in-right">
              <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Comments</h3>
                <button onClick={() => setShowComments(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                  <X className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {selectedNote.comments.map((comment) => (
                  <div key={comment.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{comment.author}</span>
                      <span className="text-xs text-slate-400">{format(new Date(comment.createdAt), "MMM d, h:mm a")}</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300">{comment.content}</p>
                  </div>
                ))}

                {selectedNote.comments.length === 0 && (
                  <div className="text-center py-10 text-slate-400">
                    <MessageSquare className="w-10 h-10 mx-auto mb-2" />
                    <p>No comments yet</p>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment"
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none mb-3"
                />
                <button
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-700 text-white font-semibold disabled:opacity-50"
                >
                  Post Comment
                </button>
              </div>
            </aside>
          </>
        )}
      </section>

      {showShareModal && selectedNote && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Share Note</h3>
              <button onClick={() => setShowShareModal(false)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              </button>
            </div>

            <div className="space-y-4">
              <input
                type="email"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSharePermission("view")}
                  className={`px-3 py-2.5 rounded-xl border text-sm font-semibold ${
                    sharePermission === "view"
                      ? "border-sky-600 bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-300"
                      : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  View Only
                </button>
                <button
                  onClick={() => setSharePermission("edit")}
                  className={`px-3 py-2.5 rounded-xl border text-sm font-semibold ${
                    sharePermission === "edit"
                      ? "border-sky-600 bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-300"
                      : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  Can Edit
                </button>
              </div>

              <button
                onClick={handleShareNote}
                disabled={!shareEmail.trim()}
                className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-sky-600 to-blue-700 text-white font-semibold disabled:opacity-50"
              >
                Share Note
              </button>
            </div>

            {selectedNote.sharedWith.length > 0 && (
              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Shared with</h4>
                {selectedNote.sharedWith.map((share) => (
                  <div key={share.email} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                    <div>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{share.email}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {share.permission === "edit" ? "Can edit" : "View only"}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveShare(share.email)}
                      className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30"
                    >
                      <X className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
