import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { createClient } from "npm:@supabase/supabase-js@2";

const app = new Hono();

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "https://hwvkodrvjrpfhkihezoy.supabase.co";
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "sb_publishable_ybnavdiK_K3fGdcRE0eR_g_kcHWR3NL";

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-8b681bab/health", (c: any) => {
  return c.json({ status: "ok" });
});

// ============ AUTH ROUTES ============

// Sign up endpoint
app.post("/make-server-8b681bab/auth/signup", async (c: any) => {
  try {
    const { email, password, name } = await c.req.json();
    
    if (!email || !password || !name) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    if (!supabaseServiceKey) {
      return c.json(
        { error: "Server misconfiguration: SUPABASE_SERVICE_ROLE_KEY is required for signup" },
        500,
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log(`Error creating user during signup: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ user: data.user });
  } catch (error) {
    console.log(`Server error during signup: ${error}`);
    return c.json({ error: "Internal server error during signup" }, 500);
  }
});

// ============ NOTES ROUTES ============

// Helper function to verify user authentication
async function verifyUser(authHeader: string | null) {
  if (!authHeader) {
    return null;
  }
  
  const token = authHeader.split(' ')[1];
  const authKey = supabaseServiceKey || supabaseAnonKey;
  if (!authKey) {
    return null;
  }

  const supabase = createClient(supabaseUrl, authKey);
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    return null;
  }
  
  return user;
}

// Get all notes for a user (including shared notes)
app.get("/make-server-8b681bab/notes", async (c: any) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized - invalid or missing access token" }, 401);
    }

    // Get all notes where user is creator or collaborator
    const allNotes = await kv.getByPrefix("note:");
    const userNotes = allNotes.filter((item: any) => {
      const note = item.value;
      return note.createdBy === user.email || 
             note.sharedWith?.some((share: any) => share.email === user.email);
    });

    return c.json({ notes: userNotes.map((item: any) => item.value) });
  } catch (error) {
    console.log(`Error fetching notes: ${error}`);
    return c.json({ error: "Failed to fetch notes" }, 500);
  }
});

// Get a single note
app.get("/make-server-8b681bab/notes/:id", async (c: any) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized - invalid or missing access token" }, 401);
    }

    const noteId = c.req.param('id');
    const note = await kv.get(`note:${noteId}`);

    if (!note) {
      return c.json({ error: "Note not found" }, 404);
    }

    // Check if user has access to this note
    const hasAccess = note.createdBy === user.email || 
                      note.sharedWith?.some((share: any) => share.email === user.email);
    
    if (!hasAccess) {
      return c.json({ error: "Access denied to this note" }, 403);
    }

    return c.json({ note });
  } catch (error) {
    console.log(`Error fetching note: ${error}`);
    return c.json({ error: "Failed to fetch note" }, 500);
  }
});

// Create a new note
app.post("/make-server-8b681bab/notes", async (c: any) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized - invalid or missing access token" }, 401);
    }

    const { title, content } = await c.req.json();
    
    const noteId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const note = {
      id: noteId,
      title: title || "Untitled Note",
      content: content || "",
      createdBy: user.email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sharedWith: [],
      comments: [],
    };

    await kv.set(`note:${noteId}`, note);

    return c.json({ note });
  } catch (error) {
    console.log(`Error creating note: ${error}`);
    return c.json({ error: "Failed to create note" }, 500);
  }
});

// Update a note
app.put("/make-server-8b681bab/notes/:id", async (c: any) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized - invalid or missing access token" }, 401);
    }

    const noteId = c.req.param('id');
    const note = await kv.get(`note:${noteId}`);

    if (!note) {
      return c.json({ error: "Note not found" }, 404);
    }

    // Check if user has edit permission
    const isCreator = note.createdBy === user.email;
    const sharedAccess = note.sharedWith?.find((share: any) => share.email === user.email);
    const canEdit = isCreator || sharedAccess?.permission === "edit";

    if (!canEdit) {
      return c.json({ error: "No edit permission for this note" }, 403);
    }

    const { title, content } = await c.req.json();
    
    const updatedNote = {
      ...note,
      title: title !== undefined ? title : note.title,
      content: content !== undefined ? content : note.content,
      updatedAt: new Date().toISOString(),
      lastEditedBy: user.email,
    };

    await kv.set(`note:${noteId}`, updatedNote);

    return c.json({ note: updatedNote });
  } catch (error) {
    console.log(`Error updating note: ${error}`);
    return c.json({ error: "Failed to update note" }, 500);
  }
});

// Delete a note
app.delete("/make-server-8b681bab/notes/:id", async (c: any) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized - invalid or missing access token" }, 401);
    }

    const noteId = c.req.param('id');
    const note = await kv.get(`note:${noteId}`);

    if (!note) {
      return c.json({ error: "Note not found" }, 404);
    }

    // Only creator can delete
    if (note.createdBy !== user.email) {
      return c.json({ error: "Only the creator can delete this note" }, 403);
    }

    await kv.del(`note:${noteId}`);

    return c.json({ success: true });
  } catch (error) {
    console.log(`Error deleting note: ${error}`);
    return c.json({ error: "Failed to delete note" }, 500);
  }
});

// Share a note
app.post("/make-server-8b681bab/notes/:id/share", async (c: any) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized - invalid or missing access token" }, 401);
    }

    const noteId = c.req.param('id');
    const note = await kv.get(`note:${noteId}`);

    if (!note) {
      return c.json({ error: "Note not found" }, 404);
    }

    // Only creator can share
    if (note.createdBy !== user.email) {
      return c.json({ error: "Only the creator can share this note" }, 403);
    }

    const { email, permission } = await c.req.json();
    
    if (!email || !permission || !["view", "edit"].includes(permission)) {
      return c.json({ error: "Invalid share parameters" }, 400);
    }

    // Remove existing share for this email if any
    const sharedWith = note.sharedWith?.filter((share: any) => share.email !== email) || [];
    sharedWith.push({ email, permission });

    const updatedNote = {
      ...note,
      sharedWith,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`note:${noteId}`, updatedNote);

    return c.json({ note: updatedNote });
  } catch (error) {
    console.log(`Error sharing note: ${error}`);
    return c.json({ error: "Failed to share note" }, 500);
  }
});

// Remove share access
app.delete("/make-server-8b681bab/notes/:id/share/:email", async (c: any) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized - invalid or missing access token" }, 401);
    }

    const noteId = c.req.param('id');
    const emailToRemove = c.req.param('email');
    const note = await kv.get(`note:${noteId}`);

    if (!note) {
      return c.json({ error: "Note not found" }, 404);
    }

    // Only creator can remove shares
    if (note.createdBy !== user.email) {
      return c.json({ error: "Only the creator can remove share access" }, 403);
    }

    const sharedWith = note.sharedWith?.filter((share: any) => share.email !== emailToRemove) || [];

    const updatedNote = {
      ...note,
      sharedWith,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`note:${noteId}`, updatedNote);

    return c.json({ note: updatedNote });
  } catch (error) {
    console.log(`Error removing share: ${error}`);
    return c.json({ error: "Failed to remove share" }, 500);
  }
});

// Add comment to note
app.post("/make-server-8b681bab/notes/:id/comments", async (c: any) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized - invalid or missing access token" }, 401);
    }

    const noteId = c.req.param('id');
    const note = await kv.get(`note:${noteId}`);

    if (!note) {
      return c.json({ error: "Note not found" }, 404);
    }

    // Check if user has access
    const hasAccess = note.createdBy === user.email || 
                      note.sharedWith?.some((share: any) => share.email === user.email);
    
    if (!hasAccess) {
      return c.json({ error: "Access denied to this note" }, 403);
    }

    const { content } = await c.req.json();
    
    if (!content || !content.trim()) {
      return c.json({ error: "Comment content is required" }, 400);
    }

    const comment = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      author: user.user_metadata?.name || user.email,
      authorEmail: user.email,
      content,
      createdAt: new Date().toISOString(),
    };

    const comments = [...(note.comments || []), comment];

    const updatedNote = {
      ...note,
      comments,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`note:${noteId}`, updatedNote);

    return c.json({ note: updatedNote, comment });
  } catch (error) {
    console.log(`Error adding comment: ${error}`);
    return c.json({ error: "Failed to add comment" }, 500);
  }
});

Deno.serve(app.fetch);