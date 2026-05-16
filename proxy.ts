import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function proxy(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({ request });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();

    let role: string | null = null;

    if (user) {
        const { data: dormRole } = await supabase
            .from("dormitory_roles")
            .select("role")
            .eq("user_id", user.id)
            .single();
        role = dormRole?.role ?? null;
    }

    const path = request.nextUrl.pathname;

    // ✅ Helper that always carries refreshed cookies forward
    const redirect = (pathname: string) => {
        const url = request.nextUrl.clone();
        url.pathname = pathname;
        const res = NextResponse.redirect(url);
        supabaseResponse.cookies.getAll().forEach(({ name, value }) => {
            res.cookies.set(name, value);
        });
        return res;
    };

    const getDashboardPath = (userRole: string | null) => {
        if (userRole === "super_admin") return "/super-admin/dashboard";
        if (["adviser", "treasurer", "auditor", "sa"].includes(userRole || "")) return "/admin/dashboard";
        return "/dashboard";
    };

    if (!user && path !== "/login") {
        return redirect("/login");
    }

    if (user) {
        if (path === "/login") {
            return redirect(getDashboardPath(role));
        }

        const isSuperAdminRoute = path.startsWith("/super-admin");
        const isAdminRoute = path.startsWith("/admin");
        const isDormerRoute = ["/dashboard", "/payments", "/fines", "/clearance"].some(
            (p) => path === p || path.startsWith(p + "/")
        );

        if (isSuperAdminRoute && role !== "super_admin") return redirect(getDashboardPath(role));
        if (isAdminRoute && !["adviser", "treasurer", "auditor", "sa"].includes(role || "")) return redirect(getDashboardPath(role));
        if (isDormerRoute && role && role !== "dormer") return redirect(getDashboardPath(role));
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};