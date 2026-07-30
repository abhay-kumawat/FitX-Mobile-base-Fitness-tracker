import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider: "google" | "email";
  google2faEnabled: boolean;
  google2faVerified: boolean;
  totpSecret?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  requires2FA: boolean;
  tempUser: AuthUser | null;
  loginWithGoogle: (googleData?: { email?: string; name?: string; avatar?: string }) => void;
  loginWithEmail: (email: string, name?: string) => void;
  verify2FA: (code: string) => boolean;
  enable2FA: () => void;
  disable2FA: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      requires2FA: false,
      tempUser: null,

      loginWithGoogle: (googleData) => {
        const newUser: AuthUser = {
          id: `usr_google_${Date.now()}`,
          name: googleData?.name || "Abhay Kumawat",
          email: googleData?.email || "abhaykumawat@gmail.com",
          avatar: googleData?.avatar || "https://lh3.googleusercontent.com/a/default-user=s96-c",
          provider: "google",
          google2faEnabled: true,
          google2faVerified: false,
          totpSecret: "JBSWY3DPEHPK3PXP",
        };

        // Trigger 2FA verification step
        set({
          requires2FA: true,
          tempUser: newUser,
        });
      },

      loginWithEmail: (email, name) => {
        const newUser: AuthUser = {
          id: `usr_email_${Date.now()}`,
          name: name || email.split("@")[0],
          email: email,
          avatar: undefined,
          provider: "email",
          google2faEnabled: false,
          google2faVerified: true,
        };

        set({
          isAuthenticated: true,
          user: newUser,
          requires2FA: false,
          tempUser: null,
        });
      },

      verify2FA: (code: string) => {
        const cleaned = code.trim();
        if (cleaned.length === 6) {
          const state = get();
          const targetUser = state.tempUser || state.user;
          if (targetUser) {
            const verifiedUser: AuthUser = {
              ...targetUser,
              google2faVerified: true,
            };
            set({
              isAuthenticated: true,
              user: verifiedUser,
              requires2FA: false,
              tempUser: null,
            });
            return true;
          }
        }
        return false;
      },

      enable2FA: () => {
        set((state) => ({
          user: state.user
            ? { ...state.user, google2faEnabled: true, totpSecret: "JBSWY3DPEHPK3PXP" }
            : null,
        }));
      },

      disable2FA: () => {
        set((state) => ({
          user: state.user ? { ...state.user, google2faEnabled: false } : null,
        }));
      },

      logout: () => {
        set({
          isAuthenticated: false,
          user: null,
          requires2FA: false,
          tempUser: null,
        });
      },
    }),
    {
      name: "fitx_auth_store_v2",
    }
  )
);
