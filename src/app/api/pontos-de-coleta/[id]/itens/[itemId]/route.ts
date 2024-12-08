import prisma from "@/lib/db/db"; // Certifique-se de que o Prisma está configurado corretamente

export async function DELETE(
  req: Request,
  { params }: { params: { id: string; itemId: string } }
) {
  const pontoId = parseInt(params.id);
  const itemId = parseInt(params.itemId);

  if (isNaN(pontoId) || isNaN(itemId)) {
    return Response.json(
      { error: "IDs inválidos para ponto de coleta ou item." },
      { status: 400 }
    );
  }

  try {
    // Verifica se o item pertence ao ponto de coleta
    const item = await prisma.pontoColetaItem.findFirst({
      where: {
        id: itemId,
        pontoColetaId: pontoId,
      },
    });

    if (!item) {
      return Response.json(
        { error: "Item não encontrado no ponto de coleta." },
        { status: 404 }
      );
    }

    // Remove o item
    await prisma.pontoColetaItem.delete({
      where: {
        id: itemId,
      },
    });

    return Response.json({ message: "Item removido com sucesso." });
  } catch (error) {
    console.error("Erro ao remover item:", error);
    return Response.json({ error: "Erro ao remover item." }, { status: 500 });
  }
}
