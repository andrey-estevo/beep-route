# Arquitetura

## Aplicação

Aplicação React/TypeScript estruturada por domínio. A interface consome serviços definidos em `lib`, com providers intercambiáveis para geocodificação, dados de pacote e otimização.

## Camadas

- `app`: páginas e composição visual.
- `components`: componentes reutilizáveis do produto.
- `lib/domain`: entidades, estados e regras puras.
- `lib/routing`: nearest-neighbor, 2-opt e contratos de otimização.
- `lib/maps`: geocodificação, links e provider de mapas.
- `lib/storage`: persistência local, fila offline e adaptador Supabase.
- `supabase/migrations`: schema, integridade e RLS.

## Execução

Com Supabase configurado, autenticação e dados persistentes usam o backend. Sem credenciais, `DemoRepository` usa IndexedDB como armazenamento do dispositivo. Providers externos são selecionados no servidor e degradam explicitamente para o modo aproximado.

## Segurança

O frontend recebe somente chaves públicas permitidas. Chaves de servidor nunca usam prefixo `NEXT_PUBLIC_`. RLS aplica propriedade em todas as entidades e APIs validam entrada com Zod.
