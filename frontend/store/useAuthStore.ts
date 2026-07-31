import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider: "google" | "email";
}

interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  loginWithGoogle: (googleData?: { email?: string; name?: string; avatar?: string }) => void;
  loginWithEmail: (email: string, name?: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,

      loginWithGoogle: (googleData) => {
        const newUser: AuthUser = {
          id: `usr_google_${Date.now()}`,
          name: googleData?.name || googleData?.email?.split("@")[0] || "User",
          email: googleData?.email || "",
          avatar: googleData?.avatar || "",
          provider: "google",
        };

        set({
          isAuthenticated: true,
          user: newUser,
        });
      },

      loginWithEmail: (email, name) => {
        const newUser: AuthUser = {
          id: `usr_email_${Date.now()}`,
          name: name || email.split("@")[0] || "User",
          email: email,
          avatar: undefined,
          provider: "email",
        };

        set({
          isAuthenticated: true,
          user: newUser,
        });
      },

      logout: () => {
        set({
          isAuthenticated: false,
          user: null,
        });
      },
    }),
    {
      name: "fitx_auth_store_v5",
    }
  )
);
