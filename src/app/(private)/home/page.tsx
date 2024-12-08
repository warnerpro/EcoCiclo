import { Button } from "@/components/ui/button";
import { authOptions } from "@/lib/auth/auth-options";
import { getServerSession } from "next-auth";
import Link from "next/link";

export default async function Home() {
  const session = await getServerSession(authOptions);
  const getFirstAndLastName = (name: string) => {
    const [firstName, lastName] = name.split(" ");
    return `${firstName} ${lastName}`;
  };

  const getMessage = () => {
    switch (session.user.userType) {
      case "USUARIO":
        return "Registrar Coleta";
      case "CATADOR":
        return "Buscar Coletas";
      default:
        return "Acessar Dashboard";
    }
  };

  return (
    <div className="flex text-center  flex-col p-4 space-y-16">
      <h1 className="font-extrabold">EcoCiclo</h1>
      <p className="text-xl font-bold">
        Bem-vindo, {getFirstAndLastName(session.user.name)}!
      </p>
      <p className="font-light">Juntos, estamos transformando o mundo!</p>
      <Link href="/coletas">
        <Button className="w-full font-bold">{getMessage()}</Button>
      </Link>
    </div>
  );
}
