import { useState, useEffect, useMemo } from "react";
import { Plus, Trash2, Search, Clock, Save, Check, Share2, Users, X, MessageSquare, UserPlus } from "lucide-react";
import { format } from "date-fns";
// Note: react-quill uses deprecated findDOMNode which causes a console warning
// This is a known issue with react-quill and doesn't affect functionality
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useAuth } from "../context/AuthContext";

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

  // Load notes from localStorage
  const loadNotes = () => {
    if (!user) return;
    
    try {
      const notesData = localStorage.getItem("echo_notes");
      if (notesData) {
        const allNotes: Note[] = JSON.parse(notesData);
        setNotes(allNotes);
      }
    } catch (error) {
      console.log("Error loading notes:", error);
    }
  };

  // Save notes to localStorage
  const saveNotesToStorage = (updatedNotes: Note[]) => {
    try {
      localStorage.setItem("echo_notes", JSON.stringify(updatedNotes));
    } catch (error) {
      console.log("Error saving notes:", error);
    }
  };

  useEffect(() => {
    loadNotes();
  }, [user]);

  useEffect(() => {
    if (selectedNote) {
      const hasChanges =
        editTitle !== selectedNote.title || editContent !== selectedNote.content;
      setHasUnsavedChanges(hasChanges);
      if (hasChanges) {
        setSaveStatus("unsaved");
      }
    }
  }, [editTitle, editContent, selectedNote]);

  const filteredNotes = useMemo(() => {
    let filtered = notes;
    
    if (viewMode === "my") {
      filtered = notes.filter((n) => n.createdBy === user?.email);
    } else {
      filtered = notes.filter((n) => 
        n.sharedWith.some((s) => s.email === user?.email)
      );
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (note) =>
          note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return filtered.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
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
    setHasUnsavedChanges(false);
    setSaveStatus("saved");
  };

  const handleSelectNote = (note: Note) => {
    if (hasUnsavedChanges) {
      handleSaveNote();
    }
    setSelectedNote(note);
    setEditTitle(note.title);
    setEditContent(note.content);
    setHasUnsavedChanges(false);
    setSaveStatus("saved");
  };

  const handleSaveNote = () => {
    if (!selectedNote || !hasUnsavedChanges || !user?.email) return;

    setSaveStatus("saving");
    
    const updatedNote = {
      ...selectedNote,
      title: editTitle,
      content: editContent,
      updatedAt: new Date().toISOString(),
      lastEditedBy: user.email,
    };

    const updatedNotes = notes.map((note) =>
      note.id === selectedNote.id ? updatedNote : note
    );
    
    setNotes(updatedNotes);
    saveNotesToStorage(updatedNotes);
    setSelectedNote(updatedNote);
    setHasUnsavedChanges(false);
    setSaveStatus("saved");

    setTimeout(() => {
      setSaveStatus("saved");
    }, 2000);
  };

  const handleDeleteNote = (id: string) => {
    const updatedNotes = notes.filter((note) => note.id !== id);
    setNotes(updatedNotes);
    saveNotesToStorage(updatedNotes);
    
    if (selectedNote?.id === id) {
      if (updatedNotes.length > 0) {
        const myNotes = updatedNotes.filter((n) => n.createdBy === user?.email);
        if (myNotes.length > 0) {
          setSelectedNote(myNotes[0]);
          setEditTitle(myNotes[0].title);
          setEditContent(myNotes[0].content);
        } else {
          setSelectedNote(null);
          setEditTitle("");
          setEditContent("");
        }
      } else {
        setSelectedNote(null);
        setEditTitle("");
        setEditContent("");
      }
    }
  };

  const handleShareNote = () => {
    if (!selectedNote || !shareEmail || !user?.email) return;

    const sharedWith = selectedNote.sharedWith.filter((s) => s.email !== shareEmail);
    sharedWith.push({ email: shareEmail, permission: sharePermission });

    const updatedNote = {
      ...selectedNote,
      sharedWith,
      updatedAt: new Date().toISOString(),
    };

    const updatedNotes = notes.map((note) =>
      note.id === selectedNote.id ? updatedNote : note
    );
    
    setNotes(updatedNotes);
    saveNotesToStorage(updatedNotes);
    setSelectedNote(updatedNote);
    setShareEmail("");
    setShowShareModal(false);
  };

  const handleRemoveShare = (email: string) => {
    if (!selectedNote || !user?.email) return;

    const sharedWith = selectedNote.sharedWith.filter((s) => s.email !== email);

    const updatedNote = {
      ...selectedNote,
      sharedWith,
      updatedAt: new Date().toISOString(),
    };

    const updatedNotes = notes.map((note) =>
      note.id === selectedNote.id ? updatedNote : note
    );
    
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
      content: newComment,
      createdAt: new Date().toISOString(),
    };

    const comments = [...selectedNote.comments, comment];

    const updatedNote = {
      ...selectedNote,
      comments,
      updatedAt: new Date().toISOString(),
    };

    const updatedNotes = notes.map((note) =>
      note.id === selectedNote.id ? updatedNote : note
    );
    
    setNotes(updatedNotes);
    saveNotesToStorage(updatedNotes);
    setSelectedNote(updatedNote);
    setNewComment("");
  };

  const canEdit = () => {
    if (!selectedNote || !user) return false;
    if (selectedNote.createdBy === user.email) return true;
    const share = selectedNote.sharedWith.find((s) => s.email === user.email);
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
    <div className="h-[calc(100vh-4rem)] flex">
      {/* Sidebar */}
      <div className="w-80 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-lg text-slate-800 dark:text-slate-100">My Notes</h2>
            <button
              onClick={handleCreateNote}
              className="p-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-200"
              title="New Note"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex gap-2 mb-4 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <button
              onClick={() => setViewMode("my")}
              className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                viewMode === "my"
                  ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              My Notes
            </button>
            <button
              onClick={() => setViewMode("shared")}
              className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                viewMode === "shared"
                  ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              Shared
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              className="w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredNotes.map((note) => {
            const plainText = note.content.replace(/<[^>]*>/g, "").substring(0, 100);
            const isShared = note.sharedWith.length > 0;
            const isSharedWithMe = note.createdBy !== user?.email;
            
            return (
              <div
                key={note.id}
                onClick={() => handleSelectNote(note)}
                className={`p-5 border-b border-slate-100 dark:border-slate-800 cursor-pointer hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 transition-all group ${
                  selectedNote?.id === note.id ? "bg-indigo-50/80 dark:bg-indigo-900/30 border-l-4 border-l-indigo-600" : ""
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 flex-1">
                    <h3 className="font-semibold line-clamp-1 text-slate-800 dark:text-slate-100">{note.title}</h3>
                    {isShared && !isSharedWithMe && (
                      <Users className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                    )}
                    {isSharedWithMe && (
                      <UserPlus className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                    )}
                  </div>
                  {note.createdBy === user?.email && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNote(note.id);
                      }}
                      className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-500 dark:text-red-400" />
                    </button>
                  )}
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-3 leading-relaxed">
                  {plainText || "No content"}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                    <Clock className="w-3 h-3" />
                    <span>{format(new Date(note.updatedAt), "MMM d, h:mm a")}</span>
                  </div>
                  {note.comments.length > 0 && (
                    <div className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400">
                      <MessageSquare className="w-3 h-3" />
                      <span>{note.comments.length}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {filteredNotes.length === 0 && (
            <div className="p-8 text-center text-slate-400 dark:text-slate-500">
              <p>{viewMode === "shared" ? "No shared notes" : "No notes found"}</p>
            </div>
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex">
        <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-50 to-indigo-50/20 dark:from-slate-950 dark:to-indigo-950/20">
          {selectedNote ? (
            <>
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-3">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    disabled={!canEdit()}
                    className="flex-1 text-3xl font-bold bg-transparent border-none focus:outline-none text-slate-800 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-600 disabled:cursor-not-allowed"
                    placeholder="Note title..."
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowComments(!showComments)}
                      className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-slate-700 dark:text-slate-300"
                    >
                      <MessageSquare className="w-4 h-4" />
                      {selectedNote.comments.length > 0 && (
                        <span className="text-sm font-medium">{selectedNote.comments.length}</span>
                      )}
                    </button>
                    {selectedNote.createdBy === user?.email && (
                      <button
                        onClick={() => setShowShareModal(true)}
                        className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-slate-700 dark:text-slate-300"
                      >
                        <Share2 className="w-4 h-4" />
                        <span className="text-sm font-medium">Share</span>
                      </button>
                    )}
                    <button
                      onClick={handleSaveNote}
                      disabled={!hasUnsavedChanges || !canEdit()}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                        hasUnsavedChanges && canEdit()
                          ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/30"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed"
                      }`}
                    >
                      {saveStatus === "saving" ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : saveStatus === "saved" ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Saved</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>Save</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Last saved {format(new Date(selectedNote.updatedAt), "MMM d, yyyy 'at' h:mm a")}
                    {selectedNote.createdBy !== user?.email && (
                      <span className="ml-2 text-purple-600 dark:text-purple-400">
                        • Shared by {selectedNote.createdBy}
                      </span>
                    )}
                    {selectedNote.lastEditedBy && selectedNote.lastEditedBy !== user?.email && (
                      <span className="ml-2 text-amber-600 dark:text-amber-400">
                        • Last edited by {selectedNote.lastEditedBy}
                      </span>
                    )}
                  </p>
                  {!canEdit() && (
                    <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg">
                      View Only
                    </span>
                  )}
                </div>
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
            <div className="flex-1 flex items-center justify-center text-slate-400 dark:text-slate-500">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-10 h-10 text-indigo-400 dark:text-indigo-500" />
                </div>
                <p className="text-lg">Create a new note to get started</p>
              </div>
            </div>
          )}
        </div>

        {/* Comments Sidebar */}
        {showComments && selectedNote && (
          <div className="w-80 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">Comments</h3>
              <button
                onClick={() => setShowComments(false)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {selectedNote.comments.map((comment) => (
                <div key={comment.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm text-slate-800 dark:text-slate-100">{comment.author}</span>
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      {format(new Date(comment.createdAt), "MMM d, h:mm a")}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{comment.content}</p>
                </div>
              ))}

              {selectedNote.comments.length === 0 && (
                <div className="text-center py-8 text-slate-400 dark:text-slate-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No comments yet</p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                rows={3}
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none mb-3"
              />
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className="w-full px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-indigo-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Post Comment
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Share Modal */}
      {showShareModal && selectedNote && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6 m-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Share Note</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Permission
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setSharePermission("view")}
                    className={`flex-1 px-4 py-3 rounded-xl border-2 transition-all ${
                      sharePermission === "view"
                        ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300"
                        : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    View Only
                  </button>
                  <button
                    onClick={() => setSharePermission("edit")}
                    className={`flex-1 px-4 py-3 rounded-xl border-2 transition-all ${
                      sharePermission === "edit"
                        ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300"
                        : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    Can Edit
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={handleShareNote}
              disabled={!shareEmail}
              className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-indigo-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-6"
            >
              Share Note
            </button>

            {/* Current Shares */}
            {selectedNote.sharedWith.length > 0 && (
              <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  Shared With
                </h4>
                <div className="space-y-2">
                  {selectedNote.sharedWith.map((share) => (
                    <div
                      key={share.email}
                      className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                          {share.email}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {share.permission === "edit" ? "Can edit" : "View only"}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveShare(share.email)}
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4 text-red-500 dark:text-red-400" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
