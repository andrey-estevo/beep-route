# Roteamento

`RouteOptimizer` recebe origem, destino opcional, retorno à origem e paradas geocodificadas.

O provider local cria uma solução por vizinho mais próximo e aplica 2-opt sem alterar o conjunto de paradas. A distância usa Haversine, portanto a interface identifica o resultado como aproximado. Reotimização remove paradas concluídas e usa a localização atual como origem.

O provider Google fica atrás de endpoint de servidor e só é habilitado com chave configurada. Resultados externos são persistidos para evitar novas chamadas. Preferências não suportadas pelo provider ativo não aparecem na interface.
