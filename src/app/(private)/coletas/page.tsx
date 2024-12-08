import UserColetas from "@/components/routes/coletas/usuario";
import CatadorColetas from "@/components/routes/coletas/catador";
import { authOptions } from "@/lib/auth/auth-options";
import { getServerSession } from "next-auth";

export default async function Coletas() {
  const session = await getServerSession(authOptions);

  // Renderiza o componente com base no tipo de usuário
  if (session?.user?.userType === "USUARIO") {
    return <UserColetas />;
  }

  if (session?.user?.userType === "CATADOR") {
    return <CatadorColetas />;
  }

  // Caso o tipo de usuário não seja reconhecido
  return <p>Tipo de usuário inválido.</p>;
}
