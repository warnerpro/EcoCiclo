import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ShoppingCart } from "lucide-react";

export default function CarrinhoDialog({
  carrinho,
  toggleItemCarrinho,
  confirmarColeta,
}: {
  carrinho: any[];
  toggleItemCarrinho: (item: any, checked: boolean) => void;
  confirmarColeta: () => void;
}) {
  // Agrupar itens por ponto de coleta
  const pontosAgrupados = carrinho.reduce((acc: any, item: any) => {
    if (!acc[item.pontoId]) {
      acc[item.pontoId] = {
        id: item.pontoId,
        name: item.pontoName,
      };
    }

    acc[item.pontoId].itens = acc[item.pontoId].itens || [];

    acc[item.pontoId].itens.push(item);

    return acc;
  }, {});

  return (
    <Dialog>
      {carrinho.length > 0 && (
        <DialogTrigger asChild>
          <Button className="fixed right-4 rounded-full p-3 shadow-lg flex items-center z-50">
            <ShoppingCart className="w-6 h-6" />
            <span className="ml-2 text-sm font-medium">{carrinho.length}</span>
          </Button>
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Carrinho</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Accordion type="multiple">
            {Object.entries(pontosAgrupados).map(([pontoId, ponto]: any) => (
              <AccordionItem key={pontoId} value={pontoId}>
                <AccordionTrigger>{ponto.name}</AccordionTrigger>
                <AccordionContent>
                  {ponto.itens.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center p-2 border rounded-md"
                    >
                      <div>
                        <span>{item.categoria.name}</span>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="rounded-full"
                        onClick={() => toggleItemCarrinho(item, false)}
                      >
                        Remover
                      </Button>
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
        <Button
          className="mt-4 w-full"
          onClick={confirmarColeta}
          disabled={carrinho.length === 0}
        >
          Confirmar Coleta
        </Button>
      </DialogContent>
    </Dialog>
  );
}
