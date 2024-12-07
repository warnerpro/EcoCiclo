import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { name, cpf, birthDate, email, password, userType } = body;

    // Validação básica
    if (!name || !cpf || !birthDate || !email || !password || !userType) {
      return Response.json(
        { error: "Todos os campos são obrigatórios." },
        { status: 400 }
      );
    }

    // Verifica se o CPF já existe
    const existingUserByCpf = await prisma.user.findUnique({
      where: { cpf },
    });
    if (existingUserByCpf) {
      return Response.json(
        { error: "Este CPF já está cadastrado." },
        { status: 400 }
      );
    }

    // Verifica se o email já existe
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUserByEmail) {
      return Response.json(
        { error: "Este email já está cadastrado." },
        { status: 400 }
      );
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Cria o novo usuário no banco
    const newUser = await prisma.user.create({
      data: {
        name,
        cpf,
        birthDate: new Date(birthDate),
        email,
        password: hashedPassword,
        userType,
      },
    });

    return Response.json(
      { message: "Usuário criado com sucesso!", user: { id: newUser.id } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao registrar usuário:", error);
    return Response.json(
      { error: "Erro interno no servidor." },
      { status: 500 }
    );
  }
}
