

function initialize() {
    var mapOptions = {
        center: new google.maps.LatLng(34.116552,-117.631469),
        zoom: 15
    };
    var map = new google.maps.Map(document.getElementById("map-canvas"),
                  mapOptions);

    var oRequest = new XMLHttpRequest();
    var sURL = "http://"
    + self.location.hostname
    + "/smartgrid-demo/new.json";
    
    oRequest.open("GET",sURL,false);
    oRequest.setRequestHeader("User-Agent",navigator.userAgent);
    oRequest.send(null)
    
    if (oRequest.status==200) {
        data = JSON.parse(oRequest.responseText);
        features = data.features;
        numFeatures = features.length;

        x0 = -126.899588;
        r = 3.4109652 / 1000000;
        y0 = 29.729046077;
        s = .00000295510204;

        var dxfToGPS = function(dxfCoord) {
            var GPSCoord = new Array();
            GPSCoord[0] = x0 + r * dxfCoord[0];
            GPSCoord[1] = y0 + s * dxfCoord[1];
            return GPSCoord;
        }

        var markers = [];

        for (var i = 0; i < numFeatures; i++) {
            feature = features[i];
            var strokeColor, strokeWeight;
            var layer = feature.properties.Layer;
            if (layer == "15452_MAIN") {
                strokeColor = "#00FF00";
                strokeWeight = 2;
            } else {
                strokeColor = "#000000";
                strokeWeight = 1;
            }

            coords = feature.geometry.coordinates;

            if (coords != undefined && typeof coords[0] == "number") {
                a = coords[0];
                b = coords[1];
                x = x0 + r * a;
                y = y0 + s * b;

                if (!isNaN(x) && !isNaN(y)) {
                    // Add a marker with label
                    var text = feature.properties.Text;
                    if (layer == "15452_TAP" || layer == "15452_MAIN") {
                        var myLatlng = new google.maps.LatLng(y, x);
                        var marker = new MarkerWithLabel({
                            position: myLatlng,
                            draggable: false,
                            raiseOnDrag: false,
                            labelVisible: false,
                            map: map,
                            labelContent: text,
                            icon: {}
                        });

                        // Add the new marker to the markers array
                        markers.push(marker);
                    }   
                }
            }
            else if (layer == "UG_TRANSFORMERS") {
                coords = feature.geometry.geometries
                coords = coords[0]["coordinates"];
                a = coords[0][0];
                b = coords[0][1];
                x = x0 + r * a + 0.00004;
                y = y0 + s * b;

                if (!isNaN(x) && !isNaN(y)) {
                    var myLatlng = new google.maps.LatLng(y, x);
                    var opts = {
                          strokeColor: '#000000',
                          strokeOpacity: 0.8,
                          strokeWeight: 2,
                          fillColor: '#000000',
                          fillOpacity: 0.5,
                          map: map,
                          center: myLatlng,
                          radius: 5
                        };
                    // Add the circle to the map.
                    ug_trans = new google.maps.Circle(opts);    
                }  
            }
            else if (coords != undefined) {
                var numPoints = coords.length;
                var polyLine = [];
                for (var j = 0; j < numPoints; j++) {
                    var coord = coords[j];
                    if (coord != undefined) {
                        var GPSCoord = dxfToGPS(coord);
                        var mapsPoint = new google.maps.LatLng(GPSCoord[1], GPSCoord[0]);
                        polyLine.push(mapsPoint);
                    }
                }
                var polyLinePath = new google.maps.Polyline({
                    path: polyLine,
                    geodesic: true,
                    strokeColor: strokeColor,
                    strokeOpacity: 1.0,
                    strokeWeight: strokeWeight
                });

                polyLinePath.setMap(map);
            }
        }

        // Toggle visibility of labels
        google.maps.event.addListener(map,'zoom_changed',function () {
            if (map.getZoom() <= 15) eraseMarkers();
            if (map.getZoom() >= 16) showMarkers();
        });

        function eraseMarkers() {
            for (i = 0; i < markers.length; i++)
                markers[i].labelVisible = false;
        }

        function showMarkers() {
            for (i = 0; i < markers.length; i++)
                markers[i].labelVisible = true;
        }

    } 
    else alert("Error executing XMLHttpRequest call!");
}
google.maps.event.addDomListener(window, 'load', initialize);

