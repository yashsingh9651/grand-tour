import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    backendToken?: string;
    user: {
      id: string;
      email: string;
      role: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role?: string;
    backendToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    backendToken?: string;
    role?: string;
    user?: any;
  }
}
