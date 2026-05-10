import type { Enums } from "@/database.types";

export type AuthRole = Enums<"user_role_enum">;

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: AuthRole;
  dormitoryId: string | null;
  avatarUrl: string | null;
}

export interface AuthSession {
  user: AuthUser;
  expiresAt: number;
}

export interface AuthState {
  user: AuthUser | null;
  session: AuthSession | null;
  loading: boolean;
}

export interface SignInInput {
  email: string;
  password: string;
}

export interface SignInResult {
  error?: string;
}
