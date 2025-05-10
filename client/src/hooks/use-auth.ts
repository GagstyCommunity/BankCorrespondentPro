import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { User, loginUser, logoutUser, getCurrentUser, getDashboardPath } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

// Simple navigation function without using useRouter
const navigate = (path: string) => {
  window.history.pushState(null, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [location] = useLocation();
  const { toast } = useToast();

  // Check for current user on initial load
  useEffect(() => {
    async function loadUser() {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  // Login function
  const login = useCallback(
    async (username: string, password: string, role: string) => {
      try {
        setLoading(true);
        const loggedInUser = await loginUser({ username, password, role });
        setUser(loggedInUser);
        
        // Navigate to appropriate dashboard
        const dashboardPath = getDashboardPath(loggedInUser.role);
        navigate(dashboardPath);
        
        toast({
          title: "Login successful",
          description: `Welcome back, ${loggedInUser.fullName}!`,
        });
        
        return loggedInUser;
      } catch (error) {
        console.error("Login error:", error);
        toast({
          title: "Login failed",
          description: "Invalid credentials. Please try again.",
          variant: "destructive",
        });
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  // Logout function
  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await logoutUser();
      setUser(null);
      navigate("/login");
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: "An error occurred during logout.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Check if user needs to be redirected to login
  useEffect(() => {
    // Skip redirection if still loading or on public pages
    if (loading || location === "/" || location === "/login" || location === "/register") {
      return;
    }
    
    // Redirect to login if not authenticated
    if (!user && location.startsWith("/dashboard")) {
      navigate("/login");
      toast({
        title: "Authentication required",
        description: "Please log in to access this page",
        variant: "destructive",
      });
    }
  }, [user, loading, location, toast]);

  return {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };
}
