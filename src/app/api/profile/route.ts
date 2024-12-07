import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(req: Request) {
  try {
    const { name, email, cpf } = await req.json();

    if (!name || !email || !cpf) {
      return NextResponse.json(
        { error: "Todos os campos são obrigatórios." },
        { status: 400 }
      );
    }

    // Atualiza o usuário pelo email
    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        name,
        cpf,
      },
    });

    return NextResponse.json({
      message: "Perfil atualizado com sucesso!",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Erro ao atualizar o perfil:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor." },
      { status: 500 }
    );
  }
}
