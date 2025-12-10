"use client";

import { useState, useRef } from "react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Check, Camera, Upload } from "lucide-react";

export default function UploadFile({
  onUploadComplete,
}: {
  onUploadComplete: (fotoId: number) => void;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Validação adicional de tamanho
      if (file.size > 5 * 1024 * 1024) {
        toast({ 
          title: "Arquivo muito grande", 
          description: "O tamanho máximo é 5MB.",
          variant: "destructive" 
        });
        return;
      }

      const formData = new FormData();
      formData.append("file", file);

      setIsUploading(true);
      setUploadProgress(0);

      try {
        const response = await fetch("/api/file", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Erro ao enviar o arquivo.");
        }

        const data = await response.json();
        toast({ title: "Foto enviada com sucesso!", variant: "success" });

        setUploadedFileName(file.name);
        setUploadProgress(100);
        
        // Reset do input após sucesso
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        if (cameraInputRef.current) {
          cameraInputRef.current.value = "";
        }

        onUploadComplete(data.foto.id); // Passa o ID da foto para o componente pai
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Erro ao enviar a foto.";
        toast({ 
          title: "Erro no upload", 
          description: errorMessage,
          variant: "destructive" 
        });
        console.error(error);
        setUploadedFileName(null);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleRemoveFile = () => {
    setUploadedFileName(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (cameraInputRef.current) {
      cameraInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Foto do item (opcional)</label>
        
        {/* Inputs escondidos */}
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
          disabled={isUploading}
        />
        <input
          ref={cameraInputRef}
          type="file"
          onChange={handleFileChange}
          accept="image/*"
          capture="environment"
          className="hidden"
          disabled={isUploading}
        />

        {/* Botões visíveis */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => cameraInputRef.current?.click()}
            disabled={isUploading || !!uploadedFileName}
            className="w-full"
          >
            <Camera className="w-4 h-4 mr-2" />
            Tirar Foto
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || !!uploadedFileName}
            className="w-full"
          >
            <Upload className="w-4 h-4 mr-2" />
            Galeria
          </Button>
        </div>
      </div>

      {isUploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Enviando foto...</span>
            <span className="text-sm font-medium">{Math.round(uploadProgress)}%</span>
          </div>
          <Progress value={uploadProgress} className="w-full" />
        </div>
      )}

      {uploadedFileName && !isUploading && (
        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-700">Foto adicionada</span>
          </div>
          <button
            type="button"
            onClick={handleRemoveFile}
            className="text-xs text-green-600 hover:text-green-700 underline"
          >
            Remover
          </button>
        </div>
      )}
    </div>
  );
}
