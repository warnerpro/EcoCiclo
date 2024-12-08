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

// GET - Consultar Pontos de Coleta do Usuário
export async function GET() {
  try {
    const user = await getAuthenticatedUser();

    if (user.userType === "USUARIO") {
      const pontosDeColeta = await prisma.pontoColeta.findMany({
        where: { authorId: user.id },
      });

      return Response.json(pontosDeColeta);
    } else if (user.userType === "CATADOR") {
      const pontosDeColeta = await prisma.pontoColeta.findMany({
        where: {
          itens: { some: { coletado: false } },
        },
        include: {
          itens: {
            where: { coletado: false },
            include: {
              categoria: true,
            },
          },
        },
      });

      return Response.json(pontosDeColeta);
    }
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 401 });
  }
}

// POST - Criar Novo Ponto de Coleta
export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    const { name, latitude, longitude } = await req.json();

    if (!name || latitude === undefined || longitude === undefined) {
      return Response.json(
        { error: "Nome, latitude e longitude são obrigatórios." },
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

    await prisma.user.update({
      where: { id: user.id },
      data: { score: { increment: 25 } },
    });

    return Response.json(novoPonto, { status: 201 });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 401 });
  }
}
