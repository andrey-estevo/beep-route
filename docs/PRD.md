# PRD — Beep Route

## Objetivo

PWA para criar, preparar, otimizar e executar rotas de entregas. O motorista deve identificar rapidamente onde ir, quantos e quais pacotes retirar e a próxima ação.

## MVP

O fluxo prioritário é: entrar → criar rota → bipar/adicionar pacotes → informar endereços → agrupar paradas → otimizar → iniciar → navegar → entregar/falhar/pular → reotimizar → concluir → consultar histórico.

## Regras essenciais

- Uma rota em andamento por usuário.
- Código de rastreio não se repete na mesma rota.
- Pacote e parada são conceitos distintos; uma parada pode conter vários pacotes.
- Rota não pode ser otimizada com endereço/localização pendente.
- Reotimização considera apenas paradas pendentes/puladas.
- Ações offline têm efeito imediato local e entram em fila idempotente de sincronização.
- Sem credenciais, o modo demo oferece o fluxo completo com dados fictícios e otimizador local.

## UX

Interface mobile-first, botões grandes, alto contraste, navegação inferior e área de ação respeitando safe areas. No modo entrega, mostrar apenas progresso, endereço, pacotes, navegação e resultado.

## Aceite

O fluxo demo ponta a ponta deve funcionar; duplicados devem ser rejeitados; agrupamento e otimizador não podem perder paradas; atualização da página não pode apagar a rota; e o build deve passar sem credenciais.
