# Beep Route

PWA mobile-first para organizar pacotes, otimizar paradas e executar rotas de entrega. Inclui modo demo que roda sem credenciais.

## Requisitos e instalação

Node.js 22.13+ e npm.

```powershell
Copy-Item .env.example .env.local
npm install
npm run dev
```

No dashboard, crie uma rota, adicione etiquetas demo, prepare a rota e execute as entregas.

## Variáveis de ambiente

Consulte `.env.example`. Chaves com `NEXT_PUBLIC_` podem chegar ao navegador. `SUPABASE_SERVICE_ROLE_KEY` e `GOOGLE_MAPS_SERVER_API_KEY` são exclusivamente de servidor.

## Supabase

1. Crie um projeto.
2. Execute `supabase/migrations/202608180001_initial_schema.sql` no SQL Editor.
3. Copie URL e chave pública para `.env.local`.
4. Habilite autenticação por email/senha e configure URLs de redirecionamento.

O schema possui RLS, propriedade por usuário, índices, enums, restrição de pacote duplicado e uma única rota ativa.

## Google Maps

Crie chaves separadas no Google Cloud. Restrinja a chave do navegador por domínio; mantenha geocodificação e rotas no servidor. Sem chaves, o app usa o otimizador local aproximado.

## Testes e build

```powershell
npm run lint
npm run typecheck
npm test
npm run build
```

## PWA, arquitetura e segurança

Manifest e service worker permitem instalação e cache do shell. A rota ativa é guardada no IndexedDB. Consulte `docs/ARCHITECTURE.md`, `docs/DATABASE.md`, `docs/ROUTING.md` e `docs/COSTS.md`.

## Publicação

O projeto usa Sites/Vinext e pode ser publicado pelo Codex Sites. A configuração de produção deve receber as variáveis no painel do ambiente, nunca no repositório.

## Limitações atuais

Esta entrega prioriza o fluxo funcional demo local. Scanner por câmera, autenticação Supabase ativa, autocomplete/rotas Google, importação CSV e sincronização remota estão modelados/documentados, mas ainda não conectados à interface demo.
