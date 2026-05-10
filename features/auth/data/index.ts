import * as mock from "./mock";
import type { AuthRole, AuthState, SignInInput, SignInResult } from "./types";

export interface AuthDataAccess {
  subscribe(listener: (state: AuthState) => void): () => void;
  getSnapshot(): AuthState;
  getServerSnapshot(): AuthState;
  signIn(input: SignInInput): Promise<SignInResult>;
  signOut(): Promise<void>;
  setMockRole?(role: AuthRole | "unauthenticated"): void;
}

// Single switch point. Backend dev replaces this with a real impl
// (e.g. `import * as supabase from "./supabase"; export const authData = supabase`).
export const authData: AuthDataAccess = mock;

export type { AuthRole, AuthSession, AuthState, AuthUser, SignInInput, SignInResult } from "./types";
