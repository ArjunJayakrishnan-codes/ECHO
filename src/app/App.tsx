import { createBrowserRouter, RouterProvider, Navigate } from 'react-router';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { BlogPage } from './pages/BlogPage';
import { NotesPage } from './pages/NotesPage';
import { ChatPage } from './pages/ChatPage';
import { BlogPost } from './pages/BlogPost';

// Suppress react-quill's findDOMNode deprecation warning
// This is a known issue with react-quill library and doesn't affect functionality
const originalError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('findDOMNode')
  ) {
    return;
  }
  originalError.call(console, ...args);
};

const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
  },
  {
    path: "/",
    Component: () => (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { path: "dashboard", Component: DashboardPage },
      { path: "blog", Component: BlogPage },
      { path: "blog/:id", Component: BlogPost },
      { path: "notes", Component: NotesPage },
      { path: "chat", Component: ChatPage },
    ],
  },
]);

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
  );
}