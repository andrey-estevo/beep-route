"use client";

import { useState, type FormEvent } from "react";
import { getSupabaseBrowserClient } from "../lib/supabase/client";

type Mode = "login" | "signup" | "forgot";
export function AuthScreen() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setMessage("");
    const supabase = getSupabaseBrowserClient();
    const result = mode === "login" ? await supabase.auth.signInWithPassword({ email, password }) : mode === "signup" ? await supabase.auth.signUp({ email, password, options: { emailRedirectTo: location.origin } }) : await supabase.auth.resetPasswordForEmail(email, { redirectTo: location.origin });
    setBusy(false);
    if (result.error) { setMessage(result.error.message === "Invalid login credentials" ? "E-mail ou senha incorretos." : result.error.message); return; }
    if (mode === "signup") setMessage("Conta criada. Confira seu e-mail para confirmar o acesso.");
    if (mode === "forgot") setMessage("Enviamos as instruções de recuperação para seu e-mail.");
  }
  return <main className="auth-shell"><section className="auth-panel"><div className="auth-brand"><span>⌁</span><strong>Beep <em>Route</em></strong></div><div className="auth-copy"><small>ENTREGAS NO CAMINHO CERTO</small><h1>{mode === "login" ? "Bem-vindo de volta" : mode === "signup" ? "Crie sua conta" : "Recupere seu acesso"}</h1><p>{mode === "forgot" ? "Informe seu e-mail para receber o link de recuperação." : "Entre para organizar seus pacotes e continuar suas rotas."}</p></div><form onSubmit={submit}><label>E-mail<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="voce@exemplo.com" required autoComplete="email"/></label>{mode !== "forgot" && <label>Senha<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Mínimo de 6 caracteres" required minLength={6} autoComplete={mode === "login" ? "current-password" : "new-password"}/></label>}{message && <p className="auth-message">{message}</p>}<button className="primary auth-submit" disabled={busy}>{busy ? "Aguarde..." : mode === "login" ? "Entrar" : mode === "signup" ? "Criar conta" : "Enviar recuperação"}</button></form><div className="auth-links">{mode === "login" ? <><button onClick={() => setMode("forgot")}>Esqueci minha senha</button><button onClick={() => setMode("signup")}>Criar uma conta</button></> : <button onClick={() => setMode("login")}>← Voltar para o login</button>}</div></section><aside className="auth-side"><div><span>▣</span><h2>Menos tempo organizando.<br/>Mais entregas concluídas.</h2><p>Seus dados ficam associados à sua conta e protegidos pelas regras do Supabase.</p></div></aside></main>;
}
