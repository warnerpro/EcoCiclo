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

  const Bucket = process.env.AWS_BUCKET_NAME as string;

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
