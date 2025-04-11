import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { db } from "./db"
import { getServerSession } from "next-auth/next"
import { NextRequest } from "next/server"

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  try {
    const response = await fetch('/api/auth/verify-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password, hashedPassword }),
    });
    
    const result = await response.json();
    return result.valid;
  } catch (error) {
    console.error('Error verifying password:', error);
    return false;
  }
}

export async function hashPassword(password: string): Promise<string> {
  try {
    const response = await fetch('/api/auth/hash-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password }),
    });
    
    const result = await response.json();
    return result.hashedPassword;
  } catch (error) {
    console.error('Error hashing password:', error);
    throw error;
  }
}

export const auth = async () => {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error('Not authenticated')
  }
  return { userId: session.user.id }
}

export async function getToken(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get('authorization');
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // If no authorization header, try to get token from cookies or session
  const session = await getServerSession(authOptions);
  return session?.user?.id || null;
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await db.user.findUnique({
          where: {
            email: credentials.email,
          },
        })

        if (!user) {
          return null
        }

        const isPasswordValid = await verifyPassword(credentials.password, user.password)

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
}
