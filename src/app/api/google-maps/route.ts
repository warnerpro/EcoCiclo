export async function GET(req: Request) {
  const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

  // Validar se a API Key está configurada
  if (!GOOGLE_API_KEY) {
    console.error("GOOGLE_MAPS_API_KEY não configurada no arquivo .env");
    return Response.json(
      { 
        error: "API Key do Google Maps não configurada no servidor.",
        details: "Configure a variável GOOGLE_MAPS_API_KEY no arquivo .env"
      },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query");
  const latlng = searchParams.get("latlng");
  const type = searchParams.get("type"); // "places" ou "geocode"

  if (!query && !latlng) {
    return Response.json(
      { error: "Parâmetro 'query' ou 'latlng' é obrigatório." },
      { status: 400 }
    );
  }

  try {
    let apiUrl = "";

    if (type === "places" && query) {
      apiUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
        query
      )}&key=${GOOGLE_API_KEY}`;
    } else if (type === "geocode" && latlng) {
      apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${encodeURIComponent(
        latlng
      )}&key=${GOOGLE_API_KEY}`;
    } else {
      return Response.json(
        { error: "Tipo inválido. Use 'places' ou 'geocode'." },
        { status: 400 }
      );
    }

    const response = await fetch(apiUrl);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Erro na resposta do Google Maps API:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      
      return Response.json(
        { 
          error: "Erro ao consultar o Google Maps API.",
          details: errorData.error_message || response.statusText,
          status: response.status
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Verificar se a resposta tem status OK do Google
    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      console.error("Erro do Google Maps API:", data);
      return Response.json(
        { 
          error: `Erro da API do Google Maps: ${data.status}`,
          details: data.error_message || "Verifique se a API Key está correta e as APIs necessárias estão habilitadas no Google Cloud Console.",
          googleStatus: data.status
        },
        { status: 400 }
      );
    }
    
    return Response.json(data);
  } catch (error) {
    console.error("Erro ao consultar o Google Maps API:", error);
    return Response.json(
      { 
        error: "Erro ao consultar o Google Maps API.",
        details: error instanceof Error ? error.message : "Erro desconhecido"
      },
      { status: 500 }
    );
  }
}
