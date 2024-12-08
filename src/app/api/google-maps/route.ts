const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export async function GET(req: Request) {
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
      throw new Error("Erro ao consultar o Google Maps API.");
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error("Erro ao consultar o Google Maps API:", error);
    return Response.json(
      { error: "Erro ao consultar o Google Maps API." },
      { status: 500 }
    );
  }
}
