# Beep Route — regras permanentes

- Produto mobile-first em português do Brasil, com foco em uso rápido por motoristas.
- TypeScript estrito; regras de domínio ficam fora dos componentes visuais.
- Dados de produção pertencem ao usuário autenticado e devem respeitar RLS no Supabase.
- Modo demo deve funcionar sem credenciais externas e nunca utilizar códigos reais.
- APIs sensíveis (Google Maps/Supabase service role) são chamadas somente no servidor.
- A rota ativa e as mutações pendentes devem sobreviver a recarregamento e falta de conexão.
- Pacotes são únicos por `(route_id, tracking_code)`; vários pacotes no mesmo endereço formam uma parada.
- Timestamps persistidos em UTC e apresentados em `America/Sao_Paulo`.
- Não criar integrações fictícias, scraping ou acesso a APIs privadas de marketplaces.
- Toda alteração deve manter lint, typecheck, testes e build aprovados.
