# WebAPP

O objetivo desse projeto é desenvolver uma plataforma web que irá relacionar através de acelerômetros,GPS, a eficiência enérgica  de um veículo com o modo de condução (acelerações e frenagens bruscas) . 

## Embarcado core M0+:
Utilização do FreeRTOS com filas de mensagens para troca de informações entre as tasks e sinalizado através de TaskNotification(). 
A comunicação via UART com o Host é totalmente assíncrona. Após recepção e validação do frame o resultado (cmd ou resposta) é colocado em uma fila e sinalizado para a camada aplicação que fará o processamento em outra task . O resultado também será postado em uma fila para a camada de comunicação fazer o empacotamento e envio. 
Por ser tratar de eventos assíncronos os frames possuem timestamp para controle de sequência. O RTC é ajustado automaticamente através de informações do GPS (Protocolo NMEA)
A comunicação serial Host<>embarcado e Embarcado<>GPS são feitas utilizando RingBuffer.
Como transceptor Wifi\BT\BLE está sendo utilizando o ESP32 com FreeRTOS também. Futuro será colocar um módulo GPRS para redes móveis e processar a pilha de conexão tambem no ESP32.
Apesar do ESP32 ser mais que um transceiver o custo permite utiliza-lo paenas para essa finalidade

## SW Web
Backend: Django  e Redis com utilização de Channel (websocket) para atualizações, em tempo real no Frontend (Bootstrap+JS+CSS+Chart.js).
Message Broker: RabbitMQ com o protocolo AMQP e MQTT
Google maps API


## SW Nativo
No repositório GoodsTracker é possivel encontrar uma versão nativa do SW em linguagem C#.

## Objetivos adicionais
Comparar diferentes tipos de serialização de payload (JSON,BJSON e CBOR) e seus impactos no consumo de banda e latência  
