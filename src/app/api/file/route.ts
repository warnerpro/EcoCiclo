import { NextResponse } from "next/server";
import path from "path";
import { writeFile } from "fs/promises";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import prisma from "@/lib/db/db";

export const POST = async (req, res) => {
  const formData = await req.formData();

  const file = formData.get("file");

  if (!file) {
    return NextResponse.json({ error: "No files received." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `${Date.now()}-${file.name.replaceAll(" ", "_")}`;

  try {
    const s3 = new S3Client({
      endpoint: process.env.S3_URL,
      region: process.env.S3_REGION,
      forcePathStyle: true,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY as string,
      },
    });

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME as string,
      Key: filename,
      Body: buffer,
    });

    await s3.send(command);

    const foto = await prisma.foto.create({
      data: {
        key: filename,
      },
    });

    return NextResponse.json({ Message: "Success", foto, status: 201 });
  } catch (error) {
    console.log("Error occured ", error);
    return NextResponse.json({ Message: "Failed", status: 500 });
  }
};
