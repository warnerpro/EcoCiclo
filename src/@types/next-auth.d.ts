import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    id: string; // Ajuste para string
    name: string;
    email: string;
    cpf: string;
    birthDate: Date;
    address: string;
    userType: string;
    score: number;
    createdAt: Date;
    updatedAt: Date;
  }

  interface Session {
    user: User;
  }
}
