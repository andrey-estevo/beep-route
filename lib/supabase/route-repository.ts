import type { DeliveryPackage, DeliveryStop, PackageStatus, RouteState, RouteStatus, StopStatus } from "../domain";
import { getSupabaseBrowserClient } from "./client";

interface RouteRow { id: string; name: string; route_date: string; status: RouteStatus; origin_address: string; origin_lat: number | null; origin_lng: number | null; started_at: string | null; completed_at: string | null }
interface PackageRow { id: string; stop_id: string | null; tracking_code: string; recipient_name: string | null; address_full: string | null; latitude: number | null; longitude: number | null; status: PackageStatus; vehicle_position: string | null }
interface StopRow { id: string; sequence: number; address_full: string; latitude: number; longitude: number; status: StopStatus }

export async function loadRemoteRoute(userId: string): Promise<RouteState | null> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.from("routes").select("id,name,route_date,status,origin_address,origin_lat,origin_lng,started_at,completed_at").eq("user_id", userId).in("status", ["draft", "scanning", "ready", "optimized", "in_progress"]).order("created_at", { ascending: false }).limit(1);
  if (error) throw error;
  const row = (data as RouteRow[] | null)?.[0];
  if (!row) return null;
  const [{ data: packageData, error: packageError }, { data: stopData, error: stopError }] = await Promise.all([
    supabase.from("packages").select("id,stop_id,tracking_code,recipient_name,address_full,latitude,longitude,status,vehicle_position").eq("route_id", row.id).order("scanned_at", { ascending: false }),
    supabase.from("route_stops").select("id,sequence,address_full,latitude,longitude,status").eq("route_id", row.id).order("sequence"),
  ]);
  if (packageError) throw packageError;
  if (stopError) throw stopError;
  const packageRows = (packageData ?? []) as PackageRow[];
  const packages: DeliveryPackage[] = packageRows.map((item) => ({ id: item.id, trackingCode: item.tracking_code, recipient: item.recipient_name ?? undefined, address: item.address_full ?? "", latitude: item.latitude ?? 0, longitude: item.longitude ?? 0, status: item.status, vehiclePosition: item.vehicle_position ?? undefined }));
  const packageByStop = new Map<string, DeliveryPackage[]>();
  packageRows.forEach((item, index) => { if (item.stop_id) packageByStop.set(item.stop_id, [...(packageByStop.get(item.stop_id) ?? []), packages[index]]); });
  const stops: DeliveryStop[] = ((stopData ?? []) as StopRow[]).map((item) => ({ id: item.id, sequence: item.sequence, address: item.address_full, latitude: item.latitude, longitude: item.longitude, status: item.status, packages: packageByStop.get(item.id) ?? [] }));
  return { id: row.id, name: row.name, date: row.route_date, status: row.status, origin: { address: row.origin_address, latitude: row.origin_lat ?? 0, longitude: row.origin_lng ?? 0 }, packages, stops, startedAt: row.started_at ?? undefined, completedAt: row.completed_at ?? undefined };
}

export async function saveRemoteRoute(route: RouteState, userId: string) {
  const supabase = getSupabaseBrowserClient();
  const { error: profileError } = await supabase.from("profiles").upsert({ id: userId, updated_at: new Date().toISOString() }, { onConflict: "id" });
  if (profileError) throw profileError;
  const { error: routeError } = await supabase.from("routes").upsert({ id: route.id, user_id: userId, name: route.name, route_date: route.date, status: route.status, origin_address: route.origin.address, origin_lat: route.origin.latitude, origin_lng: route.origin.longitude, return_to_origin: false, optimizer_provider: route.stops.length ? "local" : null, started_at: route.startedAt ?? null, completed_at: route.completedAt ?? null, updated_at: new Date().toISOString() }, { onConflict: "id" });
  if (routeError) throw routeError;
  if (route.stops.length) {
    const { error } = await supabase.from("route_stops").upsert(route.stops.map((stop) => ({ id: stop.id, user_id: userId, route_id: route.id, sequence: stop.sequence, address_full: stop.address, latitude: stop.latitude, longitude: stop.longitude, status: stop.status, completed_at: stop.status === "completed" || stop.status === "failed" ? new Date().toISOString() : null, updated_at: new Date().toISOString() })), { onConflict: "id" });
    if (error) throw error;
  }
  if (route.packages.length) {
    const stopByPackage = new Map(route.stops.flatMap((stop) => stop.packages.map((pack) => [pack.id, stop.id] as const)));
    const { error } = await supabase.from("packages").upsert(route.packages.map((pack) => ({ id: pack.id, user_id: userId, route_id: route.id, stop_id: stopByPackage.get(pack.id) ?? null, tracking_code: pack.trackingCode, barcode_raw: pack.trackingCode, address_full: pack.address, latitude: pack.latitude, longitude: pack.longitude, status: pack.status, vehicle_position: pack.vehiclePosition ?? null, delivered_at: pack.status === "delivered" ? new Date().toISOString() : null, updated_at: new Date().toISOString() })), { onConflict: "id" });
    if (error) throw error;
  }
}
