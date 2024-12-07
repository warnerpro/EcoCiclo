import { Button } from "@/components/ui/button";
import { authOptions } from "@/lib/auth/auth-options";
import prisma from "@/lib/db/db";
import { X } from "lucide-react";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { levels } from "@/lib/constants/levels";
import { Progress } from "@/components/ui/progress";

export const dynamic = "force-dynamic";

export default async function Profile() {
  const session = await getServerSession(authOptions);

  const scoreOrNull = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      score: true,
    },
  });

  if (!scoreOrNull) {
    throw new Error("Usuário não encontrado");
  }

  const getFirstAndLastName = (name: string) => {
    const [firstName, lastName] = name.split(" ");
    return `${firstName} ${lastName}`;
  };

  const actualLevel =
    levels
      .slice()
      .reverse()
      .find((level) => scoreOrNull.score >= level.scoreRequired) || levels[0];

  const progress =
    (scoreOrNull.score - actualLevel.scoreRequired) /
    (actualLevel.scoreRequired - levels[levels.length - 1].scoreRequired);

  return (
    <div className="flex text-center  flex-col p-4 space-y-16">
      <div className="flex w-full justify-center">
        <h1 className="font-bold">Perfil</h1>
        <Link href="/home">
          <X className="absolute left-4 font-light" />
        </Link>
      </div>
      <div className="flex flex-col items-start space-y-4">
        <div
          className="w-24 h-24 rounded-full bg-gray-200"
          style={{
            backgroundImage: "url('https://random.imagecdn.app/96/96')",
          }}
        ></div>
        <div className="flex flex-col items-start text-start">
          <h2 className="font-bold">
            {getFirstAndLastName(session.user.name)}
          </h2>
          <p className="font-light text-sm text-gray-400">
            {session.user.email}
          </p>
        </div>
        <Button variant="secondary" className="w-full font-bold">
          Editar perfil
        </Button>
      </div>
      <div className="w-full flex flex-col items-start space-y-4">
        <h2 className="font-bold">score</h2>
        <div className="w-full flex flex-col items-start text-start space-y-2">
          <h2>
            Level {actualLevel.level}: {actualLevel.name}
          </h2>
          <Progress value={progress} className="w-full" />
          <p className="text-xs text-gray-400">
            {actualLevel.motivationalPhrase}
          </p>
        </div>
      </div>
    </div>
  );
}
