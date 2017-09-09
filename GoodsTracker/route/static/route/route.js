var map;
var socket;
var directionsService;
var directionsDisplay;
var geocoder;

const STATUS_GUI = {
    INIT:0,
    INIT_MAP_OK:1,
    EMPTY_ROUTE:2,
    NEW_FENCE:3,
    ADD_POINTS:4,
    CONFIRM_FENCE:5,
    START_POINT_OK:6,
    END_POINT_OK:7,
};

var statusGUI = STATUS_GUI.INIT; 

$(document).ready(function () {

    var ws_scheme = window.location.protocol == "https:" ? "wss" : "ws";
    var ws_path = ws_scheme + '://' + window.location.host + "/tracker/stream/";
    console.log("Conecatando em " + ws_path);
    socket = new ReconnectingWebSocket(ws_path);
 
    socket.onopen = function () {

        console.log("Conectado no WebSocket: " + ws_path);
    };
        
    socket.onclose = function () {

        console.log("Desconectado do websocket: " + ws_path);
    };

    // Hook para processa menssagem recebidoas pelo server
    socket.onmessage = function (message) {
        
        $('#log').append('<p class="list-group-item">' + message.data + '</p>');

        console.log("Got websocket message " + message.data);
    
        // Decode the JSON
        var data = JSON.parse(message.data);
    
        // Handle errors
        if (data.error) {

            alert(data.error);
            return;
        }
        
        if (data.telemetry) {

            console.log("Chegou o blaster mega power");
            
            handle_tlm(data);

        } else if (data.pong) {

            handle_pingpong(data);
    
        } else {

            console.log("Ops !!! Não foi possivel manusear a mensagem recebida !");
        }
    };
        

    document.getElementById('submit').addEventListener('click', function() {
 
        calculateAndDisplayRoute(directionsService, directionsDisplay);
    });

    // Intervalo de requisição periodico ( a cada 2s) dos dados de telemetria
    window.setInterval(function() {
    
        console.log("Comando de requisição da telemetria enviado!");
        
        socket.send(JSON.stringify({
        
            "command":"update_tlm", 
        }));
    
    }, 2000);

    statusGUI = STATUS_GUI.EMPTY_ROUTE;
});

// Função de retorno para o teste de latencia
// Essa funcao sera invocada quando o server enviar o pong como command. 
// O delta de tempo e computado e o resultado registrado em uma lista 
// para o calculo da media dos 10 ultimos valores
function handle_pingpong(data) {
    
    var latency = (new Date()).getTime() - start_time;
    ping_pong_times.push(latency);
    ping_pong_times = ping_pong_times.slice(-30); // keep last 30 samples
    var sum = 0;
    for (var i = 0; i < ping_pong_times.length; i++)
        sum += ping_pong_times[i];
    $('#ping-pong').text(Math.round(10 * sum / ping_pong_times.length) / 10);
}
        
// Evento pra tratar o envio das informações de telemetria enviada pelo servidor.
// Sera invocada sempre que o servidor enviar dados
function handle_tlm(data) {

    var pos = {
        lat: data.telemetry.lat,
        lng: data.telemetry.lng,
    };

    var marker = new google.maps.Marker({
        
            position:   pos,
            map:        map,
            title:      '',
    });
}

// Inicializa a entidade map (Google)
function initMap() {

    //Seviços de direncionamento
    directionsService       = new google.maps.DirectionsService();
    
    // Renderização ddos objetos visuais relacionado a direção
    directionsDisplay       = new google.maps.DirectionsRenderer();

    //Geolocalização
    geocoder                = new google.maps.Geocoder();
    
    //Coordenada SENAi Anchieta
    const SENAI_ANCHIETA    = new google.maps.LatLng(-23.591387, -46.645126);

    //Entidade mapa
    map = new google.maps.Map(document.getElementById('map'), {
        center: SENAI_ANCHIETA,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        zoom: 15
    });
    
    //Configura saídas da direção
    directionsDisplay.setMap(map);
    directionsDisplay.setPanel(document.getElementById('directions-panel'));

    // Tenta localizar a geolocalização do navagador.
    if (navigator.geolocation) {

        navigator.geolocation.getCurrentPosition(function(position) {
        
            var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            /*var infoWindow  = new google.maps.InfoWindow({map: map});

            infoWindow.setPosition(pos);
            infoWindow.setContent('Location found.');*/

            map.setCenter(pos);

        }, function() {
            handleLocationError(true, map.getCenter());
        });
    } else {
        // Browser não suporta geolocalização
        handleLocationError(false,  map.getCenter());
    }

    var marker = new google.maps.Marker({
    
        position:   SENAI_ANCHIETA,
        map:        map,
        title:      ''
    });

    // Evento de alteração do centro
    map.addListener('center_changed', function() {

//        window.setTimeout(function() {
//          map.panTo(marker.getPosition());
//        }, 2000);
    });


    //Evento onClick no mapa 
    google.maps.event.addListener(map, 'click', function(event) {

        registerRoute(event.latLng);
    });

    // Indica que foi inicializado
    statusGUI = STATUS_GUI.INIT_MAP_OK;
}

