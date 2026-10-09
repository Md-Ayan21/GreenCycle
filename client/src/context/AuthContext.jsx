
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const AuthContext = createContext(null);

const API_BASE_URL = "http://localhost:5000/api";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("greencycle_user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(
    () => localStorage.getItem("greencycle_token") || ""
  );

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function verifySession() {
      if (!token) {
        if (!cancelled) setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Session expired");
        }

        if (!cancelled) {
          setUser(result.user);
          localStorage.setItem(
            "greencycle_user",
            JSON.stringify(result.user)
          );
        }
      } catch {
        if (!cancelled) {
          setUser(null);
          setToken("");
          localStorage.removeItem("greencycle_user");
          localStorage.removeItem("greencycle_token");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    verifySession();

    return () => {
      cancelled = true;
    };
  }, [token]);

  async function login(email, password) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Login failed");
    }

    localStorage.setItem("greencycle_token", result.token);
    localStorage.setItem("greencycle_user", JSON.stringify(result.user));

    setUser(result.user);
    setToken(result.token);

    return result.user;
  }

  async function register(userData) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Registration failed");
    }

    localStorage.setItem("greencycle_token", result.token);
    localStorage.setItem("greencycle_user", JSON.stringify(result.user));

    setUser(result.user);
    setToken(result.token);

    return result.user;
  }

  function logout() {
    localStorage.removeItem("greencycle_token");
    localStorage.removeItem("greencycle_user");

    setUser(null);
    setToken("");
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: Boolean(token && user),
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
