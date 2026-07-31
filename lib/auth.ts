import NextAuth, { type Session } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

type PersistedAuthUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  updatedAt: Date;
};

type PersistedAuthUserLookup = (id: string) => Promise<PersistedAuthUser | null>;

export function isCurrentSessionVersion(
  sessionVersion: unknown,
  updatedAt: Date,
): sessionVersion is string {
  return typeof sessionVersion === "string"
    && sessionVersion.length > 0
    && sessionVersion === updatedAt.toISOString();
}

/**
 * Reloads identity fields from the database and rejects stale, deleted, or
 * otherwise unverifiable users. The injectable lookup keeps this boundary
 * directly testable without weakening the production lookup.
 */
export async function validatePersistedSession(
  session: Session | null,
  lookupUser: PersistedAuthUserLookup,
): Promise<Session | null> {
  const userId = session?.user?.id;
  const sessionVersion = session?.user?.sessionVersion;
  if (!userId || typeof sessionVersion !== "string" || !sessionVersion) return null;

  try {
    const currentUser = await lookupUser(userId);
    if (!currentUser || !isCurrentSessionVersion(sessionVersion, currentUser.updatedAt)) {
      return null;
    }

    return {
      ...session,
      user: {
        ...session.user,
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        image: currentUser.image,
        role: currentUser.role,
        sessionVersion: currentUser.updatedAt.toISOString(),
      },
    };
  } catch {
    return null;
  }
}

const nextAuth = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.image,
          sessionVersion: user.updatedAt.toISOString(),
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.sessionVersion = user.sessionVersion;
      }
      return token;
    },
    session({ session, token }) {
      session.user.role = typeof token.role === "string" ? token.role : "";
      session.user.id = typeof token.id === "string" ? token.id : "";
      session.user.sessionVersion = typeof token.sessionVersion === "string"
        ? token.sessionVersion
        : undefined;
      return session;
    },
  },
  pages: {
    signIn: "/admin/login",
  },
  session: { strategy: "jwt" },
});

export const { handlers, signIn, signOut } = nextAuth;

/**
 * Server-only authentication boundary. Every call verifies that the JWT still
 * matches the current persisted user before returning an authenticated session.
 */
export async function auth(): Promise<Session | null> {
  const session = await nextAuth.auth();
  return validatePersistedSession(
    session,
    async (id) => prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        updatedAt: true,
      },
    }),
  );
}
