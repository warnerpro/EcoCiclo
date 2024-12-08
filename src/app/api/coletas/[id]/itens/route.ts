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

export async function PUT(req: Request) {
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

export async function DELETE(req: Request) {
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

    const item = await prisma.pontoColetaItem.findUnique({
      where: { id: itemId },
      include: {
        coleta: {
          include: { itens: true },
        },
      },
    });

    if (!item) {
      return new Response(JSON.stringify({ error: "Item não encontrado." }), {
        status: 404,
      });
    }

    if (!item.coleta) {
      return new Response(
        JSON.stringify({ error: "Item não está associado a uma coleta." }),
        { status: 400 }
      );
    }

    if (item.coleta.catadorId !== user.id) {
      return new Response(
        JSON.stringify({ error: "Item não pertence ao catador." }),
        { status: 403 }
      );
    }

    if (item.coleta.status === "CONCLUIDA") {
      return new Response(JSON.stringify({ error: "Coleta já concluída." }), {
        status: 400,
      });
    }

    if (item.coleta.itens && item.coleta.itens.length === 1) {
      // Se for o último item da coleta, cancela a coleta
      await prisma.coleta.delete({
        where: { id: item.coleta.id },
      });
    } else {
      await prisma.pontoColetaItem.update({
        where: { id: itemId },
        data: {
          coletado: false,
          coletaId: null,
        },
      });
    }

    return new Response(null, { status: 204 });
  } catch (error: any) {
    console.error("Erro ao remover item:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
