import { auth } from "@/lib/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  // Protect /dashboard routes
  if (pathname.startsWith("/dashboard")) {
    if (!isLoggedIn) {
      return Response.redirect(new URL("/", req.nextUrl));
    }
    const user = req.auth?.user as any;
    if (user?.role === "SUPER_ADMIN" || user?.role === "ADMIN") {
      return Response.redirect(new URL("/admin", req.nextUrl));
    }
  }

  // Protect /admin routes
  if (pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      return Response.redirect(new URL("/", req.nextUrl));
    }
    
    // Check if the user is an admin
    const user = req.auth?.user as any;
    if (user?.role !== "ADMIN" && user?.role !== "SUPER_ADMIN") {
      // If they are logged in but not an admin, redirect them to the regular dashboard
      return Response.redirect(new URL("/dashboard", req.nextUrl));
    }
  }
});

export const config = {
  matcher: ["/dashboard/:path*", "/dashboard", "/admin/:path*", "/admin"],
};
