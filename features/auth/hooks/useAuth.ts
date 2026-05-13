"use client";

import { useCallback, useSyncExternalStore } from "react";
import { authData } from "@/features/auth/data";
import type { SignInInput } from "@/features/auth/data";

export function useAuth() {  
  const state = useSyncExternalStore(
    authData.subscribe,
    authData.getSnapshot,
    authData.getServerSnapshot
  );

  const signIn = useCallback(
    (input: SignInInput) => authData.signIn(input),
    []
  );
  const signOut = useCallback(() => authData.signOut(), []);

  return {
    user: state.user,
    session: state.session,
    loading: state.loading,
    isAuthenticated: state.user !== null,
    signIn,
    signOut,
  };
}