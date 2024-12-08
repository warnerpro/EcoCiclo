import React from "react";
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";

// Estilos do PDF
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Helvetica",
    textAlign: "center",
    margin: "auto",
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  text: {
    fontSize: 18,
    marginBottom: 10,
    color: "#555",
  },
  footer: {
    marginTop: 20,
    fontSize: 12,
    color: "gray",
  },
});

// Componente do Certificado
const CertificadoPDF = ({ nome }: { nome: string }) => (
  <Document>
    <Page style={styles.page} size="A4" orientation="landscape">
      <View>
        <Text style={styles.title}>Certificado de Participação</Text>
        <Text style={styles.text}>
          Conferimos a <Text style={{ fontWeight: "bold" }}>{nome}</Text> este
          certificado de participação no programa EcoCiclo.
        </Text>
        <Text style={styles.text}>
          Parabéns por sua dedicação à sustentabilidade!
        </Text>
        <Text style={styles.footer}>
          Data: {new Date().toLocaleDateString()} - EcoCiclo - Sustentabilidade
          em Ação
        </Text>
      </View>
    </Page>
  </Document>
);

export default CertificadoPDF;
