"use client";

import React from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import CertificadoPDF from "@/components/routes/profile/certificado";
import { Button } from "@/components/ui/button";
import { getSession } from "next-auth/react";

export default function BaixarCertificado() {
  const [nome, setNome] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchSession = async () => {
      const session = await getSession();
      if (session && session.user?.name) {
        setNome(session.user.name);
      } else {
        alert("Usuário não autenticado.");
      }
    };
    fetchSession();
  }, []);

  if (!nome) {
    return null;
  }

  return (
    <div className="w-full flex flex-col items-start space-y-4">
      <h2 className="font-bold">certificado</h2>
      <div className="w-full flex flex-col items-start text-start space-y-2">
        <PDFDownloadLink
          document={<CertificadoPDF nome={nome} />}
          fileName={`certificado_${nome
            .split(" ")
            .join("_")
            .toLowerCase()}.pdf`}
        >
          <Button className="" variant="secondary">
            Baixar Certificado
          </Button>
        </PDFDownloadLink>
      </div>
    </div>
  );
}
