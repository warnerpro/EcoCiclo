"use client";

import debounce from "lodash/debounce";
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
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";

const formSchema = z.object({
  address: z
    .string()
    .min(5, { message: "Por favor, insira um endereço válido." }),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function DrawerCreatePontoColeta({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
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
  const [isLocating, setIsLocating] = useState(false);
  const [confirmationData, setConfirmationData] = useState<{
    name: string;
    latitude: number;
    longitude: number;
  } | null>(null);

  // Função para buscar endereço via Google Maps API
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
    } finally {
      setIsSearching(false);
    }
  };

  const debouncedSearch = useCallback(
    debounce((query) => searchAddress(query), 500),
    []
  );

  // Busca endereços ao digitar
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

    setIsLocating(true);
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
            setConfirmationData({ name, latitude, longitude });
          }
        } catch {
          toast({
            title: "Erro ao obter localização",
            description: "Não foi possível localizar seu endereço.",
            variant: "destructive",
          });
        } finally {
          setIsLocating(false);
        }
      },
      () => {
        setIsLocating(false);
        toast({
          title: "Erro ao acessar localização",
          description: "Ative a localização no navegador.",
          variant: "destructive",
        });
      }
    );
  };

  // Submeter endereço
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
      onClose();
      toast({
        title: "Ponto criado com sucesso! +25 pontos",
        description: `O ponto "${values.name}" foi adicionado e você ganhou +25 pontos por isso!`,
        variant: "success",
      });
      onSuccess();
    } catch {
      toast({
        title: "Erro ao criar ponto.",
        description: "Verifique os dados e tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Criar Ponto de Coleta</DrawerTitle>
          <DrawerDescription>
            Preencha os dados para criar um novo ponto de coleta.
          </DrawerDescription>
        </DrawerHeader>
        <div className="space-y-4 p-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(() => {})}>
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
            </form>
          </Form>

          {isSearching && <p className="text-sm text-gray-400">Buscando...</p>}

          {searchResults.length > 0 && (
            <div className="space-y-2">
              {searchResults.map((result) => (
                <div
                  key={result.place_id}
                  className="p-2 border rounded-md cursor-pointer hover:bg-gray-100"
                  onClick={() =>
                    setConfirmationData({
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
            onClick={getCurrentLocation}
            className="w-full"
            disabled={isLocating}
          >
            {isLocating ? "Localizando..." : "Usar Localização Atual"}
          </Button>

          {confirmationData && (
            <div className="mt-4 p-4 border rounded-md bg-gray-50">
              <p>Confirme o endereço:</p>
              <p className="font-bold">{confirmationData.name}</p>
              <div className="mt-2 flex justify-end space-x-2">
                <Button
                  variant="secondary"
                  onClick={() => setConfirmationData(null)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    submitAddress(confirmationData);
                    setConfirmationData(null);
                  }}
                >
                  Confirmar
                </Button>
              </div>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
