import SignInForm from "@/components/routes/auth/sign-in-form";
import Link from "next/link";

export default async function SignInHomepage({ searchParams }) {
  const params = await searchParams;

  return (
    <div className="flex flex-col items-center w-full min-h-screen">
      <div
        className="flex w-full h-[15rem] bg-cover bg-center relative"
        style={{
          backgroundImage: `url('/background-login.png')`, // Substitua pelo caminho da sua imagem
        }}
      >
        <div className="absolute bottom-2 w-full text-start px-2">
          <h2 className="text-3xl font-bold text-white">EcoCiclo</h2>
        </div>
      </div>
      <div className="w-full max-w-md p-6 bg-white rounded-md">
        <h1 className="text-2xl font-bold text-center mb-6">Bem Vindo!</h1>
        {params?.error ? (
          <h2 className="text-sm text-destructive text-start mb-6">
            Email ou senha incorretos.
          </h2>
        ) : null}
        <SignInForm />
      </div>
      <Link
        href="/register"
        className="text-sm text-center text-foreground/40 w-full mx-auto"
      >
        registrar
      </Link>
    </div>
  );
}
