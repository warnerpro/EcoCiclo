import prisma from "@/lib/db/db"; // Certifique-se de que isso está configurado corretamente

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const pontoId = searchParams.get("pontoId");

    const categorias = await prisma.categoria.findMany({
      where: pontoId
        ? {
            itens: {
              none: { pontoColetaId: parseInt(pontoId), coletado: false },
            },
          }
        : undefined,
    });

    return Response.json(categorias);
  } catch (error) {
    console.error("Erro ao buscar categorias:", error);
    return Response.json(
      { error: "Erro ao buscar categorias." },
      { status: 500 }
    );
  }
}
