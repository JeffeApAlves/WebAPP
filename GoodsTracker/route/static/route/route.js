var start_marker,end_marker;
var directionsService, directionsDisplay;

const STATUS_GUI = {
    INIT:0,
    INIT_MAP_OK:1,
    EMPTY_ROUTE:2,
    NEW_FENCE:3,
    ADD_POINTS:4,
    CONFIRM_FENCE:5,
    START_POINT_OK:6,
    END_POINT_OK:7,
}

var statusGUI = STATUS_GUI.INIT; 

$(document).ready(function () {

    document.getElementById('submit').addEventListener('click', function() {
 
        console.log("Periquita do bigode loiro")
        calculateAndDisplayRoute(directionsService, directionsDisplay);
    
    });

     statusGUI = STATUS_GUI.EMPTY_ROUTE;
});

function initMap() {

    directionsService = new google.maps.DirectionsService;
    directionsDisplay = new google.maps.DirectionsRenderer;

    const SENAI_ANCHIETA = new google.maps.LatLng(-23.591387, -46.645126);

    var map = new google.maps.Map(document.getElementById('map'), {
        center: SENAI_ANCHIETA,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        zoom: 15
    });

    directionsDisplay.setMap(map);

    var geocoder = new google.maps.Geocoder();
    var infoWindow = new google.maps.InfoWindow({map: map});

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
    
        position: SENAI_ANCHIETA,
        map: map,
        title: 'Click to zoom'
    });

    map.addListener('center_changed', function() {

//        window.setTimeout(function() {
//          map.panTo(marker.getPosition());
//        }, 2000);
    });

    marker.addListener('click', function() {
        
        map.setZoom(8);
        map.setCenter(marker.getPosition());
    });

    google.maps.event.addListener(map, 'click', function(event) {

        var image = 'https://cdn2.iconfinder.com/data/icons/snipicons/500/map-marker-32.png';

        var marker = new google.maps.Marker({

            position: event.latLng, 
            map: map,
            icon: image,
            draggable: true,
        });

        registerRoute(marker)
    });

    statusGUI = STATUS_GUI.INIT_MAP_OK;
}

function calculateAndDisplayRoute(directionsService, directionsDisplay) {

    var waypts = [];
    var checkboxArray = document.getElementById('waypoints');
    for (var i = 0; i < checkboxArray.length; i++) {
        if (checkboxArray.options[i].selected) {
            waypts.push({
                location: checkboxArray[i].value,
                stopover: true
            });
        }
    }

    directionsService.route({
        origin: start_marker.getPosition(),
        destination: end_marker.getPosition(),
        waypoints: waypts,
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

    console.log(statusGUI)

    
    if(statusGUI==STATUS_GUI.EMPTY_ROUTE){

        setStartPosition(marker);

    }else if(statusGUI==STATUS_GUI.START_POINT_OK){
    
        setEndPosition(marker);
    }
}

function setStartPosition(marker){

    start_marker = marker;

    console.log("Lat" + start_marker.position.lat())
    console.log("Lng" + start_marker.position.lng())
    
    $('#start_lat').val(start_marker.position.lat());
    $('#start_lng').val(start_marker.position.lng());
 
    statusGUI = STATUS_GUI.START_POINT_OK;
}

function setEndPosition(marker){

    end_marker = marker;

    $('#end_lat').val(end_marker.position.lat());
    $('#end_lng').val(end_marker.position.lng());

    statusGUI = STATUS_GUI.END_POINT_OK;
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
                                'Ops! Não foi possivel obter a localização do navegador.' :
                                'Error: Your browser doesn\'t support geolocation.');

}