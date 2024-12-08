"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import DrawerPontoColeta from "@/components/routes/coletas/usuario/drawer-ponto-coleta";
import { PontoColeta } from "@prisma/client";
import { ChevronRight } from "lucide-react";

export default function Coletas() {
  const [pontosDeColeta, setPontosDeColeta] = useState<PontoColeta[]>([]);
  const [selectedPonto, setSelectedPonto] = useState<PontoColeta | null>(null);
  const [itens, setItens] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingItens, setIsFetchingItens] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchPontosDeColeta = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/pontos-de-coleta");
      if (!response.ok) throw new Error("Erro ao buscar pontos de coleta.");
      const data = await response.json();
      setPontosDeColeta(data);
    } catch (error) {
      toast({
        title: "Erro ao buscar pontos de coleta.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchItensDoPonto = async (pontoId) => {
    setIsFetchingItens(true);
    try {
      const response = await fetch(`/api/pontos-de-coleta/${pontoId}/itens`);
      if (!response.ok) throw new Error("Erro ao buscar itens.");
      const data = await response.json();
      setItens(data);
    } catch (error) {
      toast({
        title: "Erro ao buscar itens.",
        variant: "destructive",
      });
    } finally {
      setIsFetchingItens(false);
    }
  };

  useEffect(() => {
    fetchPontosDeColeta();
  }, []);

  return (
    <div className="p-4 space-y-4">
      <h1 className="font-bold text-center">EcoCiclo</h1>

      <h1 className="text-lg font-bold">meus pontos de coleta</h1>
      {isLoading ? (
        <p>Carregando...</p>
      ) : (
        pontosDeColeta.map((ponto) => (
          <div
            key={ponto.id}
            className="p-4 border rounded-md shadow-md flex justify-between items-center hover:bg-gray-100 cursor-pointer"
            onClick={() => {
              setSelectedPonto(ponto);
              fetchItensDoPonto(ponto.id);
              setDrawerOpen(true);
            }}
          >
            <h2>{ponto.name}</h2>
            <ChevronRight className="absolute right-6" />
          </div>
        ))
      )}
      {selectedPonto && (
        <DrawerPontoColeta
          pontoId={selectedPonto.id}
          pontoName={selectedPonto.name}
          itens={itens}
          onItemAdded={() => fetchItensDoPonto(selectedPonto.id)}
          onItemRemoved={() => fetchItensDoPonto(selectedPonto.id)}
          isLoadingItens={isFetchingItens}
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        />
      )}
    </div>
  );
}
