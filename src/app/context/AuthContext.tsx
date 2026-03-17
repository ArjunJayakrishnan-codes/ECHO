import { createContext, useContext, useState, useEffect, ReactNode } from "react";

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Get users from localStorage
      const usersData = localStorage.getItem("echo_users");
      const users = usersData ? JSON.parse(usersData) : {};

      if (users[email] && users[email].password === password) {
        const userData: User = {
          id: users[email].id,
          email: email,
          name: users[email].name,
          accessToken: `token-${Date.now()}`,
        };
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem("echo_user", JSON.stringify(userData));
        return true;
      }
      return false;
    } catch (error) {
      console.log("Login error:", error);
      return false;
    }
  };

  const signup = async (
    email: string,
    password: string,
    name: string
  ): Promise<boolean> => {
    try {
      // Get existing users
      const usersData = localStorage.getItem("echo_users");
      const users = usersData ? JSON.parse(usersData) : {};

      // Check if user already exists
      if (users[email]) {
        console.log("User already exists");
        return false;
      }

      // Create new user
      users[email] = {
        id: `user-${Date.now()}`,
        email,
        password,
        name,
      };

      localStorage.setItem("echo_users", JSON.stringify(users));

      // Auto login after signup
      return await login(email, password);
    } catch (error) {
      console.log("Signup error:", error);
      return false;
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem("echo_user");
    } catch (error) {
      console.log("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isAuthenticated }}>
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