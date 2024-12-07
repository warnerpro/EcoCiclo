import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.categoria.createMany({
    data: [
      {
        name: "Orgânico",
        iconKey: "Leaf",
      },
      {
        name: "Plástico",
        iconKey: "Package",
      },
      {
        name: "Metal",
        iconKey: "Tools",
      },
      {
        name: "Papel e Papelão",
        iconKey: "FileText",
      },
      {
        name: "Vidro",
        iconKey: "GlassWater",
      },
      {
        name: "Eletrônicos (E-lixo)",
        iconKey: "Monitor",
      },
      {
        name: "Têxtil",
        iconKey: "Shirt",
      },
      {
        name: "Entulho e Resíduos de Construção",
        iconKey: "Construction",
      },
      {
        name: "Móveis e Grandes Volumes",
        iconKey: "Armchair",
      },
      {
        name: "Óleo de Cozinha",
        iconKey: "Droplet",
      },
    ],
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
