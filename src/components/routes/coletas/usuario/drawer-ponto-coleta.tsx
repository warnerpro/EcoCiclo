"use client";

import { Icon } from "@/components/icon";
import { Button } from "@/components/ui/button";
import DialogNovoItem from "@/components/routes/coletas/usuario/dialog-novo-item";
import { toast } from "@/hooks/use-toast";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useState } from "react";

interface Item {
  id: number;
  coletado: boolean;
  categoria: {
    name: string;
    iconKey: string;
  };
}

interface DrawerPontoColetaProps {
  pontoId: number;
  pontoName: string;
  itens: Item[];
  onItemAdded: () => void; // Atualiza a lista de itens ao adicionar
  onItemRemoved: () => void; // Atualiza a lista de itens ao remover
  isLoadingItens: boolean; // Exibe carregamento enquanto busca itens
  isOpen: boolean; // Controla a abertura do Drawer
  onClose: () => void; // Função para fechar o Drawer
}

export default function DrawerPontoColeta({
  pontoId,
  pontoName,
  itens,
  onItemAdded,
  onItemRemoved,
  isLoadingItens,
  isOpen,
  onClose,
}: DrawerPontoColetaProps) {
  const handleRemoveItem = async (itemId: number) => {
    try {
      const response = await fetch(
        `/api/pontos-de-coleta/${pontoId}/itens/${itemId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao remover item.");
      }

      toast({
        title: "Item removido com sucesso!",
        description: "O item foi removido do ponto de coleta.",
      });

      onItemRemoved(); // Atualiza a lista de itens
    } catch (error) {
      toast({
        title: "Erro ao remover item.",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
      console.error("Erro ao remover item:", error);
    }
  };

  function shortName(name: string) {
    return name.split(" ")[0];
  }

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{pontoName}</DrawerTitle>
        </DrawerHeader>
        <div className="py-4 space-y-4 px-4">
          <h2 className="font-bold">Itens no Ponto de Coleta</h2>
          {isLoadingItens ? (
            <p className="text-gray-500 text-center">Carregando...</p>
          ) : itens.length > 0 ? (
            itens.map((item) => (
              <div
                key={item.id}
                className="p-2 border rounded-md shadow-sm flex justify-between items-center"
              >
                <div className="flex items-center space-x-2">
                  <Icon name={item.categoria.iconKey} size={24} />
                  <div>
                    <p className="font-medium">
                      {shortName(item.categoria.name)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRemoveItem(item.id)}
                >
                  Remover
                </Button>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center">
              Nenhum item disponível neste ponto.
            </p>
          )}
          <div className="flex justify-end pt-4">
            <DialogNovoItem
              pontoId={pontoId}
              onItemAdded={onItemAdded} // Atualiza a lista de itens ao adicionar
            />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
