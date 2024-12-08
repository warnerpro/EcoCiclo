import prisma from "@/lib/db/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";

async function getAuthenticatedUser() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    throw new Error("Usuário não autenticado.");
  }
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, userType: true },
  });
  if (!user) {
    throw new Error("Usuário não encontrado.");
  }
  return user;
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    if (user.userType !== "CATADOR") {
      return new Response(
        JSON.stringify({ error: "Apenas catadores podem alterar itens." }),
        { status: 403 }
      );
    }

    const { itemId, coletado } = await req.json();
    if (!itemId || typeof coletado !== "boolean") {
      return new Response(
        JSON.stringify({ error: "Item ID ou status inválido." }),
        { status: 400 }
      );
    }

    const item = await prisma.pontoColetaItem.update({
      where: { id: itemId },
      data: {
        coletado,
        coleta: {
          update: {
            status: "EM_ANDAMENTO",
          },
        },
      },
    });

    return new Response(JSON.stringify(item), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Erro ao atualizar item:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    if (user.userType !== "CATADOR") {
      return new Response(
        JSON.stringify({ error: "Apenas catadores podem remover itens." }),
        { status: 403 }
      );
    }

    const { itemId } = await req.json();
    if (!itemId) {
      return new Response(
        JSON.stringify({ error: "ID do item é obrigatório." }),
        { status: 400 }
      );
    }

    await prisma.pontoColetaItem.delete({
      where: { id: itemId },
    });

    return new Response(null, { status: 204 });
  } catch (error: any) {
    console.error("Erro ao remover item:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
