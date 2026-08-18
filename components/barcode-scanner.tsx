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
  const [mode, setMode] = useState<"barcode" | "qr">("barcode");
  const [rawResult, setRawResult] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    async function start() {
      try {
        const { BrowserMultiFormatOneDReader, BrowserQRCodeReader } = await import("@zxing/browser");
        const Reader = mode === "barcode" ? BrowserMultiFormatOneDReader : BrowserQRCodeReader;
        const reader = new Reader(undefined, { delayBetweenScanAttempts: 100, delayBetweenScanSuccess: 900 });
        const controls = await reader.decodeFromConstraints({ audio: false, video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 } } }, videoRef.current ?? undefined, (result) => {
          if (!result || handledRef.current || !active) return;
          const raw = result.getText(); handledRef.current = true; navigator.vibrate?.([80, 40, 80]); controlsRef.current?.stop();
          if (mode === "qr") setRawResult(raw); else onResult(raw);
        });
        if (!active) { controls.stop(); return; }
        controlsRef.current = controls; setTorchAvailable(Boolean(controls.switchTorch));
      } catch (cause) {
        if (!active) return;
        const denied = cause instanceof DOMException && (cause.name === "NotAllowedError" || cause.name === "PermissionDeniedError");
        setError(denied ? "A câmera está bloqueada. Libere o acesso nas configurações do navegador." : "Não foi possível iniciar a câmera. Você ainda pode adicionar o código manualmente.");
      }
    }
    if (!rawResult) void start();
    return () => { active = false; controlsRef.current?.stop(); };
  }, [mode, onResult, rawResult]);

  async function toggleTorch() { const next = !torch; try { await controlsRef.current?.switchTorch?.(next); setTorch(next); } catch { setTorchAvailable(false); } }
  function changeMode(next: "barcode" | "qr") { if (next === mode) return; handledRef.current = false; setRawResult(""); setCopied(false); setError(""); controlsRef.current?.stop(); setMode(next); }
  function scanAgain() { handledRef.current = false; setRawResult(""); setCopied(false); }
  async function copyRaw() { try { await navigator.clipboard.writeText(rawResult); setCopied(true); } catch { setCopied(false); } }

  return <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Leitor de código"><section className="scanner-modal">
    <header><div><small>CÂMERA TRASEIRA</small><h2>Bipar encomenda</h2></div><button onClick={onClose} aria-label="Fechar scanner">×</button></header>
    <div className="scanner-modes"><button className={mode === "barcode" ? "active" : ""} onClick={() => changeMode("barcode")}>Código de barras</button><button className={mode === "qr" ? "active" : ""} onClick={() => changeMode("qr")}>Inspecionar QR</button></div>
    {rawResult ? <div className="qr-inspector"><span>✓ QR LIDO COM SUCESSO</span><h3>Conteúdo completo do QR</h3><textarea readOnly value={rawResult}/><p>Nada foi cortado. Copie ou tire um print desta tela para conferir os dados.</p><div><button onClick={scanAgain}>Ler novamente</button><button onClick={() => void copyRaw()}>{copied ? "Copiado!" : "Copiar conteúdo"}</button><button className="use-result" onClick={() => onResult(rawResult)}>Adicionar pacote</button></div></div> : <><div className={`camera-stage ${mode === "barcode" ? "barcode-mode" : ""}`}><video ref={videoRef} muted playsInline/><div className="scan-shade"/><div className="scan-frame"><i/></div>{error && <div className="camera-error"><span>⌁</span><b>A câmera não está disponível</b><p>{error}</p></div>}</div><p className="scanner-help">{mode === "barcode" ? "Centralize somente as barras dentro da faixa. O QR será ignorado." : "Leia o QR para ver primeiro tudo o que está gravado nele."}</p></>}
    {!rawResult && <footer>{torchAvailable && <button className={torch ? "torch active" : "torch"} onClick={() => void toggleTorch()}>☀ {torch ? "Desligar lanterna" : "Ligar lanterna"}</button>}<button className="scanner-close" onClick={onClose}>Adicionar manualmente</button></footer>}
  </section></div>;
}
