"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { PontoColeta } from "@prisma/client";

export default function CatadorColetas() {
  const [pontosDeColeta, setPontosDeColeta] = useState<PontoColeta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPonto, setSelectedPonto] = useState<PontoColeta | null>(null);
  const [itens, setItens] = useState<any[]>([]);
  const [isFetchingItens, setIsFetchingItens] = useState(false);

  // Função para buscar todos os pontos de coleta disponíveis
  const fetchPontosDeColeta = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/catador/pontos-de-coleta");
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

  // Função para buscar itens de um ponto de coleta
  const fetchItensDoPonto = async (pontoId: number) => {
    setIsFetchingItens(true);
    try {
      const response = await fetch(`/api/catador/pontos-de-coleta/${pontoId}`);
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

  // Busca inicial dos pontos de coleta
  useEffect(() => {
    fetchPontosDeColeta();
  }, []);

  return (
    <div className="flex flex-col p-4 space-y-6">
      <h1 className="font-bold text-center">EcoCiclo</h1>

      <div className="w-full flex flex-col justify-start space-y-2">
        <h2 className="font-bold">Pontos de Coleta Disponíveis</h2>

        {isLoading ? (
          <p className="text-gray-500 text-center">Carregando...</p>
        ) : pontosDeColeta.length > 0 ? (
          pontosDeColeta.map((ponto) => (
            <div
              key={ponto.id}
              className="p-4 border rounded-md shadow-lg flex justify-between items-center hover:bg-gray-400 hover:cursor-pointer"
              onClick={() => {
                setSelectedPonto(ponto);
                fetchItensDoPonto(ponto.id);
              }}
            >
              <h2 className="font-bold">{ponto.name}</h2>
            </div>
          ))
        ) : (
          <p className="text-gray-500">Nenhum ponto de coleta disponível.</p>
        )}
      </div>
    </div>
  );
}
