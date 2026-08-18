"use client";

import { useState, type FormEvent } from "react";
import type { DeliveryPackage } from "../lib/domain";

interface Suggestion { label: string; latitude: number; longitude: number; provider: string }
interface Props { pack: DeliveryPackage; onSave: (pack: DeliveryPackage) => void; onDelete: () => void; onClose: () => void }

export function AddressEditor({ pack, onSave, onDelete, onClose }: Props) {
  const [address, setAddress] = useState(pack.address);
  const [recipient, setRecipient] = useState(pack.recipient ?? "");
  const [vehiclePosition, setVehiclePosition] = useState(pack.vehiclePosition ?? "");
  const [marketplaceStopNumber, setMarketplaceStopNumber] = useState(pack.marketplaceStopNumber?.toString() ?? "");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selected, setSelected] = useState<Suggestion | null>(pack.latitude && pack.longitude ? { label: pack.address, latitude: pack.latitude, longitude: pack.longitude, provider: "saved" } : null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  function changeAddress(value: string) { setAddress(value); setSelected(null); setSuggestions([]); }
  async function search(event: FormEvent) {
    event.preventDefault();
    if (address.trim().length < 8) { setError("Digite um endereço mais completo, incluindo número e cidade."); return; }
    setBusy(true); setError("");
    try {
      const response = await fetch(`/api/geocode?q=${encodeURIComponent(address)}`);
      const body = await response.json() as { suggestions?: Suggestion[]; error?: string };
      if (!response.ok) throw new Error(body.error);
      setSuggestions(body.suggestions ?? []);
      if (!body.suggestions?.length) setError("Nenhum endereço encontrado. Confira o número, a cidade e o estado.");
    } catch { setError("Não foi possível consultar o endereço agora. Tente novamente."); }
    finally { setBusy(false); }
  }
  function save() {
    const stopNumber = Number.parseInt(marketplaceStopNumber, 10);
    if (!Number.isInteger(stopNumber) || stopNumber <= 0) { setError("Informe o número da parada do Mercado Livre."); return; }
    if (!selected) { setError("Localize e selecione um endereço válido antes de salvar."); return; }
    onSave({ ...pack, marketplaceStopNumber: stopNumber, recipient: recipient.trim() || undefined, vehiclePosition: vehiclePosition.trim() || undefined, address: selected.label, latitude: selected.latitude, longitude: selected.longitude, status: "ready" });
  }

  return <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Endereço da encomenda"><section className="address-modal">
    <header><div><small>PACOTE {pack.trackingCode}</small><h2>Confirmar endereço</h2></div><div className="modal-header-actions"><button type="button" className="delete-top" onClick={() => setConfirmDelete(true)}>Excluir</button><button type="button" onClick={onClose} aria-label="Fechar">×</button></div></header>
    <form onSubmit={search}><label>Endereço completo<div className="address-search"><input value={address} onChange={(event) => changeAddress(event.target.value)} placeholder="Rua, número, bairro, cidade e estado"/><button disabled={busy}>{busy ? "Buscando..." : "Localizar"}</button></div></label></form>
    {suggestions.length > 0 && <div className="suggestions"><small>SELECIONE O ENDEREÇO CORRETO</small>{suggestions.map((item) => <button type="button" key={`${item.latitude}-${item.longitude}`} className={selected?.latitude === item.latitude && selected.longitude === item.longitude ? "selected" : ""} onClick={() => { setSelected(item); setAddress(item.label); }}><span>⌖</span><div><b>{item.label}</b><small>{item.provider === "google" ? "Validado pelo Google" : "Validado pelo OpenStreetMap"}</small></div></button>)}</div>}
    <div className="address-extra"><label>Parada Mercado Livre <span>obrigatório</span><input type="number" inputMode="numeric" min="1" value={marketplaceStopNumber} onChange={(event) => setMarketplaceStopNumber(event.target.value)} placeholder="Ex.: 10"/></label><label>Destinatário <span>opcional</span><input value={recipient} onChange={(event) => setRecipient(event.target.value)} placeholder="Nome de quem vai receber"/></label><label>Posição no veículo <span>opcional</span><input value={vehiclePosition} onChange={(event) => setVehiclePosition(event.target.value)} placeholder="Ex.: Caixa A, porta-malas esquerdo"/></label></div>
    {error && <p className="form-error">⚠ {error}</p>}
    {confirmDelete ? <div className="delete-confirm"><div><b>Excluir este pacote?</b><small>Essa ação remove o pacote da rota.</small></div><button type="button" onClick={() => setConfirmDelete(false)}>Não, voltar</button><button type="button" className="confirm" onClick={onDelete}>Sim, excluir</button></div> : <footer><button type="button" className="danger" onClick={() => setConfirmDelete(true)}>Excluir pacote</button><span/><button type="button" onClick={onClose}>Cancelar</button><button type="button" className="primary" onClick={save}>Salvar endereço</button></footer>}
  </section></div>;
}
