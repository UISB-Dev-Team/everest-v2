import * as supabase from "./supabase";
import type { AuthRole, AuthState, SignInInput, SignInResult } from "./types";

export interface AuthDataAccess {
  subscribe(listener: (state: AuthState) => void): () => void;
  getSnapshot(): AuthState;
  getServerSnapshot(): AuthState;
  signIn(input: SignInInput): Promise<SignInResult>;
  signOut(): Promise<void>;
  setRole(role: AuthRole): void;
  resetPasswordForEmail(email: string, redirectTo: string): Promise<{ error: string | null }>;
  updatePassword(newPassword: string): Promise<{ error: string | null }>;
}

export const authData: AuthDataAccess = supabase;

export type { AuthRole, AuthSession, AuthState, AuthUser, SignInInput, SignInResult } from "./types";

