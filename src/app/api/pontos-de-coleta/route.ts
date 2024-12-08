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

// GET - Consultar Pontos de Coleta
export async function GET(req: Request) {
  try {
    const user = await getAuthenticatedUser();

    if (user.userType === "USUARIO") {
      // Para usuários, listar os pontos criados por eles
      const pontosDeColeta = await prisma.pontoColeta.findMany({
        where: { authorId: user.id },
      });

      return new Response(JSON.stringify(pontosDeColeta), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else if (user.userType === "CATADOR") {
      // Para catadores, listar pontos com itens não coletados
      const { searchParams } = new URL(req.url);
      const categorias = searchParams.get("categorias");

      const categoriaIds = categorias ? categorias.split(";") : [];

      console.log(categoriaIds);

      const pontosDeColeta = await prisma.pontoColeta.findMany({
        where: {
          itens: {
            some: {
              coletado: false,
              coletaId: null,
              categoriaId:
                categoriaIds.length > 0
                  ? { in: categoriaIds.map((v) => parseInt(v)) }
                  : undefined,
            },
          },
        },
        include: {
          itens: {
            where: { coletado: false, coletaId: null },
            include: {
              categoria: true,
            },
          },
        },
      });

      return new Response(JSON.stringify(pontosDeColeta), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      return new Response(
        JSON.stringify({ error: "Tipo de usuário inválido." }),
        { status: 403 }
      );
    }
  } catch (error: any) {
    console.error("Erro ao buscar pontos de coleta:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// POST - Criar Novo Ponto de Coleta
export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    const { name, latitude, longitude } = await req.json();

    if (!name || latitude === undefined || longitude === undefined) {
      return new Response(
        JSON.stringify({
          error: "Nome, latitude e longitude são obrigatórios.",
        }),
        { status: 400 }
      );
    }

    const novoPonto = await prisma.pontoColeta.create({
      data: {
        name,
        latitude,
        longitude,
        authorId: user.id,
      },
    });

    // Incrementar score do usuário
    await prisma.user.update({
      where: { id: user.id },
      data: { score: { increment: 25 } },
    });

    return new Response(JSON.stringify(novoPonto), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Erro ao criar ponto de coleta:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
}
