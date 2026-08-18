"use client";

import { useEffect, useRef, useState } from "react";
import type { IScannerControls } from "@zxing/browser";

export function BarcodeScanner({ onResult, onClose }: { onResult: (value: string) => void; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const handledRef = useRef(false);
  const [error, setError] = useState("");
  const [torch, setTorch] = useState(false);
  const [torchAvailable, setTorchAvailable] = useState(false);
  const [mode, setMode] = useState<"barcode" | "all">("barcode");

  useEffect(() => {
    let active = true;
    async function start() {
      try {
        const { BrowserMultiFormatOneDReader, BrowserMultiFormatReader } = await import("@zxing/browser");
        const Reader = mode === "barcode" ? BrowserMultiFormatOneDReader : BrowserMultiFormatReader;
        const reader = new Reader(undefined, { delayBetweenScanAttempts: 100, delayBetweenScanSuccess: 900 });
        const controls = await reader.decodeFromConstraints({ audio: false, video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 } } }, videoRef.current ?? undefined, (result) => {
          if (!result || handledRef.current || !active) return;
          handledRef.current = true;
          navigator.vibrate?.([80, 40, 80]);
          controlsRef.current?.stop();
          onResult(result.getText());
        });
        if (!active) { controls.stop(); return; }
        controlsRef.current = controls;
        setTorchAvailable(Boolean(controls.switchTorch));
      } catch (cause) {
        if (!active) return;
        const denied = cause instanceof DOMException && (cause.name === "NotAllowedError" || cause.name === "PermissionDeniedError");
        setError(denied ? "A câmera está bloqueada. Libere o acesso nas configurações do navegador." : "Não foi possível iniciar a câmera. Você ainda pode adicionar o código manualmente.");
      }
    }
    void start();
    return () => { active = false; controlsRef.current?.stop(); };
  }, [mode, onResult]);

  async function toggleTorch() { const next = !torch; try { await controlsRef.current?.switchTorch?.(next); setTorch(next); } catch { setTorchAvailable(false); } }
  function changeMode(next: "barcode" | "all") { if (next === mode) return; handledRef.current = false; setError(""); controlsRef.current?.stop(); setMode(next); }
  return <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Leitor de código de barras"><section className="scanner-modal"><header><div><small>CÂMERA TRASEIRA</small><h2>Bipar encomenda</h2></div><button onClick={onClose} aria-label="Fechar scanner">×</button></header><div className="scanner-modes"><button className={mode === "barcode" ? "active" : ""} onClick={() => changeMode("barcode")}>Código de barras</button><button className={mode === "all" ? "active" : ""} onClick={() => changeMode("all")}>QR Code</button></div><div className={`camera-stage ${mode === "barcode" ? "barcode-mode" : ""}`}><video ref={videoRef} muted playsInline/><div className="scan-shade"/><div className="scan-frame"><i/></div>{error && <div className="camera-error"><span>⌁</span><b>A câmera não está disponível</b><p>{error}</p></div>}</div><p className="scanner-help">{mode === "barcode" ? "Centralize somente as barras dentro da faixa. O QR será ignorado." : "Centralize o QR Code dentro do quadro. A leitura é automática."}</p><footer>{torchAvailable && <button className={torch ? "torch active" : "torch"} onClick={() => void toggleTorch()}>☀ {torch ? "Desligar lanterna" : "Ligar lanterna"}</button>}<button className="scanner-close" onClick={onClose}>Adicionar manualmente</button></footer></section></div>;
}
