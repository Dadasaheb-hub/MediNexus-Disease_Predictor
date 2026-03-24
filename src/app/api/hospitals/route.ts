const OVERPASS_API = "https://overpass-api.de/api/interpreter";

interface OverpassElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

export async function POST(request: Request) {
  try {
    const { lat, lng } = await request.json();

    if (typeof lat !== "number" || typeof lng !== "number") {
      return Response.json(
        { error: "lat and lng are required numbers." },
        { status: 400 }
      );
    }

    // Overpass QL: find hospitals within 5 km radius
    const query = `
      [out:json][timeout:10];
      (
        node["amenity"="hospital"](around:5000,${lat},${lng});
        way["amenity"="hospital"](around:5000,${lat},${lng});
        relation["amenity"="hospital"](around:5000,${lat},${lng});
      );
      out center body 10;
    `;

    const res = await fetch(OVERPASS_API, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `data=${encodeURIComponent(query)}`,
    });

    if (!res.ok) {
      return Response.json(
        { error: "Overpass API request failed." },
        { status: 502 }
      );
    }

    const json = await res.json();
    const elements: OverpassElement[] = json.elements ?? [];

    const hospitals = elements
      .map((el, idx) => {
        const elLat = el.lat ?? el.center?.lat;
        const elLng = el.lon ?? el.center?.lon;
        if (!elLat || !elLng) return null;

        return {
          id: el.id ?? idx,
          name: el.tags?.name ?? "Unnamed Hospital",
          address:
            [
              el.tags?.["addr:street"],
              el.tags?.["addr:city"],
              el.tags?.["addr:postcode"],
            ]
              .filter(Boolean)
              .join(", ") || "Address not available",
          phone: el.tags?.phone ?? el.tags?.["contact:phone"] ?? "N/A",
          specialty:
            el.tags?.healthcare ??
            el.tags?.["health_facility:type"] ??
            "General Hospital",
          lat: elLat,
          lng: elLng,
        };
      })
      .filter(Boolean)
      .slice(0, 10);

    return Response.json({ hospitals });
  } catch (err: unknown) {
    console.error("[/api/hospitals] Error:", err);
    return Response.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "An unexpected error occurred.",
      },
      { status: 500 }
    );
  }
}
