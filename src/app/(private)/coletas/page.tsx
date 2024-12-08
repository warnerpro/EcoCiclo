"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import CreatePontoColetaForm from "@/components/routes/coletas/create-ponto-coleta-form";
import { toast } from "@/hooks/use-toast";
import { PontoColeta } from "@prisma/client";
import { ChevronRight } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import DrawerPontoColeta from "@/components/routes/coletas/drawer-ponto-coleta";

export default function Coletas() {
  const [pontosDeColeta, setPontosDeColeta] = useState<PontoColeta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [itens, setItens] = useState<any[]>([]);
  const [isFetchingItens, setIsFetchingItens] = useState(false);

  // Função para buscar os pontos de coleta do usuário
  const fetchPontosDeColeta = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/pontos-de-coleta");
      if (!response.ok) {
        throw new Error("Erro ao buscar pontos de coleta.");
      }
      const data = await response.json();
      setPontosDeColeta(data);
    } catch (error) {
      console.error("Erro ao buscar pontos de coleta:", error);
      toast({
        title: "Erro ao buscar pontos de coleta.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Função para buscar os itens de um ponto de coleta
  const fetchItensDoPonto = async (pontoId: number) => {
    setIsFetchingItens(true);
    try {
      const response = await fetch(`/api/pontos-de-coleta/${pontoId}/itens`);
      if (!response.ok) {
        throw new Error("Erro ao buscar itens.");
      }
      const data = await response.json();
      setItens(data);
    } catch (error) {
      console.error("Erro ao buscar itens:", error);
      toast({
        title: "Erro ao buscar itens do ponto.",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsFetchingItens(false);
    }
  };

  // Atualizar pontos de coleta após criação
  const refreshPontosDeColeta = () => {
    fetchPontosDeColeta();
  };

  // Busca inicial dos pontos de coleta
  useEffect(() => {
    fetchPontosDeColeta();
  }, []);

  return (
    <div className="flex flex-col p-4 space-y-6">
      <h1 className="font-bold text-center">EcoCiclo</h1>

      <div className="w-full flex flex-col justify-start space-y-2">
        <h2 className="font-bold">meus pontos de coleta</h2>

        {/* Lista de Pontos de Coleta */}
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="p-4 border border-gray-200 rounded-md animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded-md w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded-md w-3/4 mt-2"></div>
            </div>
          ))
        ) : pontosDeColeta.length > 0 ? (
          <div className="space-y-4">
            {pontosDeColeta.map((ponto) => (
              <Drawer key={ponto.id}>
                <DrawerTrigger asChild>
                  <div
                    onClick={() => {
                      fetchItensDoPonto(ponto.id);
                    }}
                    className="p-4 border border-gray-200 rounded-md shadow-lg flex justify-between items-center hover:bg-gray-400 hover:cursor-pointer"
                  >
                    <h2 className="font-bold text-start">{ponto.name}</h2>
                    <ChevronRight className="absolute right-6" />
                  </div>
                </DrawerTrigger>
                <DrawerContent>
                  <DrawerHeader>
                    <DrawerTitle asChild>
                      <h2 className="text-lg font-bold">{ponto.name}</h2>
                    </DrawerTitle>
                  </DrawerHeader>
                  <DrawerPontoColeta
                    pontoId={ponto.id}
                    itens={itens}
                    onItemAdded={() => fetchItensDoPonto(ponto.id)}
                    onItemRemoved={() => fetchItensDoPonto(ponto.id)}
                    isLoadingItens={isFetchingItens}
                  />
                </DrawerContent>
              </Drawer>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Nenhum ponto de coleta encontrado.</p>
        )}
      </div>
      {/* Dialog para Criar Novo Ponto */}
      {!isLoading && (
        <Dialog>
          <DialogTrigger asChild>
            <Button className="mt-4 w-full">Criar Novo Ponto</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Ponto de Coleta</DialogTitle>
            </DialogHeader>
            <CreatePontoColetaForm onSuccess={refreshPontosDeColeta} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
