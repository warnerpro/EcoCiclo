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

const formSchema = z.object({
  categoriaId: z
    .number()
    .min(1, { message: "Selecione uma categoria válida." }),
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
    },
  });

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false); // Controla abertura do dialog

  // Buscar categorias da API
  const fetchCategorias = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/categorias?pontoId=${pontoId}`);
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Erro ao adicionar item.");
      }

      // Exibe toast de parabenização
      toast({
        title: "Parabéns!",
        description:
          "Você adicionou um novo item ao ponto de coleta e ganhou +10 pontos por isso!",
        variant: "success",
      });

      form.reset();

      onItemAdded(); // Atualiza a lista de itens
      setIsDialogOpen(false); // Fecha o dialog
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

  const { watch } = form;

  const categoriaId = watch("categoriaId");

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
                      categoriaId === categoria.id
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
            <p className="text-red-500 text-sm mt-2">
              {form.formState.errors.categoriaId?.message}
            </p>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading || !categoriaId}>
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
