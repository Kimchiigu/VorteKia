"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useToast } from "@/hooks/use-toast";
import { invoke } from "@tauri-apps/api/core";

type AuthContextType = {
  user: User | null;
  login: (uid: string) => Promise<boolean>;
  logout: () => void;
  fetchBalance: () => void;
  topUpBalance: (amount: number) => Promise<boolean>;
  notifications: Notification[];
  fetchNotifications: () => void;
  markAllNotificationsAsRead: () => void;
};

type Notification = {
  notification_id: string;
  title: string;
  message: string;
  date: string;
  is_read: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const savedUser = localStorage.getItem("vortekia-user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchBalance();
      fetchNotifications();
    }
  }, [user?.user_id]);

  useEffect(() => {
    if (!user) return;

    let timer: NodeJS.Timeout;

    const resetTimer = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        logout();
      }, 60000);
    };

    const events = ["mousemove", "keydown", "scroll", "click"];
    events.forEach((event) => window.addEventListener(event, resetTimer));

    resetTimer();

    return () => {
      events.forEach((event) => window.removeEventListener(event, resetTimer));
      if (timer) clearTimeout(timer);
    };
  }, [user]);

  const login = async (uid: string): Promise<boolean> => {
    try {
      console.log("Trying login");
      const result = await invoke<{
        success: boolean;
        data?: User;
        message?: string;
      }>("login_user", { userId: uid });

      console.log("login result : ", result);
      if (result.data) {
        setUser(result.data);
        localStorage.setItem("vortekia-user", JSON.stringify(result.data));

        toast({
          title: "Login successful",
          description: `Welcome back, ${result.data.name}!`,
        });

        return true;
      } else {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: result.message || "Please try again",
        });
        return false;
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login error",
        description: "An unexpected error occurred.",
      });
      console.error("Login error:", error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setNotifications([]);
    localStorage.removeItem("vortekia-user");

    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
  };

  const fetchBalance = async () => {
    if (!user) return;

    try {
      const result = await invoke<{
        success: boolean;
        data?: { balance: number };
      }>("get_balance", { userId: user.user_id });

      if (result.success && result.data) {
        setUser((prev) =>
          prev ? { ...prev, balance: result.data!.balance } : null
        );
        localStorage.setItem(
          "vortekia-user",
          JSON.stringify({ ...user, balance: result.data!.balance })
        );
      }
    } catch (error) {
      console.error("Failed to fetch balance:", error);
    }
  };

  const topUpBalance = async (amount: number): Promise<boolean> => {
    if (!user) return false;

    try {
      const result = await invoke<{
        success: boolean;
        data?: { balance: number };
      }>("top_up_balance", { payload: { user_id: user.user_id, amount } });

      if (result.data) {
        setUser((prev) =>
          prev ? { ...prev, balance: result.data!.balance } : null
        );
        localStorage.setItem(
          "vortekia-user",
          JSON.stringify({ ...user, balance: result.data!.balance })
        );

        toast({
          title: "Balance updated",
          description: `$${amount} has been added to your balance`,
        });

        return true;
      } else {
        toast({
          variant: "destructive",
          title: "Top-up failed",
          description: "An error occurred. Please try again.",
        });
        return false;
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Top-up error",
        description: "An unexpected error occurred.",
      });
      console.error("Top-up error:", error);
      return false;
    }
  };

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      const result = await invoke<{ success: boolean; data: Notification[] }>(
        "view_notification",
        { userId: user.user_id }
      );

      console.log("Notification User : ", result.data);

      if (result.data) {
        setNotifications(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const markAllNotificationsAsRead = async () => {
    if (!user) return;

    try {
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      await invoke("mark_all_notifications_read", { userId: user.user_id });
      fetchNotifications();
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        fetchBalance,
        topUpBalance,
        notifications,
        fetchNotifications,
        markAllNotificationsAsRead,
      }}
    >
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
