import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        return (
          user ?? (await prisma.user.create({ data: { email: credentials.email } }))
        );
      },
    }),
  ],
};


