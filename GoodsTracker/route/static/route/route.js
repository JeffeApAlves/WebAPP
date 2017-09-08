var start_marker,end_marker;
var directionsService, directionsDisplay;
var geocoder;
var infowindow;

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
    var socket = new ReconnectingWebSocket(ws_path);
 
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

    statusGUI = STATUS_GUI.EMPTY_ROUTE;
});

// Funcao de retorno para o teste de latencia
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
        
// Evento pra tratar o envio de dados feito pelo servidor.
// A callback sera invocada sempre que o server enviar dados para o client
// Os dados serao mostrados na sessao Recepcao
function handle_tlm(data) {
    
    count++;

    tlm = data.telemetry;

    $('#temperatura').text(tlm.temperature);
    $('#humidade').text(tlm.humidity);
    $('#cpu').text(tlm.cpu);
    $('#memoria').text(tlm.memory);
    $('#disco').text(tlm.disk);
    $('#pressao').text(tlm.pressure);
    $('#header_text').text('Telemetria RB3 # ' + count);
}
       

function initMap() {

    directionsService       = new google.maps.DirectionsService();
    directionsDisplay       = new google.maps.DirectionsRenderer();
    const SENAI_ANCHIETA    = new google.maps.LatLng(-23.591387, -46.645126);

    var map = new google.maps.Map(document.getElementById('map'), {
        center: SENAI_ANCHIETA,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        zoom: 15
    });

    directionsDisplay.setMap(map);

    geocoder    = new google.maps.Geocoder();
    infoWindow  = new google.maps.InfoWindow({map: map});

    // Try HTML5 geolocation.
    if (navigator.geolocation) {

        navigator.geolocation.getCurrentPosition(function(position) {
        
            var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            infoWindow.setPosition(pos);
            infoWindow.setContent('Location found.');
            map.setCenter(pos);

        }, function() {
            handleLocationError(true, infoWindow, map.getCenter());
        });
    } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, infoWindow, map.getCenter());
    }

    var marker = new google.maps.Marker({
    
        position:   SENAI_ANCHIETA,
        map:        map,
        title:      ''
    });

    map.addListener('center_changed', function() {

//        window.setTimeout(function() {
//          map.panTo(marker.getPosition());
//        }, 2000);
    });

    google.maps.event.addListener(map, 'click', function(event) {

        var image = 'https://cdn2.iconfinder.com/data/icons/snipicons/500/map-marker-32.png';

        var marker = new google.maps.Marker({

            position: event.latLng, 
            map: map,
            icon: image,
            draggable: true,
        });

        marker.addListener('click', function() {
            
            map.setCenter(marker.getPosition());
        });
    
        registerRoute(marker);
    });

    statusGUI = STATUS_GUI.INIT_MAP_OK;
}

function calculateAndDisplayRoute(directionsService, directionsDisplay) {


    directionsService.route({
        origin: start_marker.getPosition(),
        destination: end_marker.getPosition(),
        optimizeWaypoints: true,
        travelMode: 'DRIVING'
    }, function(response, status) {

        if (status === 'OK') {
            directionsDisplay.setDirections(response);
            var route = response.routes[0];
            var summaryPanel = document.getElementById('directions-panel');
            summaryPanel.innerHTML = '';
            // For each route, display summary information.
            for (var i = 0; i < route.legs.length; i++) {
                var routeSegment = i + 1;
                summaryPanel.innerHTML += '<b>Route Segment: ' + routeSegment +
                    '</b><br>';
                summaryPanel.innerHTML += route.legs[i].start_address + ' to ';
                summaryPanel.innerHTML += route.legs[i].end_address + '<br>';
                summaryPanel.innerHTML += route.legs[i].distance.text + '<br><br>';
            }
        } else {
            window.alert('Directions request failed due to ' + status);
        }
    });
}

function registerRoute(marker){

    if(statusGUI==STATUS_GUI.EMPTY_ROUTE){

        setStartPosition(marker);

    }else if(statusGUI==STATUS_GUI.START_POINT_OK){
    
        setEndPosition(marker);
    }
}

function setStartPosition(marker){

    start_marker = marker;

    $('#start_lat').val(start_marker.position.lat());
    $('#start_lng').val(start_marker.position.lng());
    geocodeLatLng(start_marker.position,'#start_address');

    statusGUI = STATUS_GUI.START_POINT_OK;
}

function setEndPosition(marker){

    end_marker = marker;

    $('#end_lat').val(end_marker.position.lat());
    $('#end_lng').val(end_marker.position.lng());
    geocodeLatLng(end_marker.position,'#end_address');
    
    statusGUI = STATUS_GUI.END_POINT_OK;
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
                                'Ops! Não foi possivel obter a localização do navegador.' :
                                'Error: Your browser doesn\'t support geolocation.');

}

function geocodeLatLng(position,info) {
    
    geocoder.geocode({'location': position}, function(results, status) {

        if (status === 'OK') {

            if (results[1]) {

                address = results[1].formatted_address;

                $(info).val(address);

            } else {
                window.alert('No results found');
            }
            
        } else {
            window.alert('Geocoder failed due to: ' + status);
        }
    });
}