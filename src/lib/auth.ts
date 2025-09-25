import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  // adapter: PrismaAdapter(prisma) as any,
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-key-for-development",
  pages: {
    signIn: "/login",
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role;
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;
        
        try {
          const user = await prisma.user.findUnique({ where: { email: credentials.email } });
          if (user) {
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
            };
          }
          // Only create new user if they don't exist
          const newUser = await prisma.user.create({ 
            data: { 
              email: credentials.email,
              role: "CUSTOMER" // Default role for new users
            } 
          });
          return {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            role: newUser.role,
          };
        } catch (error) {
          console.error("Database error in authorize:", error);
          // Fallback: return a basic user object for demo purposes
          return {
            id: credentials.email,
            email: credentials.email,
            name: credentials.email.split('@')[0],
            role: credentials.email === "provider@example.com" ? "PROVIDER" : "CUSTOMER",
          };
        }
      },
    }),
  ],
};


