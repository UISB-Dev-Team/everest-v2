import type {
  AuthRole,
  AuthState,
  AuthUser,
  SignInInput,
  SignInResult,
} from "./types";

const STORAGE_KEY = "dormpay.mock.role";
const DORM_ID = "11111111-1111-1111-1111-111111111111";

const FIXTURES: Record<AuthRole, AuthUser> = {
  dormer: {
    id: "00000000-0000-0000-0000-0000000000d1",
    email: "dormer@example.com",
    fullName: "Pauline Dejos",
    role: "dormer",
    dormitoryId: DORM_ID,
    avatarUrl: null,
  },
  adviser: {
    id: "00000000-0000-0000-0000-0000000000a1",
    email: "adviser@example.com",
    fullName: "Mara Adviser",
    role: "adviser",
    dormitoryId: DORM_ID,
    avatarUrl: null,
  },
  treasurer: {
    id: "00000000-0000-0000-0000-0000000000a2",
    email: "treasurer@example.com",
    fullName: "Tomas Treasurer",
    role: "treasurer",
    dormitoryId: DORM_ID,
    avatarUrl: null,
  },
  auditor: {
    id: "00000000-0000-0000-0000-0000000000a3",
    email: "auditor@example.com",
    fullName: "Aria Auditor",
    role: "auditor",
    dormitoryId: DORM_ID,
    avatarUrl: null,
  },
  sa: {
    id: "00000000-0000-0000-0000-0000000000a4",
    email: "sa@example.com",
    fullName: "Sandy SA",
    role: "sa",
    dormitoryId: DORM_ID,
    avatarUrl: null,
  },
  super_admin: {
    id: "00000000-0000-0000-0000-0000000000s1",
    email: "superadmin@example.com",
    fullName: "Super Admin",
    role: "super_admin",
    dormitoryId: null,
    avatarUrl: null,
  },
};

function makeSession(user: AuthUser) {
  return { user, expiresAt: Date.now() + 1000 * 60 * 60 * 24 };
}

const DEFAULT_ROLE: AuthRole = "dormer";

function readStoredRole(): AuthRole | "unauthenticated" {
  if (typeof window === "undefined") return DEFAULT_ROLE;
  // Query param overrides storage on each load — convenient for ?role=admin links
  try {
    const params = new URLSearchParams(window.location.search);
    const queryRole = params.get("role");
    if (queryRole) {
      const resolved = resolveRole(queryRole);
      if (resolved) {
        window.localStorage.setItem(STORAGE_KEY, resolved);
        return resolved;
      }
    }
  } catch {
    // ignore
  }
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const resolved = resolveRole(stored);
      if (resolved) return resolved;
    }
  } catch {
    // ignore
  }
  return DEFAULT_ROLE;
}

function resolveRole(value: string): AuthRole | "unauthenticated" | null {
  if (value === "unauthenticated") return "unauthenticated";
  if (value === "admin") return "adviser";
  if (value === "student") return "dormer";
  if (value in FIXTURES) return value as AuthRole;
  return null;
}

function buildState(role: AuthRole | "unauthenticated"): AuthState {
  if (role === "unauthenticated") {
    return { user: null, session: null, loading: false };
  }
  const user = FIXTURES[role];
  return { user, session: makeSession(user), loading: false };
}

let state: AuthState = buildState(DEFAULT_ROLE);
const listeners = new Set<(state: AuthState) => void>();
let initialized = false;

function ensureClientInit() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  state = buildState(readStoredRole());
}

function notify() {
  for (const listener of listeners) listener(state);
}

const SERVER_SNAPSHOT: AuthState = buildState(DEFAULT_ROLE);

export function subscribe(listener: (state: AuthState) => void) {
  ensureClientInit();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getSnapshot(): AuthState {
  ensureClientInit();
  return state;
}

export function getServerSnapshot(): AuthState {
  return SERVER_SNAPSHOT;
}

export async function signIn(_input: SignInInput): Promise<SignInResult> {
  await new Promise((r) => setTimeout(r, 150));
  // Mock accepts any credentials. Backend dev wires real auth here.
  state = buildState(DEFAULT_ROLE);
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, DEFAULT_ROLE);
  }
  notify();
  return {};
}

export async function signOut(): Promise<void> {
  await new Promise((r) => setTimeout(r, 100));
  state = buildState("unauthenticated");
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, "unauthenticated");
  }
  notify();
}

export function setMockRole(role: AuthRole | "unauthenticated") {
  state = buildState(role);
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, role);
  }
  notify();
}
