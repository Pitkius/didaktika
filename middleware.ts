import { authConfig } from "@/lib/auth/auth.config";
import NextAuth from "next-auth";

export default NextAuth(authConfig).auth;

export const config = {
  matcher: [
    "/student/:path*",
    "/teacher/:path*",
    "/school-admin/:path*",
    "/admin/:path*",
  ],
};
