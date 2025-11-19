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

    // Verificação de variáveis de ambiente
    if (!process.env.AWS_BUCKET_NAME || !process.env.AWS_REGION) {
      console.error("Variáveis de ambiente AWS não configuradas");
      return NextResponse.json(
        { error: "Configuração do servidor incompleta." },
        { status: 500 }
      );
    }

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

    return NextResponse.json(
      { message: "Foto enviada com sucesso!", foto },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao fazer upload da foto:", error);
    return NextResponse.json(
      { error: "Falha ao enviar a foto. Tente novamente." },
      { status: 500 }
    );
  }
};
