$(document).ready(function () {
  
    // Correctly decide between ws:// and wss://
    var ws_scheme = window.location.protocol == "https:" ? "wss" : "ws";
    var ws_path = ws_scheme + '://' + window.location.host + "/monitor/stream/";
    console.log("Connecting to " + ws_path);
    var socket = new ReconnectingWebSocket(ws_path);
    var count = 0
    
    // Debug
    socket.onopen = function () {

        console.log("Conectado no WebSocket monitor");
    };

    // Debug
    socket.onclose = function () {

        console.log("Desconectado do websocket monitor");
    };

    // Hook para processa menssagem
    socket.onmessage = function (message) {

        $('#log').append('<li class="list-group-item">' + message.data + '</li>');
        
        // Debug
        console.log("Got websocket message " + message.data);
   
        // Decode the JSON
        var data = JSON.parse(message.data);
   
        // Handle errors
        if (data.error) {

            alert(data.error);
            return;
        }
        
        if (data.telemetry) {

            handle_tlm(data)

        } else if (data.pong) {

            handle_pingpong(data)
    
        } else {

            console.log("Cannot handle message!");
        }
    };

    // Evento pra tratar o envio de dados feito pelo servidor.
    // A callback sera invocada sempre que o server enviar dados para o client
    // Os dados serao mostrados na sessao Recepcao
    function handle_tlm(data) {
 
        tlm = data.telemetry

        $('#temperatura').text(tlm.temperature);
        $('#humidade').text(tlm.humidity);
        $('#cpu').text(tlm.cpu);
        $('#memoria').text(tlm.memory);
        $('#disco').text(tlm.disk);
        $('#pressao').text(tlm.pressure);
        $('#tlm_title').text('Dados Telemetria # (' + tlm.count + ' )');
    }

    // Funcao finaliza o teste de latencia
    // A funcao sera invocada quando o server enviar o pong. O cronometro e parado e 
    // o resultado registrado em uma lista para o calculo da media dos ultimos valores
    function handle_pingpong(data) {

        var latency = (new Date).getTime() - start_time;
        ping_pong_times.push(latency);
        ping_pong_times = ping_pong_times.slice(-30); // keep last 30 samples
        var sum = 0;
        for (var i = 0; i < ping_pong_times.length; i++)
            sum += ping_pong_times[i];
        $('#ping-pong').text(Math.round(10 * sum / ping_pong_times.length) / 10);
    }

    // Funcao inicia o teste de latencia enviando o ping e zera o cronometro
    var ping_pong_times = [];
    var start_time;
    window.setInterval(function() {
        start_time = (new Date).getTime();
        socket.send(JSON.stringify({
        
            "command": "ping", 
        
        }));
    }, 1000);

    window.setInterval(function() {

        socket.send(JSON.stringify({
        
            "command":"update_monitor", 
        
        }));

    }, 1000);
});