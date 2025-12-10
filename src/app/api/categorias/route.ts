import prisma from "@/lib/db/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const pontoId = searchParams.get("pontoId");

    console.log("📍 API Categorias - pontoId recebido:", pontoId);

    // Buscar TODAS as categorias, permitindo múltiplos itens da mesma categoria
    const categorias = await prisma.categoria.findMany({
      orderBy: {
        name: 'asc'
      }
    });

    console.log("✅ Categorias encontradas:", categorias.length);

    return Response.json(categorias);
  } catch (error) {
    console.error("❌ Erro ao buscar categorias:", error);
    return Response.json(
      { error: "Erro ao buscar categorias." },
      { status: 500 }
    );
  }
}
