import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) {
          throw new Error("Credenciais não declaradas");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (user && bcrypt.compareSync(credentials.password, user.password)) {
          const { password, ...userData } = user;

          return userData;
        }
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/",
    error: "/",
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.name = user.name!;
        token.email = user.email!;
        token.userType = user.userType!;
      }
      return token;
    },
    session: ({ session, token }) => {
      session.user = {
        id: token.id as string,
        name: token.name as string,
        username: token.username as string,
        email: token.email,
        userType: token.userType,
      };

      return session;
    },
    async redirect({ baseUrl }) {
      return `${baseUrl}/home`;
    },
  },
};
