"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "O nome deve ter pelo menos 2 caracteres.",
  }),
  cpf: z
    .string()
    .regex(/^\d{11}$/, { message: "O CPF deve conter exatamente 11 dígitos." }),
  birthDate: z.string().refine((value) => !isNaN(Date.parse(value)), {
    message: "Por favor, insira uma data válida.",
  }),
  email: z.string().email("Por favor, insira um email válido."),
  password: z.string().min(1, {
    message: "A senha deve ter pelo menos 1 caractere.",
  }),
  agreeTerms: z.boolean().refine((value) => value === true, {
    message: "Você deve concordar com os termos.",
  }),
  userType: z.enum(["CATADOR", "USUARIO"]),
});

type RegisterFormValues = z.infer<typeof formSchema>;

export default function RegisterForm() {
  const [userType, setUserType] = useState<"CATADOR" | "USUARIO" | null>(null); // Define o tipo de usuário
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      cpf: "",
      birthDate: "",
      email: "",
      password: "",
      agreeTerms: false,
      userType: "USUARIO",
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      const response = await fetch("/api/register", {
        cache: "no-cache",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        toast({
          title: "Erro ao criar conta",
          description: "Por favor, tente novamente.",
          variant: "destructive",
        });
      }

      // Redireciona após cadastro bem-sucedido
      window.location.href = "/";
    } catch (error) {
      console.error("Erro no registro:", error);
      toast({
        title: "Erro ao criar conta",
        description: "Por favor, tente novamente.",
        variant: "destructive",
      });
    }
  };

  if (!userType) {
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-white rounded-md">
        <div className="flex space-x-4 items-center mb-6">
          <Link href="/">
            <ArrowLeft />
          </Link>
          <h1 className="text-2xl font-bold text-start">Quem é você?</h1>
        </div>
        <div className="flex flex-col space-y-4">
          <Button className="w-full" onClick={() => setUserType("USUARIO")}>
            Sou Usuário
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setUserType("CATADOR")}
          >
            Sou Catador
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-md">
      <div className="flex space-x-4 items-center mb-6">
        <Button
          variant="ghost"
          onClick={() => setUserType(null)}
          className="p-0"
        >
          <ArrowLeft />
        </Button>
        <h1 className="text-2xl font-bold text-start">Cadastro - {userType}</h1>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((data) =>
            onSubmit({ ...data, userType })
          )}
          className="space-y-6"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input placeholder="Seu nome completo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cpf"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CPF</FormLabel>
                <FormControl>
                  <Input placeholder="Apenas números" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="birthDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Nascimento</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="seuemail@exemplo.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Senha</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="agreeTerms"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Concordo com os{" "}
                    <Link
                      href="/termos.pdf"
                      target="_blank"
                      className="text-primary"
                    >
                      Termos e Condições
                    </Link>
                    .
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full">
            Criar Conta
          </Button>
        </form>
      </Form>
    </div>
  );
}
