import { NextResponse } from "next/server";

export function middleware(req) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("token")?.value || null;

  const isAuthRoute = pathname === "/login" || pathname === "/register";
  const isProtectedRoute = ["/tasks", "/profile", "/dashboard"].includes(
    pathname
  );

  // If token exists & user tries to access login/register, redirect to tasks page
  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL("/tasks", req.nextUrl));
  }

  // If token is missing & user tries to access protected pages, redirect to login
  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  // Redirect unknown routes to a 404 page
  if (!isAuthRoute && !isProtectedRoute && pathname !== "/") {
    return NextResponse.redirect(new URL("/404", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/tasks", "/profile", "/dashboard", "/login", "/register", "/404"],
};
