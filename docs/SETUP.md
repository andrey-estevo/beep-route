# Setup

1. Copie `.env.example` para `.env.local`.
2. Para modo demo, mantenha `NEXT_PUBLIC_DEMO_MODE=true`.
3. Instale dependências com `npm install` e inicie com `npm run dev`.
4. Para Supabase, crie um projeto, aplique as migrations e informe URL e chave pública.
5. Para Google Maps, restrinja a chave pública por domínio e mantenha a chave de rotas/geocodificação do servidor sem prefixo público.
