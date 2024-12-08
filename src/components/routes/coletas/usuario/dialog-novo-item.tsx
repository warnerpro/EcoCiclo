"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { Icon } from "@/components/icon";
import UploadFile from "./upload-file";

const formSchema = z.object({
  categoriaId: z
    .number()
    .min(1, { message: "Selecione uma categoria válida." }),
  fotoId: z.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface Categoria {
  id: number;
  name: string;
  iconKey: string;
}

interface DialogNovoItemProps {
  pontoId: number;
  onItemAdded: () => void;
}

export default function DialogNovoItem({
  pontoId,
  onItemAdded,
}: DialogNovoItemProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      categoriaId: 0,
      fotoId: undefined,
    },
  });

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchCategorias = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/categorias?pontoId=${pontoId}`, {
        cache: "no-cache",
      });
      if (!response.ok) {
        throw new Error("Erro ao buscar categorias.");
      }
      const data = await response.json();
      setCategorias(data);
    } catch (error) {
      toast({
        title: "Erro ao buscar categorias.",
        description: "Verifique sua conexão ou tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  const onSubmit = async (values: FormValues) => {
    try {
      const response = await fetch(`/api/pontos-de-coleta/${pontoId}/itens`, {
        method: "POST",
        cache: "no-cache",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          categoriaId: values.categoriaId,
          fotoId: values.fotoId,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao adicionar item.");
      }

      toast({
        title: "Parabéns! +10 pontos",
        description:
          "Você adicionou um novo item ao ponto de coleta e ganhou +10 pontos por isso!",
        variant: "success",
      });

      form.reset();
      onItemAdded();
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: "Erro ao adicionar item.",
        description: "Verifique os dados inseridos e tente novamente.",
        variant: "destructive",
      });
      console.error("Erro ao adicionar item:", error);
    }
  };

  const shortNames = (name: string) =>
    name.length > 15 ? name.slice(0, 15) + "..." : name;

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button>Adicionar Item</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Novo Item</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            {isLoading ? (
              <p className="text-sm text-gray-400">Carregando categorias...</p>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {categorias.map((categoria) => (
                  <button
                    type="button"
                    key={categoria.id}
                    onClick={() => {
                      form.setValue("categoriaId", categoria.id);
                    }}
                    className={`p-4 border rounded-md flex flex-col items-center space-y-2 hover:bg-gray-100 ${
                      form.watch("categoriaId") === categoria.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200"
                    }`}
                  >
                    <Icon name={categoria.iconKey} size={32} />
                    <span className="text-sm font-medium text-gray-700">
                      {shortNames(categoria.name)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <UploadFile
            onUploadComplete={(fotoId) => {
              form.setValue("fotoId", fotoId);
            }}
          />
          <DialogFooter>
            <Button
              type="submit"
              disabled={isLoading || !form.watch("categoriaId")}
            >
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
