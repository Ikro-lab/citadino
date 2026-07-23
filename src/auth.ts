import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      id: "credentials",
      name: "Tenant",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
        tenantSlug: { label: "Tenant", type: "text" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        const tenantSlug = credentials?.tenantSlug as string | undefined;
        if (!email || !password || !tenantSlug) return null;

        // Nunca confiar só no slug enviado pelo form: resolve de novo contra o banco.
        const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
        if (!tenant || !tenant.ativo) return null;

        const user = await prisma.user.findUnique({
          where: { tenantId_email: { tenantId: tenant.id, email } },
        });
        if (!user || !user.tenantId) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          tenantId: tenant.id,
          tenantSlug: tenant.slug,
        };
      },
    }),
    Credentials({
      id: "super-admin-credentials",
      name: "Super Admin",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const user = await prisma.user.findFirst({
          where: { role: "SUPER_ADMIN", email },
        });
        if (!user) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          tenantId: null,
          tenantSlug: null,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.tenantId = user.tenantId;
        token.tenantSlug = user.tenantSlug;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.tenantId = token.tenantId;
      session.user.tenantSlug = token.tenantSlug;
      return session;
    },
  },
});
