var map;
var oRequest;
var lines; /* Array of all polylines */
var counter = 0; /* Counter of dataset */
var numDatasets = 5;

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
function loadJSON(sURL) {
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

function update(power) {
    // Update the dataset counter and read a dataset
    counter = counter % numDatasets + 1;
    var sURL = "http://"
    + self.location.hostname
    + "/smartgrid-demo/preprocess/power_limit/power"
    + counter.toString() + ".json";
    power = loadJSON(sURL).contents;
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

function PowerControl(controlDiv) {

  // Set CSS styles for the DIV containing the control
  // Setting padding to 5 px will offset the control
  // from the edge of the map.
  controlDiv.style.padding = '5px';

  // Set CSS for the control border.
  var controlUI = document.createElement('div');
  controlUI.style.backgroundColor = 'white';
  controlUI.style.borderStyle = 'solid';
  controlUI.style.borderWidth = '2px';
  controlUI.style.cursor = 'pointer';
  controlUI.style.textAlign = 'center';
  controlUI.title = 'Click to show time evolution ';
  controlDiv.appendChild(controlUI);

  // Set CSS for the control interior.
  var controlText = document.createElement('div');
  controlText.style.fontFamily = 'Arial,sans-serif';
  controlText.style.fontSize = '12px';
  controlText.style.paddingLeft = '4px';
  controlText.style.paddingRight = '4px';
  controlText.innerHTML = '<strong>Power Limit</strong>';
  controlUI.appendChild(controlText);

  // Setup the click event listeners: 
  // show the power limits from different datasets.
  google.maps.event.addDomListener(controlUI, 'click', function() {
    console.log("click");
    for (i = 0; i < 20; i ++) {
        setTimeout(function(){update(power)}, 2000 * i);     
    }
  });
}


function initialize() {
    var mapOptions = {
        center: new google.maps.LatLng(34.116552,-117.631469),
        zoom: 15
    };
    map = new google.maps.Map(document.getElementById("map-canvas"),
                  mapOptions);
    oRequest = new XMLHttpRequest();

    var controlDiv = document.createElement('div');
    var powerControl = new PowerControl(controlDiv);
    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(controlDiv);

    sURL = "http://"
        + self.location.hostname
        + "/smartgrid-demo/new.json";
    data = loadJSON(sURL);
    features = data.features;

    var sURL = "http://"
    + self.location.hostname
    + "/smartgrid-demo/preprocess/power_limit/power1.json";
    power = loadJSON(sURL).contents;

    // Render DXF
    var markers = new Array(); // Array that stores all labels
    lines = new Array();
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
    

    // Toggle visibility of labels
    google.maps.event.addListener(map,'zoom_changed',function () {
        if (map.getZoom() < 16.5) eraseMarkers(markers);
        if (map.getZoom() >= 16.5) showMarkers(markers);
    });

}
google.maps.event.addDomListener(window, 'load', initialize);


