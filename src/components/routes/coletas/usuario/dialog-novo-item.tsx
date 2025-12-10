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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Watch para debug
  const selectedCategoryId = form.watch("categoriaId");
  const canSubmit = selectedCategoryId > 0 && !isSubmitting;

  const fetchCategorias = async () => {
    setIsLoading(true);
    try {
      console.log("🔍 Buscando categorias para pontoId:", pontoId);
      const response = await fetch(`/api/categorias?pontoId=${pontoId}`, {
        cache: "no-cache",
      });
      if (!response.ok) {
        throw new Error("Erro ao buscar categorias.");
      }
      const data = await response.json();
      console.log("📦 Categorias recebidas:", data);
      setCategorias(data);
      
      if (data.length === 0) {
        toast({
          title: "Nenhuma categoria disponível",
          description: "Todas as categorias já possuem itens neste ponto de coleta.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("❌ Erro ao buscar categorias:", error);
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
    if (isDialogOpen && pontoId) {
      fetchCategorias();
    }
  }, [pontoId, isDialogOpen]);

  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
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
      fetchCategorias();
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: "Erro ao adicionar item.",
        description: "Verifique os dados inseridos e tente novamente.",
        variant: "destructive",
      });
      console.error("Erro ao adicionar item:", error);
    } finally {
      setIsSubmitting(false);
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
            ) : categorias.length === 0 ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600 font-semibold">❌ Nenhuma categoria encontrada</p>
                <p className="text-xs text-red-500 mt-1">
                  É necessário cadastrar categorias no sistema antes de adicionar itens.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-medium">Selecione a categoria do item:</label>
                <div className="grid grid-cols-3 gap-4">
                  {categorias.map((categoria) => (
                    <button
                      type="button"
                      key={categoria.id}
                      onClick={() => {
                        form.setValue("categoriaId", categoria.id, { 
                          shouldValidate: true,
                          shouldDirty: true,
                          shouldTouch: true 
                        });
                        console.log("Categoria selecionada:", categoria.id, categoria.name);
                      }}
                      className={`p-4 border-2 rounded-md flex flex-col items-center space-y-2 transition-all ${
                        selectedCategoryId === categoria.id
                          ? "border-blue-500 bg-blue-50 shadow-md"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <Icon name={categoria.iconKey} size={32} />
                      <span className="text-sm font-medium text-gray-700">
                        {shortNames(categoria.name)}
                      </span>
                      {selectedCategoryId === categoria.id && (
                        <span className="text-xs text-blue-600 font-semibold">✓ Selecionado</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <UploadFile
            onUploadComplete={(fotoId) => {
              form.setValue("fotoId", fotoId);
              toast({
                title: "Foto adicionada",
                description: "Clique em Salvar para confirmar o item.",
                variant: "success",
              });
            }}
          />

          {/* Indicador visual de seleção */}
          {selectedCategoryId === 0 && (
            <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md border border-amber-200">
              ⚠️ Por favor, selecione uma categoria acima para habilitar o botão Salvar
            </div>
          )}

          <DialogFooter>
            <Button
              type="submit"
              disabled={!canSubmit}
            >
              {isSubmitting ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
