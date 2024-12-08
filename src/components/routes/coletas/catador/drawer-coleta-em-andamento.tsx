"use client";

import { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Icon } from "@/components/icon";
import { ChevronRight } from "lucide-react";

interface DrawerColetaEmAndamentoProps {
  coleta: any; // Substitua pelo tipo da coleta se houver um definido
  onStatusUpdate: () => void; // Função para atualizar a lista de coletas em andamento
}

export default function DrawerColetaEmAndamento({
  coleta,
  onStatusUpdate,
}: DrawerColetaEmAndamentoProps) {
  const [itens, setItens] = useState(coleta.itens);

  const handleConfirmarItem = async (itemId: number) => {
    try {
      const response = await fetch(`/api/coletas/${coleta.id}/itens`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ itemId, coletado: true }),
      });

      if (!response.ok) {
        throw new Error("Erro ao confirmar item.");
      }

      const updatedItens = itens.map((item: any) =>
        item.id === itemId ? { ...item, coletado: true } : item
      );

      setItens(updatedItens);

      if (updatedItens.every((item: any) => item.coletado)) {
        await fetch(`/api/coletas`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: coleta.id, status: "CONCLUIDA" }),
        });

        toast({ title: "Coleta concluída com sucesso!", variant: "success" });
        onStatusUpdate();
      } else {
        toast({ title: "Item confirmado com sucesso!", variant: "success" });
      }
    } catch (error) {
      toast({
        title: "Erro ao confirmar item.",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  const handleRemoverItem = async (itemId: number) => {
    try {
      const response = await fetch(`/api/coletas/${coleta.id}/itens`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ itemId }),
      });

      if (!response.ok) {
        throw new Error("Erro ao remover item.");
      }

      setItens(itens.filter((item: any) => item.id !== itemId));

      toast({ title: "Item removido com sucesso!", variant: "success" });
    } catch (error) {
      toast({
        title: "Erro ao remover item.",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <div className="p-4 border rounded-md shadow-sm hover:bg-gray-100 flex justify-between">
          <div className="flex items-center space-x-2">
            {coleta.itens.map((item: any) => (
              <Icon
                key={item.id}
                name={item.categoria.iconKey}
                color={item.coletado ? "green" : "orange"}
              />
            ))}
          </div>
          <ChevronRight />
        </div>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Coleta #{coleta.id}</DrawerTitle>
          <p className="text-sm text-gray-500">{coleta.address}</p>
        </DrawerHeader>
        <div className="space-y-4 p-4">
          {itens.map((item: any) => (
            <div
              key={item.id}
              className="flex justify-between items-center p-2 border rounded-md"
            >
              <div className="flex items-center space-x-2">
                <Icon
                  name={item.categoria.iconKey}
                  color={item.coletado ? "green" : "orange"}
                  size={24}
                />
                <span className={item.coletado ? "line-through" : ""}>
                  {item.categoria.name}
                </span>
              </div>
              <div className="flex space-x-2">
                {!item.coletado && (
                  <Button
                    size="sm"
                    onClick={() => handleConfirmarItem(item.id)}
                  >
                    Confirmar
                  </Button>
                )}
                {!item.coletado && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoverItem(item.id)}
                  >
                    Remover
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
