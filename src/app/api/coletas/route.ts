import prisma from "@/lib/db/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";

// Função para autenticar e obter o usuário
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

// GET - Listar Coletas em Andamento
export async function GET() {
  try {
    const user = await getAuthenticatedUser();

    if (user.userType === "CATADOR") {
      const coletas = await prisma.coleta.findMany({
        where: {
          catadorId: user.id,
          status: { not: "CONCLUIDA" },
        },
        include: {
          itens: {
            include: {
              categoria: true,
            },
          },
        },
      });

      return new Response(JSON.stringify(coletas), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      return new Response(
        JSON.stringify({ error: "Apenas catadores podem listar coletas." }),
        { status: 403 }
      );
    }
  } catch (error: any) {
    console.error("Erro ao buscar coletas:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// POST - Criar Nova Coleta
export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser();

    if (user.userType !== "CATADOR") {
      return new Response(
        JSON.stringify({ error: "Apenas catadores podem criar coletas." }),
        { status: 403 }
      );
    }

    const { itens } = await req.json();

    if (!itens || !Array.isArray(itens) || itens.length === 0) {
      return new Response(
        JSON.stringify({ error: "Itens inválidos para a coleta." }),
        { status: 400 }
      );
    }

    const coleta = await prisma.coleta.create({
      data: {
        catadorId: user.id,
        status: "EM_ANDAMENTO",
        name: `Coleta de ${itens.length} itens`,
        score: itens.map(() => 10).reduce((a, b) => a + b, 0), // Calcula o score total
        itens: {
          connect: itens.map((itemId: number) => ({ id: itemId })),
        },
      },
    });

    return new Response(JSON.stringify(coleta), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Erro ao criar coleta:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// PUT - Atualizar Status da Coleta
export async function PUT(req: Request) {
  try {
    const user = await getAuthenticatedUser();

    if (user.userType !== "CATADOR") {
      return new Response(
        JSON.stringify({ error: "Apenas catadores podem atualizar coletas." }),
        { status: 403 }
      );
    }

    const { id, status } = await req.json();

    if (!id || !status || !["EM_ANDAMENTO", "CONCLUIDA"].includes(status)) {
      return new Response(
        JSON.stringify({
          error: "ID ou status inválido. Use 'EM_ANDAMENTO' ou 'CONCLUIDA'.",
        }),
        { status: 400 }
      );
    }

    const coletaAtualizada = await prisma.coleta.update({
      where: { id },
      data: { status },
    });

    // Atualiza os itens da coleta para "coletados" apenas quando o status é "CONCLUIDA"
    if (status === "CONCLUIDA") {
      await prisma.pontoColetaItem.updateMany({
        where: { coletaId: id },
        data: { coletado: true },
      });

      await prisma.user.update({
        where: { id: user.id },
        data: { score: { increment: coletaAtualizada.score } },
      });
    }

    return new Response(JSON.stringify(coletaAtualizada), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Erro ao atualizar coleta:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// DELETE - Cancelar Coleta
export async function DELETE(req: Request) {
  try {
    const user = await getAuthenticatedUser();

    if (user.userType !== "CATADOR") {
      return new Response(
        JSON.stringify({ error: "Apenas catadores podem cancelar coletas." }),
        { status: 403 }
      );
    }

    const { id } = await req.json();

    if (!id) {
      return new Response(
        JSON.stringify({ error: "ID da coleta é obrigatório." }),
        { status: 400 }
      );
    }

    // Verifica se a coleta pertence ao catador
    const coleta = await prisma.coleta.findUnique({
      where: { id },
      select: { catadorId: true, status: true },
    });

    if (!coleta || coleta.catadorId !== user.id) {
      return new Response(
        JSON.stringify({ error: "Coleta não encontrada ou não autorizada." }),
        { status: 404 }
      );
    }

    if (coleta.status === "CONCLUIDA") {
      return new Response(
        JSON.stringify({
          error: "Não é possível cancelar uma coleta concluída.",
        }),
        { status: 400 }
      );
    }

    // Desconecta os itens da coleta
    await prisma.pontoColetaItem.updateMany({
      where: { coletaId: id },
      data: { coletaId: null },
    });

    // Exclui a coleta
    await prisma.coleta.delete({
      where: { id },
    });

    return new Response(
      JSON.stringify({ message: "Coleta cancelada com sucesso." }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Erro ao cancelar coleta:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// PATCH - Atualizar Itens da Coleta
export async function PATCH(req: Request) {
  try {
    const user = await getAuthenticatedUser();

    if (user.userType !== "CATADOR") {
      return new Response(
        JSON.stringify({ error: "Apenas catadores podem atualizar coletas." }),
        { status: 403 }
      );
    }

    const { id, itensRemovidos } = await req.json();

    if (!id || !Array.isArray(itensRemovidos)) {
      return new Response(
        JSON.stringify({
          error: "ID da coleta e itens para remoção são obrigatórios.",
        }),
        { status: 400 }
      );
    }

    // Verifica se a coleta pertence ao catador
    const coleta = await prisma.coleta.findUnique({
      where: { id },
      select: { catadorId: true, status: true },
    });

    if (!coleta || coleta.catadorId !== user.id) {
      return new Response(
        JSON.stringify({ error: "Coleta não encontrada ou não autorizada." }),
        { status: 404 }
      );
    }

    if (coleta.status === "CONCLUIDA") {
      return new Response(
        JSON.stringify({
          error: "Não é possível atualizar uma coleta concluída.",
        }),
        { status: 400 }
      );
    }

    // Remove os itens especificados da coleta
    await prisma.pontoColetaItem.updateMany({
      where: { id: { in: itensRemovidos }, coletaId: id },
      data: { coletaId: null },
    });

    return new Response(
      JSON.stringify({ message: "Itens removidos com sucesso da coleta." }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Erro ao atualizar itens da coleta:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
