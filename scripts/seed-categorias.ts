import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedCategorias() {
  console.log("🌱 Iniciando seed de categorias...");

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

  try {
    // Verificar se já existem categorias
    const existentes = await prisma.categoria.count();
    
    if (existentes > 0) {
      console.log(`⚠️  Já existem ${existentes} categorias cadastradas.`);
      console.log("🔄 Pulando seed...");
      return;
    }

    // Criar categorias
    const result = await prisma.categoria.createMany({
      data: categorias,
      skipDuplicates: true,
    });

    console.log(`✅ ${result.count} categorias criadas com sucesso!`);
    
    // Listar categorias criadas
    const todasCategorias = await prisma.categoria.findMany();
    console.log("\n📋 Categorias cadastradas:");
    todasCategorias.forEach((cat) => {
      console.log(`   - ${cat.name} (${cat.iconKey})`);
    });
    
  } catch (error) {
    console.error("❌ Erro ao criar categorias:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedCategorias()
  .then(() => {
    console.log("\n✅ Seed concluído!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Erro no seed:", error);
    process.exit(1);
  });
