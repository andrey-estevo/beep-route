# Banco de dados

PostgreSQL/Supabase com UUIDs, timestamps UTC, enums consistentes, chaves estrangeiras e RLS. As entidades centrais são `profiles`, `routes`, `route_stops`, `packages`, `saved_locations` e `route_events`.

`packages(route_id, tracking_code)` é único. `stop_id` permite agrupar diversos pacotes. Uma restrição parcial impede mais de uma rota `in_progress` por usuário. Exclusão em cascata é aceita para rascunhos; rotas concluídas devem ser arquivadas na aplicação.

Consulte `supabase/migrations` para a definição executável e policies.
