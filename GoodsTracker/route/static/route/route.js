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
}

var statusGUI = STATUS_GUI.INIT; 

$(document).ready(function () {

    document.getElementById('submit').addEventListener('click', function() {
 
        calculateAndDisplayRoute(directionsService, directionsDisplay);
    });

     statusGUI = STATUS_GUI.EMPTY_ROUTE;
});

function initMap() {

    directionsService       = new google.maps.DirectionsService;
    directionsDisplay       = new google.maps.DirectionsRenderer;
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
    
        registerRoute(marker)
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

    geocodeLatLng(start_marker.position,'#start_address')

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