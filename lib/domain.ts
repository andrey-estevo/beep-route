export type PackageStatus = "scanned" | "address_pending" | "ready" | "out_for_delivery" | "delivered" | "failed";
export type StopStatus = "pending" | "skipped" | "completed" | "failed";
export type RouteStatus = "draft" | "scanning" | "ready" | "optimized" | "in_progress" | "completed" | "cancelled";
export interface DeliveryPackage { id: string; trackingCode: string; rawBarcode?: string; marketplaceStopNumber?: number; recipient?: string; address: string; latitude: number; longitude: number; status: PackageStatus; vehiclePosition?: string }
export interface DeliveryStop { id: string; sequence: number; marketplaceStopNumber?: number; address: string; latitude: number; longitude: number; status: StopStatus; packages: DeliveryPackage[] }
export interface RouteState { id: string; name: string; date: string; status: RouteStatus; origin: { address: string; latitude: number; longitude: number }; packages: DeliveryPackage[]; stops: DeliveryStop[]; startedAt?: string; completedAt?: string }
export const demoAddresses = [
  { address: "Av. Paulista, 1578 — Bela Vista, São Paulo", latitude: -23.5614, longitude: -46.6559 },
  { address: "Rua Haddock Lobo, 595 — Cerqueira César, São Paulo", latitude: -23.5588, longitude: -46.6654 },
  { address: "Rua Oscar Freire, 900 — Jardins, São Paulo", latitude: -23.5626, longitude: -46.6708 },
  { address: "Alameda Santos, 1415 — Jardim Paulista, São Paulo", latitude: -23.5652, longitude: -46.6538 },
];
export function normalizeTrackingCode(rawValue: string): string {
  const value = rawValue.trim();
  if (!value) return "";

  try {
    const decoded: unknown = JSON.parse(value);
    if (decoded && typeof decoded === "object") {
      const payload = decoded as Record<string, unknown>;
      const identifier = payload.ID ?? payload.id ?? payload.trackingCode ?? payload.tracking_code;
      if (typeof identifier === "string" || typeof identifier === "number") return String(identifier).trim().toUpperCase();
    }
  } catch {
    // Códigos de barras comuns não são JSON e seguem para a normalização padrão.
  }

  return value.toUpperCase();
}
export function makeDemoRoute(): RouteState { return { id: crypto.randomUUID(), name: `Rota ${new Intl.DateTimeFormat("pt-BR").format(new Date())}`, date: new Date().toISOString().slice(0, 10), status: "scanning", origin: { address: "Localização atual", latitude: 0, longitude: 0 }, packages: [], stops: [] }; }
export function addPackage(route: RouteState, trackingCode: string): { route: RouteState; duplicate: boolean } { const rawBarcode = trackingCode.trim(); const code = normalizeTrackingCode(rawBarcode); if (route.packages.some((item) => item.trackingCode === code)) return { route, duplicate: true }; const pack: DeliveryPackage = { id: crypto.randomUUID(), trackingCode: code, rawBarcode, address: "", latitude: 0, longitude: 0, status: "address_pending" }; return { route: { ...route, packages: [pack, ...route.packages] }, duplicate: false }; }
export function addDemoPackage(route: RouteState, trackingCode: string) { const result = addPackage(route, trackingCode); if (result.duplicate) return result; const location = demoAddresses[route.packages.length % demoAddresses.length]; const [pack, ...rest] = result.route.packages; return { duplicate: false, route: { ...result.route, packages: [{ ...pack, marketplaceStopNumber: route.packages.length + 1, address: location.address, latitude: location.latitude, longitude: location.longitude, status: "ready" as const, vehiclePosition: route.packages.length % 2 ? "Caixa A" : "Porta-malas esquerdo" }, ...rest] } }; }
export function groupStops(packages: DeliveryPackage[]): DeliveryStop[] { const groups = new Map<string, DeliveryPackage[]>(); for (const item of packages.filter((pack) => pack.status !== "delivered" && pack.status !== "address_pending" && pack.latitude !== 0 && pack.longitude !== 0)) { const key = item.marketplaceStopNumber ? `ml:${item.marketplaceStopNumber}` : `geo:${item.latitude.toFixed(5)}:${item.longitude.toFixed(5)}`; groups.set(key, [...(groups.get(key) ?? []), item]); } return [...groups.values()].map((items, index) => ({ id: crypto.randomUUID(), sequence: index + 1, marketplaceStopNumber: items[0].marketplaceStopNumber, address: items[0].address, latitude: items[0].latitude, longitude: items[0].longitude, status: "pending", packages: items })); }
export function progress(route: RouteState) { const delivered = route.packages.filter((item) => item.status === "delivered").length; const failed = route.packages.filter((item) => item.status === "failed").length; return { delivered, failed, pending: route.packages.length - delivered - failed, total: route.packages.length }; }
