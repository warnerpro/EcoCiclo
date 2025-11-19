import { NextResponse } from "next/server";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import prisma from "@/lib/db/db";

export const POST = async (req, res) => {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        { error: "Nenhum arquivo foi enviado." },
        { status: 400 }
      );
    }

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "O arquivo fornecido é inválido." },
        { status: 400 }
      );
    }

    // Validação de tipo de arquivo
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Por favor, envie apenas arquivos de imagem." },
        { status: 400 }
      );
    }

    // Validação de tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "O arquivo não pode ser maior que 5MB." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${Date.now()}-${file.name.replaceAll(" ", "_")}`;

    // Log detalhado de variáveis de ambiente
    console.log("🔍 Verificando variáveis de ambiente AWS:");
    console.log(`  AWS_BUCKET_NAME: ${process.env.AWS_BUCKET_NAME ? "✅ Configurada" : "❌ Faltando"}`);
    console.log(`  AWS_REGION: ${process.env.AWS_REGION ? "✅ Configurada" : "❌ Faltando"}`);
    console.log(`  AWS_ACCESS_KEY_ID: ${process.env.AWS_ACCESS_KEY_ID ? "✅ Configurada" : "❌ Faltando"}`);
    console.log(`  AWS_SECRET_ACCESS_KEY: ${process.env.AWS_SECRET_ACCESS_KEY ? "✅ Configurada" : "❌ Faltando"}`);

    // Verificação de variáveis de ambiente
    const missingEnvVars = [];
    if (!process.env.AWS_BUCKET_NAME) missingEnvVars.push("AWS_BUCKET_NAME");
    if (!process.env.AWS_REGION) missingEnvVars.push("AWS_REGION");
    if (!process.env.AWS_ACCESS_KEY_ID) missingEnvVars.push("AWS_ACCESS_KEY_ID");
    if (!process.env.AWS_SECRET_ACCESS_KEY) missingEnvVars.push("AWS_SECRET_ACCESS_KEY");

    if (missingEnvVars.length > 0) {
      const errorMessage = `Variáveis de ambiente AWS não configuradas: ${missingEnvVars.join(", ")}`;
      console.error(`❌ ${errorMessage}`);
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }

    console.log("✅ Todas as variáveis de ambiente estão configuradas");

    const s3 = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
      },
    });

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME as string,
      Key: filename,
      Body: buffer,
      ContentType: file.type,
    });

    await s3.send(command);

    const foto = await prisma.foto.create({
      data: {
        key: filename,
      },
    });

    console.log(`✅ Foto enviada com sucesso: ${filename}`);

    return NextResponse.json(
      { message: "Foto enviada com sucesso!", foto },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Erro ao fazer upload da foto:", error);
    return NextResponse.json(
      { error: "Falha ao enviar a foto. Tente novamente." },
      { status: 500 }
    );
  }
};
