"use client";

import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { ChevronRight, ShoppingCart } from "lucide-react";
import CarrinhoDialog from "./carrinho-dialog";
import { Icon } from "@/components/icon";
import DrawerColetaEmAndamento from "./drawer-coleta-em-andamento";

export default function CatadorColetas() {
  const [categorias, setCategorias] = useState([]);
  const [selectedCategorias, setSelectedCategorias] = useState<string[]>([]);
  const [pontos, setPontos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [carrinho, setCarrinho] = useState<any[]>([]);
  const [coletasEmAndamento, setColetasEmAndamento] = useState([]);

  // Fetch inicial das categorias
  const fetchCategorias = async () => {
    try {
      const response = await fetch("/api/categorias");
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
    }
  };

  // Fetch dos pontos com itens disponíveis
  const fetchPontos = async () => {
    setIsLoading(true);
    try {
      const query = selectedCategorias.length
        ? `?categorias=${selectedCategorias.join(";")}`
        : "";
      const response = await fetch(`/api/pontos-de-coleta${query}`);
      if (!response.ok) {
        throw new Error("Erro ao buscar pontos de coleta.");
      }
      const data = await response.json();
      setPontos(data);
    } catch (error) {
      toast({
        title: "Erro ao buscar pontos de coleta.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch das coletas em andamento
  const fetchColetasEmAndamento = async () => {
    try {
      const response = await fetch("/api/coletas", { cache: "no-cache" });
      if (!response.ok) {
        throw new Error("Erro ao buscar coletas.");
      }
      const data = await response.json();

      setColetasEmAndamento(data);
    } catch (error) {
      toast({
        title: "Erro ao buscar coletas.",
        variant: "destructive",
      });
    }
  };

  // Adicionar/Remover item do carrinho
  const toggleItemCarrinho = (item: any, checked: boolean) => {
    if (checked) {
      setCarrinho((prev) => [...prev, item]);
      toast({ title: "Item adicionado ao carrinho!" });
    } else {
      setCarrinho((prev) => prev.filter((c) => c.id !== item.id));
      toast({ title: "Item removido do carrinho." });
    }
  };

  // Confirmar a coleta
  const confirmarColeta = async () => {
    try {
      const response = await fetch("/api/coletas", {
        cache: "no-cache",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ itens: carrinho.map((item) => item.id) }),
      });

      if (!response.ok) {
        throw new Error("Erro ao criar a coleta.");
      }

      toast({
        title: "Coleta criada com sucesso!",
        variant: "success",
      });

      setCarrinho([]);
      setPontos([]);
      fetchColetasEmAndamento();
    } catch (error) {
      toast({
        title: "Erro ao criar coleta.",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchCategorias();
    fetchColetasEmAndamento();
  }, []);

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-lg font-bold text-center">EcoCiclo</h1>

      {/* Filtro de Categorias */}
      <div className="space-y-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full">
              Filtrar por Categorias
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="space-y-2">
            <DropdownMenuLabel>Categorias</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="space-y-2 px-2">
              {categorias.map((categoria: any) => (
                <div
                  key={categoria.id}
                  className="flex items-center space-x-2 hover:bg-gray-100 p-1 rounded"
                >
                  <Checkbox
                    id={`categoria-${categoria.id}`}
                    checked={selectedCategorias.includes(categoria.id)}
                    onCheckedChange={(checked) => {
                      setSelectedCategorias((prev) =>
                        checked
                          ? [...prev, categoria.id]
                          : prev.filter((id) => id !== categoria.id)
                      );
                    }}
                  />
                  <Label htmlFor={`categoria-${categoria.id}`}>
                    {categoria.name}
                  </Label>
                </div>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button onClick={fetchPontos} className="w-full">
          Buscar Pontos de Coleta
        </Button>
      </div>

      {carrinho.length > 0 && (
        <CarrinhoDialog
          carrinho={carrinho}
          confirmarColeta={confirmarColeta}
          toggleItemCarrinho={toggleItemCarrinho}
        />
      )}

      {/* Listagem de Pontos */}
      <div className="space-y-4">
        {pontos.length ? (
          <h2 className="font-bold">pontos de coleta disponíveis</h2>
        ) : null}
        {isLoading ? (
          <p>Carregando...</p>
        ) : (
          pontos.map((ponto: any) => (
            <div
              key={ponto.id}
              className="p-4 border rounded-md shadow-sm hover:bg-gray-100"
            >
              <h3 className="font-medium">{ponto.name}</h3>
              {ponto.itens.map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-center space-x-2 hover:bg-gray-100 p-1 rounded"
                >
                  <Checkbox
                    id={`item-${item.id}`}
                    checked={carrinho.some((c) => c.id === item.id)}
                    onCheckedChange={(checked) =>
                      toggleItemCarrinho(
                        { ...item, pontoName: ponto.name, pontoId: ponto.id },
                        checked.valueOf() === true
                      )
                    }
                  />
                  <Label htmlFor={`item-${item.id}`}>
                    {item.categoria.name}
                  </Label>
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {/* Coletas em Andamento */}
      <div className="space-y-4">
        <h2 className="font-bold">coletas em andamento</h2>
        {coletasEmAndamento.map((coleta: any) => (
          <DrawerColetaEmAndamento
            key={coleta.id}
            coleta={coleta}
            onStatusUpdate={fetchColetasEmAndamento}
          />
        ))}
        {!coletasEmAndamento.length && (
          <p className="text-sm text-gray-500">
            você não tem nenhuma coleta em andamento ainda...
          </p>
        )}
      </div>
    </div>
  );
}
