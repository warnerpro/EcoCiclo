"use client";

import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

export default function UploadFile({
  onUploadComplete,
}: {
  onUploadComplete: (fotoId: number) => void;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append("file", file);

      setIsUploading(true);
      setUploadProgress(0);

      try {
        const response = await fetch("/api/file", {
          method: "POST",
          body: formData,
          headers: {
            "X-Progress-Tracking": "true", // Adicionado para ilustrar o tracking
          },
        });

        if (!response.ok) {
          throw new Error("Erro ao enviar o arquivo.");
        }

        const data = await response.json();
        toast({ title: "Upload realizado com sucesso!", variant: "success" });

        onUploadComplete(data.foto.id); // Passa o ID da foto para o componente pai
      } catch (error) {
        toast({ title: "Erro ao enviar o arquivo.", variant: "destructive" });
        console.error(error);
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    }
  };

  return (
    <div className="space-y-4">
      <Input
        type="file"
        onChange={handleFileChange}
        disabled={isUploading}
        accept="image/*"
        placeholder="Enviar uma foto"
      />
      {isUploading && (
        <Progress value={uploadProgress} className="w-full" max={100} />
      )}
    </div>
  );
}
