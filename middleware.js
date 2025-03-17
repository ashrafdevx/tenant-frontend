// middleware.js
import { NextResponse } from "next/server";

export function middleware(request) {
  // Get the pathname of the request
  const { pathname } = request.nextUrl;

  // Define protected routes that require authentication
  const protectedRoutes = ["/tasks", "/profile", "/dashboard"];

  // Check if the requested path is a protected route
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Get token from cookies (not localStorage, as middleware runs on server)
  const token = request.cookies.get("token")?.value;

  // If trying to access a protected route without a token, redirect to login
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If already logged in (has token) and trying to access login page, redirect to tasks
  if (pathname === "/login" && token) {
    return NextResponse.redirect(new URL("/tasks", request.url));
  }

  // Allow the request to continue
  return NextResponse.next();
}

// Configure which routes this middleware applies to
export const config = {
  matcher: [
    // Protected routes
    "/tasks/:path*",
    "/profile/:path*",
    "/dashboard/:path*",
    // Auth routes
    "/login",
    "/register",
  ],
};
