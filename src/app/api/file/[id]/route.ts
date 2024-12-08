import prisma from "@/lib/db/db";
import { getFileName } from "@/lib/file-name";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getServerSession } from "next-auth";

export async function GET(
  request: Request,
  { params: { id } }: { params: { id: string } }
) {
  const session = await getServerSession();

  if (!session) {
    return new Response(null, { status: 401 });
  }

  const Bucket = process.env.S3_BUCKET_NAME as string;

  const s3 = new S3Client({
    endpoint: process.env.S3_URL,
    region: process.env.S3_REGION,
    forcePathStyle: true,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID as string,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY as string,
    },
  });

  const attachment = await prisma.foto.findUnique({
    where: { id: parseInt(id) },
  });

  if (!attachment) {
    return new Response(null, { status: 404 });
  }

  const { Body } = await s3.send(
    new GetObjectCommand({
      Bucket,
      Key: attachment.key,
    })
  );

  if (!Body) {
    return new Response(null, { status: 404 });
  }

  const byteArray = Body.transformToWebStream();

  return new Response(byteArray, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${getFileName(
        attachment.key
      )}"`,
    },
  });
}
