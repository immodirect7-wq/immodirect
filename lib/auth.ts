import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Email et mot de passe requis");
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                });

                if (!user || !user.password) {
                    throw new Error("Aucun utilisateur trouvé avec cet email");
                }

                const isValid = await bcrypt.compare(credentials.password, user.password);

                if (!isValid) {
                    throw new Error("Mot de passe incorrect");
                }

                if (user.isBanned) {
                    throw new Error("Votre compte a été banni par un administrateur.");
                }

                return { id: user.id, email: user.email, name: user.email }; // Using email as name fallback
            },
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            if (user.email) {
                let dbUser = await prisma.user.findUnique({
                    where: { email: user.email }
                });

                // Auto-create user for Google sign-in if they don't exist
                if (!dbUser && account?.provider === "google") {
                    dbUser = await prisma.user.create({
                        data: {
                            email: user.email,
                            role: "SEEKER",
                        }
                    });
                }

                // If user exists and is banned, deny sign in
                if (dbUser && dbUser.isBanned) {
                    throw new Error("Votre compte a été banni par un administrateur.");
                }

                // Inject database ID and role into the user object for the JWT callback
                if (dbUser) {
                    user.id = dbUser.id;
                    (user as any).role = dbUser.role;
                }
            }
            return true;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role;
            }
            return token;
        },
        async session({ session, token }) {
            if (session?.user) {
                (session.user as any).id = token.id;
                (session.user as any).role = token.role;
            }
            return session;
        }
    },
    pages: {
        signIn: "/auth/signin",
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
};
