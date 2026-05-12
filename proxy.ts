import { NextRequest, NextResponse } from "next/server";
import { createClient } from "./lib/supabase/server";
import { createServerClient } from "@supabase/ssr";

export async function proxy(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });
    
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
            .eq("user_id", user!.id)
            .single()

        role = dormRole?.role as string | null;
    }

    const path = request.nextUrl.pathname;

    const getDashboardUrl = (userRole: string | null) => {
        const url = request.nextUrl.clone();
        if (userRole === "super_admin")
            url.pathname = "/super-admin/dashboard";
        else if (["adviser", "treasurer", "auditor", "sa"].includes(userRole || ""))
            url.pathname = "/admin/dashboard";
        else if (userRole === "dormer" || !userRole)
            url.pathname = "/dashboard";
        else
            url.pathname = "/login";
        return url;
    };

    if (!user && path !== "/login") {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        return NextResponse.redirect(url);
    }

    if (user) {
        if (path === "/login") {
            return NextResponse.redirect(getDashboardUrl(role));
        }

        const isSuperAdminRoute = path.startsWith("/super-admin");
        const isAdminRoute = path.startsWith("/admin");
        const isDormerRoute = ["/dashboard", "/payments", "/fines", "/clearance"].some(
            (p) => path === p || path.startsWith(p + "/")
        );

        if (isSuperAdminRoute && role !== "super_admin") {
            return NextResponse.redirect(getDashboardUrl(role));
        }

        if (isAdminRoute && !["adviser", "treasurer", "auditor", "sa"].includes(role || "")) {
            return NextResponse.redirect(getDashboardUrl(role));
        }

        if (isDormerRoute && role && role !== "dormer") {
            return NextResponse.redirect(getDashboardUrl(role));
        }
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};