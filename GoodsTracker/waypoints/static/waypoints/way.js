var map, marker, waypointByID = {};
var currentObject;
var map;
var geocoder;

$(document).ready(function () {
    
    function searchWaypoints() {
        geocoder.geocode({
            'address': $('#address').val()
        }, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                var position = results[0].geometry.location;
                $.get("{% url 'waypoints:waypoints-search' %}", {
                    lat: position.lat(),
                    lng: position.lng()
                }, function (data) {
                    if (data.isOk) {
                        $('#waypoints').html(data.content);
                        waypointByID = data.waypointByID;
                        activateWaypoints();
                    } else {
                        alert(data.message);
                    }
                }, 'json');
            } else {
                alert('Could not find geocoordinates for the following reason: ' + status);
            }
        });
    }
    $('#searchWaypoints').click(searchWaypoints);
    $('#address').keydown(function(e) {
        if (e.keyCode == 13) searchWaypoints();
    });

    function activateWaypoints() {
        // Add waypoint click handler
        $('.waypoint').each(function () {
            $(this).click(function() {
                var waypoint = waypointByID[this.id];
                var center = new google.maps.LatLng(waypoint.lat, waypoint.lng);
                currentObject = $(this);
                if (marker) marker.setMap();
                marker = new google.maps.Marker({map: map, position: center, draggable: true});
                google.maps.event.addListener(marker, 'dragend', function() {
                    var position = marker.getPosition();
                    waypoint.lat = position.lat();
                    waypoint.lng = position.lng();
                    currentObject.html(waypoint.name +
                        ' (' + waypoint.lat +
                        ', ' + waypoint.lng + ')');
                    $('#saveWaypoints').removeAttr('disabled');
                });
                map.panTo(center);
            }).hover(
                function () {this.className = this.className.replace('OFF', 'ON');},
                function () {this.className = this.className.replace('ON', 'OFF');}
            );
        });
    }
    $('#saveWaypoints').click(function () {
        var waypointStrings = [];
        for (id in waypointByID) {
            waypoint = waypointByID[id];
            waypointStrings.push(id + ' ' + waypoint.lng + ' ' + waypoint.lat);
        };
        $.post("{% url 'waypoints:waypoints-save' %}",
        {
            waypointsPayload: waypointStrings.join('\n')
        }, function (data) {
            if (data.isOk) {
                $('#saveWaypoints').attr('disabled', 'disabled');
            } else {
                alert(data.message);
            }
        }, 'json');
    });
    activateWaypoints();
});

/*
function initialize() {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 5,
        center: new google.maps.LatLng(41.879535, -87.624333),
        mapTypeId: google.maps.MapTypeId.ROADMAP
    });
    geocoder = new google.maps.Geocoder();
}*/

function initMap() {
    var map = new google.maps.Map(document.getElementById('map'), {
      //center: {lat: -34.397, lng: 150.644},
      center: new google.maps.LatLng(41.879535, -87.624333),
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      zoom: 6
    });

    geocoder = new google.maps.Geocoder();
/*
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
*/
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
infoWindow.setPosition(pos);
infoWindow.setContent(browserHasGeolocation ?
                        'Error: The Geolocation service failed.' :
                        'Error: Your browser doesn\'t support geolocation.');

}