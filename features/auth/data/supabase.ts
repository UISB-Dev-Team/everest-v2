
import { createClient } from "@/lib/supabase/client";
import type { AuthRole, AuthSession, AuthState, AuthUser, SignInInput, SignInResult } from "./types";
import { Session, User } from "@supabase/supabase-js";

const supabaseClient = await createClient();

async function mapSupabaseUser(user: User | null): Promise<AuthUser | null> {
    if (!user) return null;

    const meta = user.user_metadata || {};

    // ✅ Everything from JWT — no DB call, no hanging
    return {
        id: user.id,
        email: user.email || "",
        fullName: meta.full_name ?? `${meta.first_name ?? ""} ${meta.last_name ?? ""}`.trim(),
        role: (meta.role as AuthRole) ?? "dormer",
        dormitoryId: meta.dormitory_id ?? null,
        avatarUrl: meta.avatar_url ?? null,
    };
}

function mapSupabaseSession(session: Session | null, mappedUser: AuthUser | null): AuthSession | null {
    if(!session || !mappedUser) return null;

    return {
        user: mappedUser,
        expiresAt: session.expires_at || 0,
    }
}

let currentState: AuthState = {
    loading: true,
    user: null,
    session: null,
}


const listeners = new Set<(state: AuthState) => void>();

function updateState(newState: Partial<AuthState>) {
    currentState = { ...currentState, ...newState};
    listeners.forEach((listener) => listener(currentState));
}

supabaseClient.auth.getSession().then(async ({ data: { session } }) => {

    const mappedUser = await mapSupabaseUser(session?.user ?? null);

    updateState({
        loading: false,
        user: mappedUser,
        session: mapSupabaseSession(session, mappedUser),
    });
});

const loadingTimeout = setTimeout(() => {
    if (currentState.loading) {
        console.warn("[auth] Loading timeout — forcing unauthenticated state");
        updateState({ loading: false, user: null, session: null });
    }
}, 5000);

supabaseClient.auth.onAuthStateChange(async (_event, session) => {
    try {
        const mappedUser = await mapSupabaseUser(session?.user ?? null);
        clearTimeout(loadingTimeout); 
        updateState({
            loading: false,
            user: mappedUser,
            session: mapSupabaseSession(session, mappedUser),
        });
    } catch (err) {
        console.error("[onAuthStateChange] error:", err);
        clearTimeout(loadingTimeout);
        updateState({ loading: false, user: null, session: null }); 
    }
});

export function subscribe(listener: (state: AuthState) => void) : () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

export function getSnapshot(): AuthState {
    return currentState;
}

export function getServerSnapshot(): AuthState {
    return currentState;
}

export async function signIn(input: SignInInput): Promise<SignInResult> {
    const { error } = await supabaseClient.auth.signInWithPassword({
        email: input.email,
        password: input.password,
    })

    if(error) {
        return { error: error.message}
    }

    return {}
}

export async function signOut(): Promise<void> {
    const {error} = await supabaseClient.auth.signOut();
    if(error) {
        console.error("Sign out error: ", error);
        throw error;
    }
}

export async function setRole(role: AuthRole) {
    updateState({
        session: {
            user: {
                ...currentState.user!,
                role: role,
            },
            expiresAt: currentState.session!.expiresAt,
        },
    })
}
