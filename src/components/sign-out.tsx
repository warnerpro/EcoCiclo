"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function SignOutButton() {
  const handleSignOut = async () => {
    try {
      await signOut({ callbackUrl: "/" }); // Redireciona para a página de login
    } catch (error) {
      console.error("Erro ao encerrar a sessão:", error);
    }
  };

  return (
    <p onClick={handleSignOut} className="cursor-pointer text-destructive">
      sair
    </p>
  );
}
