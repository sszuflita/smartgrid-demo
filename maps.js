/* Function to hide all labels on the map */
function eraseMarkers(markers) {
    for (i = 0; i < markers.length; i++)
        markers[i].labelVisible = false;
}

/* Function to show all labels on the map */
function showMarkers(markers) {
    for (i = 0; i < markers.length; i++)
        markers[i].labelVisible = true;
}

/* Function to load json file at sURL. Return parsed json object
   on success. Pop an alert otherwise. */
function loadJSON(oRequest, sURL) {
    oRequest.open("GET", sURL, false);
    oRequest.send(null)
    
    if (oRequest.status==200)
        return JSON.parse(oRequest.responseText);

    alert("Error executing XMLHttpRequest call!");
}

    
function dxfToGPS(dxfCoord) {
    x0 = -126.899588;
    r = 3.4109652 / 1000000;
    y0 = 29.729046077;
    s = .00000295510204;
    var GPSCoord = new Array();
    GPSCoord[0] = x0 + r * dxfCoord[0];
    GPSCoord[1] = y0 + s * dxfCoord[1];
    return GPSCoord;
}

function update(map, power, lines) {
    console.log("update");
    for (var i = 0; i < power.length; i++) {
        // Look for the corresponding polyline
        for (var j = 0; j < lines.length; j++) {
            if (lines[j].ends.indexOf(power[i]["to"]) > -1 &&
                lines[j].ends.indexOf(power[i]["from"]) > -1) {
                // Change color to red if the power is above limit
                if (power[i]["amps"] > 900)
                    lines[j].polyline.setOptions({strokeColor: 'red'});
                else
                    lines[j].polyline.setOptions(
                        {strokeColor: lines[j].defaultColor});
                break;
            }
        }
    }
}


function initialize() {
    var mapOptions = {
        center: new google.maps.LatLng(34.116552,-117.631469),
        zoom: 15
    };
    var map = new google.maps.Map(document.getElementById("map-canvas"),
                  mapOptions);

    var oRequest = new XMLHttpRequest();
    sURL = "http://"
        + self.location.hostname
        + "/smartgrid-demo/new.json";
    data = loadJSON(oRequest, sURL);
    features = data.features;

    var sURL = "http://"
        + self.location.hostname
        + "/smartgrid-demo/preprocess/power_limit/power1.json";
    power = loadJSON(oRequest, sURL).contents;

    // Render DXF
    var markers = new Array(); // Array that stores all labels
    var lines = new Array();
    for (var i = 0; i < features.length; i++) {
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

        /* Basic layout and labels */
        if (coords != undefined && typeof coords[0] == "number") {
            GPSCoord = dxfToGPS(coords);
            x = GPSCoord[0];
            y = GPSCoord[1];

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
            GPSCoord = dxfToGPS(coords[0]);
            x = GPSCoord[0] + 0.00004;
            y = GPSCoord[1];

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
            // Check for current loads
            entity = feature.properties.ExtendedEntity;
            var endpoints;
            var defaultColor = strokeColor;
            for (var j = 0; j < power.length; j++) {
                if (entity.indexOf(power[j]["to"]) > -1 &&
                    entity.indexOf(power[j]["from"]) > -1) {
                    endpoints = power[j]["from"] + ',' + power[j]["to"];
                    if (power[j]["amps"] > 900)
                        strokeColor = '#FF0000';
                    break;
                }
            }

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
            
            if (endpoints != undefined) {
                var valueToPush = { }; 
                valueToPush["ends"] = endpoints;
                valueToPush["polyline"] = polyLinePath;
                valueToPush["defaultColor"] = defaultColor;
                lines.push(valueToPush);    
            }
            polyLinePath.setMap(map);
        }
    }  


    numDatasets = 5;
    count = 1;
    //while (true) {
        count = count % numDatasets + 1;
        // Read power info about each line
        var sURL = "http://"
        + "ugcs.caltech.edu/~krong/"
        + "/smartgrid-demo/preprocess/power_limit/power"
        + count.toString() + ".json";
        power = loadJSON(oRequest, sURL).contents;
        //setTimeout(function(){
        //    update(map, power, lines), 5000});
    //}
    

    // Toggle visibility of labels
    google.maps.event.addListener(map,'zoom_changed',function () {
        if (map.getZoom() < 16.5) eraseMarkers(markers);
        if (map.getZoom() >= 16.5) showMarkers(markers);
    });

}
google.maps.event.addDomListener(window, 'load', initialize);


