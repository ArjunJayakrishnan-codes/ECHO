import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authAPI } from "../services/api";

interface User {
  id: string;
  email: string;
  name: string;
  accessToken?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing session in localStorage
    const savedUser = localStorage.getItem("echo_user");
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.log("Error loading saved user:", error);
        localStorage.removeItem("echo_user");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.login(email, password);
      
      const userData: User = {
        id: response.user.id,
        email: response.user.email,
        name: response.user.name,
        accessToken: response.token,
      };
      
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem("echo_user", JSON.stringify(userData));
      return true;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Login failed";
      setError(errorMsg);
      console.log("Login error:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (
    email: string,
    password: string,
    name: string
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.signup(email, password, name);
      
      const userData: User = {
        id: response.user.id,
        email: response.user.email,
        name: response.user.name,
        accessToken: response.token,
      };
      
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem("echo_user", JSON.stringify(userData));
      return true;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Signup failed";
      setError(errorMsg);
      console.log("Signup error:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      setError(null);
      await authAPI.logout();
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem("echo_user");
    } catch (error) {
      console.log("Logout error:", error);
      // Still logout locally even if API call fails
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem("echo_user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isAuthenticated, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}