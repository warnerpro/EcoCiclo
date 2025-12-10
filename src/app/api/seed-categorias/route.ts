import { NextResponse } from "next/server";
import prisma from "@/lib/db/db";

async function seedCategorias() {
  try {
    console.log("🌱 Iniciando seed de categorias via API...");

    // Verificar se já existem categorias
    const existentes = await prisma.categoria.count();
    
    if (existentes > 0) {
      return {
        success: true,
        alreadyExists: true,
        message: `⚠️ Já existem ${existentes} categorias cadastradas. Seed cancelado.`,
        count: existentes
      };
    }

    const categorias = [
      { name: "Orgânico", iconKey: "Leaf" },
      { name: "Plástico", iconKey: "Package" },
      { name: "Metal", iconKey: "Tools" },
      { name: "Papel e Papelão", iconKey: "FileText" },
      { name: "Vidro", iconKey: "GlassWater" },
      { name: "Eletrônicos (E-lixo)", iconKey: "Monitor" },
      { name: "Madeira", iconKey: "TreePine" },
      { name: "Tecido", iconKey: "ShirtIcon" },
      { name: "Óleo de Cozinha", iconKey: "Droplet" },
      { name: "Pilhas e Baterias", iconKey: "Battery" },
    ];

    // Criar categorias
    const result = await prisma.categoria.createMany({
      data: categorias,
      skipDuplicates: true,
    });

    console.log(`✅ ${result.count} categorias criadas!`);

    // Buscar todas para retornar
    const todasCategorias = await prisma.categoria.findMany({
      orderBy: { name: 'asc' }
    });

    return {
      success: true,
      message: `✅ ${result.count} categorias criadas com sucesso!`,
      count: result.count,
      categorias: todasCategorias
    };

  } catch (error) {
    console.error("❌ Erro ao criar categorias:", error);
    return {
      success: false,
      error: "Erro ao criar categorias",
      details: String(error)
    };
  }
}

export async function GET() {
  const result = await seedCategorias();
  return NextResponse.json(result, { status: result.success ? 200 : 500 });
}

export async function POST() {
  const result = await seedCategorias();
  return NextResponse.json(result, { status: result.success ? 200 : 500 });
}
