import prisma from "@/lib/db/db";
import { getFileName } from "@/lib/file-name";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getServerSession } from "next-auth";

export async function GET(
  request: Request,
  { params: { id } }: { params: { id: string } }
) {
  try {
    console.log("📥 GET /api/file/[id] - ID:", id);

    const session = await getServerSession();

    if (!session) {
      console.log("❌ Não autenticado");
      return new Response(null, { status: 401 });
    }

    const Bucket = process.env.AWS_BUCKET_NAME as string;
    console.log("🪣 Bucket:", Bucket);
    console.log("🌍 Region:", process.env.AWS_REGION);

    if (!Bucket || !process.env.AWS_REGION || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      console.error("❌ Variáveis de ambiente AWS não configuradas");
      return new Response(JSON.stringify({ error: "Configuração AWS incompleta" }), { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    const s3 = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
      },
    });

    const attachment = await prisma.foto.findUnique({
      where: { id: parseInt(id) },
    });

    if (!attachment) {
      console.log("❌ Foto não encontrada no banco:", id);
      return new Response(null, { status: 404 });
    }

    console.log("📸 Foto encontrada:", attachment.key);

    const { Body } = await s3.send(
      new GetObjectCommand({
        Bucket,
        Key: attachment.key,
      })
    );

    if (!Body) {
      console.log("❌ Arquivo não encontrado no S3");
      return new Response(null, { status: 404 });
    }

    console.log("✅ Arquivo encontrado no S3");

    const byteArray = Body.transformToWebStream();

    return new Response(byteArray, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=31536000",
      },
    });
  } catch (error: any) {
    console.error("❌ Erro ao buscar arquivo:", error);
    return new Response(JSON.stringify({ error: error.message || "Erro desconhecido" }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