/*
 * Calcula e mostra a rota
 */
function calculateAndDisplayRoute(directionsService, directionsDisplay) {

    directionsService.route({
        origin: start_position,
        destination: end_position,
        optimizeWaypoints: false,
        travelMode: 'DRIVING'
    }, function(response, status) {

        if (status === 'OK') {

            directionsDisplay.setDirections(response);
            var route = response.routes[0];
            //var summaryPanel = document.getElementById('summary-directions');
            //summaryPanel.innerHTML = '';
            
            // Resumo de informações para cada rota.
            for (var i = 0; i < route.legs.length; i++) {
                var routeSegment = i + 1;
//                summaryPanel.innerHTML += '<b>Rota: ' + routeSegment +'</b><br>';
//                summaryPanel.innerHTML += 'Inicial(lat):' + route.legs[i].start_location.lat() + '<br>';
//                summaryPanel.innerHTML += 'Inicial(lng):' + route.legs[i].start_location.lng() + '<br>';
//                summaryPanel.innerHTML += 'Final(lat):'   + route.legs[i].end_location.lat() + '<br>' ;
//                summaryPanel.innerHTML += 'Final(lat):'   + route.legs[i].end_location.lng() + '<br>';
  
                $('#lat_inicial').text(parseFloat(route.legs[i].start_location.lat().toFixed(5)));
                $('#lng_inicial').text(parseFloat(route.legs[i].start_location.lng().toFixed(5)));
                $('#lat_final').text(parseFloat(route.legs[i].end_location.lat().toFixed(5)));
                $('#lng_final').text(parseFloat(route.legs[i].end_location.lng().toFixed(5)));                
 

                socket.send(JSON.stringify({
                    
                    "command":"route",
                    "route": route,
                }));
            }
        } else {
            window.alert('Falha no pedido das direções: ' + status);
        }
    });
}

// Usada para definir os pontos de origeme e destino da rota
function registerRoute(latlng){


    if(statusGUI==STATUS_GUI.EMPTY_ROUTE){

        createMarker("Origem",latlng);

        setStartPosition(latlng);

    }else if(statusGUI==STATUS_GUI.START_POINT_OK){

        createMarker("Destino",latlng);
        
        setEndPosition(latlng);
    }
}

function createMarker(title,latlng){

    var image = 'https://cdn2.iconfinder.com/data/icons/snipicons/500/map-marker-32.png';
    
    var content = 
        '<div id="container_infoWindow">'+
            '<h1 id="title_infoWindow" class="firstHeading">'+title+'</h1>'+
            '<div id="body_infoWindow'+title + '">'+
                '<p>Latitude:  ' + latlng.lat() + '</p>'+
                '<p>Longitude: ' + latlng.lng() + '</p>'+
            '</div>'+
        '</div>';

    var infowindow = new google.maps.InfoWindow({
        content: content
    });

    //Evento para fechar automaticamente o infowindow
    google.maps.event.addListener(infowindow, 'domready', function(){

        window.setTimeout(function() {
            infowindow.close();
        }, 5000);
    });

    var marker = new google.maps.Marker({

        position: latlng, 
        map: map,
        icon: image,
        title: title,
        draggable: true,
    });

    marker.addListener('click', function() {
        
        map.setCenter(marker.getPosition());
    
        infowindow.open(map, marker);
        
    });

    geocodeLatLng(marker,infowindow);
}

// Define o ponto de origem da rota e atualiza o painel
function setStartPosition(position){

    start_position = position;

    $('#start_lat').val(position.lat());
    $('#start_lng').val(position.lng());

    statusGUI = STATUS_GUI.START_POINT_OK;
}

// Define o ponto de destino da rota e atualiza o painel
function setEndPosition(position){

    end_position =position;

    $('#end_lat').val(position.lat());
    $('#end_lng').val(position.lng());
    
    statusGUI = STATUS_GUI.END_POINT_OK;
}

// Chamada quando algum erro acorreu durante a localização do navegador
function handleLocationError(browserHasGeolocation, pos) {

/*    var infoWindow  = new google.maps.InfoWindow({map: map});
    
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
                                'Ops! Não foi possivel obter a localização do navegador.' :
                                'Error: Your browser doesn\'t support geolocation.');
*/
}

// Executa a geolocalização inversa e atualiza o painel de informações
function geocodeLatLng(marker,info) {
    
    geocoder.geocode({'location': marker.position}, function(results, status) {

        if (status === 'OK') {

            if (results[1]) {

                var address = results[1].formatted_address;

                info.open(map, marker);
                 
                $('#body_infoWindow'+marker.getTitle()).append('<p>Endereço: ' + address + '</p>');

                //$(info).val(address);

            } else {

                window.alert('Não encontrado resultado para pesquisa');
            }
            
        } else {
            window.alert('Falha no Geocoder: ' + status);
        }
    });
}