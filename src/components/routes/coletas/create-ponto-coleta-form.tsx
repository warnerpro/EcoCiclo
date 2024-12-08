"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const formSchema = z.object({
  address: z
    .string()
    .min(5, { message: "Por favor, insira um endereço válido." }),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreatePontoColetaForm({
  onSuccess,
}: {
  onSuccess: () => void;
}) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      address: "",
      latitude: undefined,
      longitude: undefined,
    },
  });

  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false); // Adiciona estado para controle do loading no botão
  const [confirmationDialog, setConfirmationDialog] = useState<{
    name: string;
    latitude: number;
    longitude: number;
  } | null>(null);

  // Função de debounce
  const debounce = (func: (...args: any[]) => void, delay: number) => {
    let timer: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  // Buscar endereço via rota de proxy do Google Maps
  const searchAddress = async (query: string) => {
    if (!query) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const response = await fetch(
        `/api/google-maps?type=places&query=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      setSearchResults(data.results || []);
    } catch (error) {
      toast({
        title: "Erro ao buscar endereços.",
        description: "Verifique sua conexão ou tente novamente.",
        variant: "destructive",
      });
      console.error("Erro ao buscar endereço:", error);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search function
  const debouncedSearch = useCallback(debounce(searchAddress, 500), []);

  // Atualizar a busca conforme o usuário digita
  useEffect(() => {
    const address = form.getValues("address");
    debouncedSearch(address);
  }, [form.watch("address")]);

  // Obter localização atual
  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      toast({
        title: "Erro",
        description: "Geolocalização não suportada pelo navegador.",
        variant: "destructive",
      });
      return;
    }

    setIsLocating(true); // Inicia o loading
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `/api/google-maps?type=geocode&latlng=${latitude},${longitude}`
          );
          const data = await response.json();

          if (data.results.length > 0) {
            const name = data.results[0].formatted_address;
            setConfirmationDialog({
              name,
              latitude,
              longitude,
            });
          }
        } catch (error) {
          toast({
            title: "Erro ao obter endereço",
            description:
              "Não foi possível encontrar um endereço para sua localização.",
            variant: "destructive",
          });
        } finally {
          setIsLocating(false); // Finaliza o loading
        }
      },
      (error) => {
        setIsLocating(false); // Finaliza o loading em caso de erro
        toast({
          title: "Erro ao acessar localização",
          description:
            "Certifique-se de que a localização está ativada no navegador.",
          variant: "destructive",
        });
        console.error("Erro ao acessar localização:", error);
      }
    );
  };

  // Submeter o formulário
  const submitAddress = async (values: {
    name: string;
    latitude: number;
    longitude: number;
  }) => {
    try {
      const response = await fetch("/api/pontos-de-coleta", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Erro ao criar ponto de coleta.");
      }

      form.reset();
      toast({
        title:
          "Parabéns! Você criou um ponto de coleta e ganhou +25 pontos por isso!",
        description: `O ponto "${values.name}" foi adicionado à sua lista.`,
        variant: "success",
      });
      onSuccess();
    } catch (error) {
      toast({
        title: "Erro ao criar ponto de coleta.",
        description: "Verifique os dados inseridos e tente novamente.",
        variant: "destructive",
      });
      console.error("Erro ao criar ponto de coleta:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(() => {})} className="space-y-4">
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Endereço</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex.: Rua do Lavradio, Rio de Janeiro"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {isSearching && <p className="text-sm text-gray-400">Buscando...</p>}

        {searchResults.length > 0 && (
          <div className="space-y-2">
            {searchResults.map((result) => (
              <div
                key={result.place_id}
                className="p-2 border rounded-md cursor-pointer"
                onClick={() =>
                  setConfirmationDialog({
                    name: result.formatted_address,
                    latitude: result.geometry.location.lat,
                    longitude: result.geometry.location.lng,
                  })
                }
              >
                {result.formatted_address}
              </div>
            ))}
          </div>
        )}

        <Button
          type="button"
          variant="outline"
          onClick={getCurrentLocation}
          className="w-full"
          disabled={isLocating} // Desativa enquanto o loading está ativo
        >
          {isLocating ? "Localizando..." : "Usar Localização Atual"}
        </Button>

        {/* Dialog de Confirmação */}
        {confirmationDialog && (
          <Dialog open={!!confirmationDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirmar Endereço</DialogTitle>
              </DialogHeader>
              <p>{confirmationDialog.name}</p>
              <div className="flex justify-end space-x-2 mt-4">
                <Button
                  variant="secondary"
                  onClick={() => setConfirmationDialog(null)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    submitAddress({
                      name: confirmationDialog.name,
                      latitude: confirmationDialog.latitude,
                      longitude: confirmationDialog.longitude,
                    });
                    setConfirmationDialog(null);
                  }}
                >
                  Confirmar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </form>
    </Form>
  );
}
