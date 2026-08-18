import { NextResponse } from "next/server";

interface Suggestion { label: string; latitude: number; longitude: number; provider: "google" | "openstreetmap" }
const memoryCache = new Map<string, { expires: number; results: Suggestion[] }>();
let lastNominatimRequest = 0;

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim();
  if (!query || query.length < 8 || query.length > 300) return NextResponse.json({ error: "Endereço inválido" }, { status: 400 });
  const key = query.toLocaleLowerCase("pt-BR");
  const cached = memoryCache.get(key);
  if (cached && cached.expires > Date.now()) return NextResponse.json({ suggestions: cached.results });
  try {
    const results = process.env.GOOGLE_MAPS_SERVER_API_KEY ? await googleGeocode(query) : await nominatimGeocode(query);
    memoryCache.set(key, { expires: Date.now() + 24 * 60 * 60 * 1000, results });
    return NextResponse.json({ suggestions: results, approximate: !process.env.GOOGLE_MAPS_SERVER_API_KEY });
  } catch { return NextResponse.json({ error: "Falha ao consultar o serviço de endereços" }, { status: 502 }); }
}

async function googleGeocode(query: string): Promise<Suggestion[]> {
  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("address", query); url.searchParams.set("language", "pt-BR"); url.searchParams.set("region", "br"); url.searchParams.set("key", process.env.GOOGLE_MAPS_SERVER_API_KEY ?? "");
  const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error("Google geocoding failed");
  const body = await response.json() as { results?: Array<{ formatted_address: string; geometry: { location: { lat: number; lng: number } } }> };
  return (body.results ?? []).slice(0, 5).map((item) => ({ label: item.formatted_address, latitude: item.geometry.location.lat, longitude: item.geometry.location.lng, provider: "google" }));
}

async function nominatimGeocode(query: string): Promise<Suggestion[]> {
  const wait = Math.max(0, 1050 - (Date.now() - lastNominatimRequest));
  if (wait) await new Promise((resolve) => setTimeout(resolve, wait));
  lastNominatimRequest = Date.now();
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", query); url.searchParams.set("format", "jsonv2"); url.searchParams.set("addressdetails", "1"); url.searchParams.set("countrycodes", "br"); url.searchParams.set("limit", "5"); url.searchParams.set("accept-language", "pt-BR");
  const response = await fetch(url, { headers: { "User-Agent": "BeepRoute/1.0 (https://beep-route.vercel.app)", Referer: "https://beep-route.vercel.app" }, signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error("Nominatim failed");
  const body = await response.json() as Array<{ display_name: string; lat: string; lon: string }>;
  return body.map((item) => ({ label: item.display_name, latitude: Number(item.lat), longitude: Number(item.lon), provider: "openstreetmap" }));
}
