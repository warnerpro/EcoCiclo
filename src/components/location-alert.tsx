"use client";

import React, { useEffect, useState } from "react";

const LocationAlert = () => {
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    // Verifica a permissão de localização
    navigator.permissions
      .query({ name: "geolocation" })
      .then((permissionStatus) => {
        if (permissionStatus.state === "denied") {
          setShowAlert(true);
        }

        // Observa mudanças no status da permissão
        permissionStatus.onchange = () => {
          if (permissionStatus.state === "denied") {
            setShowAlert(true);
          } else {
            setShowAlert(false);
          }
        };
      })
      .catch((err) => {
        console.error("Erro ao verificar permissão de localização:", err);
        setShowAlert(true); // Exibe alerta se houver erro
      });
  }, []);

  if (!showAlert) {
    return null; // Não exibe nada se a permissão não estiver negada
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        padding: "15px",
        backgroundColor: "#f44336",
        color: "#fff",
        borderRadius: "8px",
        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
        zIndex: 1000,
      }}
    >
      <p>
        ⚠️ Você precisa permitir o acesso à sua localização para aproveitar
        todas as funcionalidades.
      </p>
      <button
        style={{
          marginTop: "10px",
          padding: "8px 12px",
          backgroundColor: "#fff",
          color: "#f44336",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
        onClick={() => setShowAlert(false)}
      >
        Fechar
      </button>
    </div>
  );
};

export default LocationAlert;
