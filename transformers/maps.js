var map;
var oRequest;
var lines; /* Array of all polylines */
var counter = 0; /* Counter of dataset */
var numDatasets = 288;
var timer = new Array();
var elapsedTime;
var timeDiv;

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

/* Assume that each counter represents 5 mins, 
   returns the time of the day,*/
function counterToTime(counter) {
    hour = String(Math.floor(counter / 12));
    if (hour.length < 2)
        hour = '0' + hour;
    min = String(counter % 12 * 5);
    if (min.length < 2)
        min = '0' + min;

    return hour + ':' + min + ':00';
}

function httpGet(theUrl) {
    var xmlHttp = null;

    xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false );
    xmlHttp.send( null );
    return xmlHttp.responseText;
}

function update(phase) {
    var sURL = "http://"
    + self.location.hostname 
    + "/smartgrid-demo/preprocess/"
    + phase +"/line" + counter.toString() + ".json";
    frame = loadJSON(sURL).contents;
    for (var i = 0; i < frame.length; i++) {
        // Look for the corresponding polyline
        for (var j = 0; j < lines.length; j++) {
            idx1 = lines[j].ends.indexOf(frame[i]["from"]);
            idx2 = lines[j].ends.indexOf(frame[i]["to"]);
            if (idx1 == idx2 && idx1 > -1)
              idx2 = lines[j].ends.indexOf(frame[i]["to"], idx1 + 1);
            if (idx1 > -1 && idx2 > -1) {
                // Change color to red if the current is above limit
                //if (frame[i]["amps"] > lines[j][phase]) 
                //    lines[j].polyline.setOptions({strokeColor: 'red'});
                //else
                //    lines[j].polyline.setOptions(
                //        {strokeColor: lines[j].defaultColor});
                if (frame[i]["amps"] > 0.7 * lines[j][phase]) 
                    lines[j].polyline.setOptions({strokeColor: 'red'});
                else if (frame[i]["amps"] > 0.01 * lines[j][phase])
                    lines[j].polyline.setOptions({strokeColor: 'yellow'});
                else
                    lines[j].polyline.setOptions(
                        {strokeColor: lines[j].defaultColor});

                break;
            }
        }
    }
    // Update the timer
    elapsedTime.innerHTML = '<strong>' + counterToTime(counter) + '</strong>'
    // Update the dataset counter and read a dataset
    counter = counter % numDatasets + 1;
}

/* Clear demo from the map */
function clearmap(phase) {    
    for (var j = 0; j < lines.length; j++) {
        lines[j].polyline.setOptions(
            {strokeColor: lines[j].defaultColor});
    }
    if (map.controls[google.maps.ControlPosition.TOP_LEFT].length > 0)
        map.controls[google.maps.ControlPosition.TOP_LEFT].pop();
}

function PhaseControl(controlDiv, phase) {

  // Set CSS styles for the DIV containing the control
  // Setting padding to 5 px will offset the control
  // from the edge of the map.
  controlDiv.style.padding = '5px';

  // Set CSS for the control border.
  var controlUI = document.createElement('div');
  controlUI.style.backgroundColor = 'white';
  controlUI.style.borderStyle = 'solid';
  controlUI.style.borderWidth = '1px';
  controlUI.style.cursor = 'pointer';
  controlUI.style.textAlign = 'center';
  controlUI.title = 'Click to show power of phase ' + phase;
  controlDiv.appendChild(controlUI);

  // Set CSS for the control interior.
  var controlText = document.createElement('div');
  controlText.style.fontFamily = 'Arial,sans-serif';
  controlText.style.fontSize = '15px';
  controlText.style.paddingLeft = '4px';
  controlText.style.paddingRight = '4px';
  controlText.innerHTML = '<strong>' + phase + '</strong>';
  controlUI.appendChild(controlText);

  // Setup the click event listeners: 
  // show the power limits from different datasets.
  google.maps.event.addDomListener(controlUI, 'click', function() {
    if (timer.length > 0) {
        // Clear ongoing demo for other phases
        if (map.controls[google.maps.ControlPosition.TOP_LEFT].length > 0)
            map.controls[google.maps.ControlPosition.TOP_LEFT].pop();
        map.controls[google.maps.ControlPosition.TOP_LEFT].push(timeDiv);
        counter = 0;
        for (i = 0; i < numDatasets; i ++) 
            clearTimeout(timer[i]); 
        for (i = 0; i < numDatasets; i ++) 
            timer[i] = setTimeout(function(){update(phase)}, 100 * i);   
        timer[numDatasets] = setTimeout(function(){clearmap()}, 100 * numDatasets);      
    }
    else {
        map.controls[google.maps.ControlPosition.TOP_LEFT].push(timeDiv);
        for (i = 0; i < numDatasets; i ++) 
            timer.push(setTimeout(function(){update(phase)}, 100 * i));
        timer.push(setTimeout(function(){clearmap()}, 100 * numDatasets));
    }
  });
}

function TimeControl(controlDiv) {

  // Set CSS styles for the DIV containing the control
  // Setting padding to 5 px will offset the control
  // from the edge of the map.
  controlDiv.style.padding = '5px';

  // Set CSS for the control border.
  var controlUI = document.createElement('div');
  controlUI.style.backgroundColor = 'black';
  controlUI.style.borderStyle = 'solid';
  controlUI.style.borderWidth = '1px';
  controlUI.style.cursor = 'pointer';
  controlUI.style.textAlign = 'center';
  controlUI.title = 'Time of the Day ';
  controlDiv.appendChild(controlUI);

  // Set CSS for the control interior.
  var controlText = document.createElement('div');
  controlText.style.fontFamily = 'Arial,sans-serif';
  controlText.style.color = 'white';
  controlText.style.fontSize = '25px';
  controlText.style.paddingLeft = '4px';
  controlText.style.paddingRight = '4px';
  controlText.innerHTML = '<strong>00:00:00</strong>';
  controlUI.appendChild(controlText);

  return controlText;
}

function initialize() {
    var mapOptions = {
        center: new google.maps.LatLng(34.116552,-117.631469),
        zoom: 15
    };
    map = new google.maps.Map(document.getElementById("map-canvas"),
                  mapOptions);
    oRequest = new XMLHttpRequest();

    var phaseDiv = document.createElement('div');
    A = new PhaseControl(phaseDiv, 'A');
    B = new PhaseControl(phaseDiv, 'B');
    C = new PhaseControl(phaseDiv, 'C');
    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(phaseDiv);

    timeDiv = document.createElement('div');
    elapsedTime = new TimeControl(timeDiv);

    sURL = "http://"
        + self.location.hostname
        + "/smartgrid-demo/new.json";
    data = loadJSON(sURL);
    features = data.features;

    sURL = "http://"
    + self.location.hostname
    + "/smartgrid-demo/preprocess/line_current_A.json";
    phaseA = loadJSON(sURL).contents;
    sURL = "http://"
    + self.location.hostname
    + "/smartgrid-demo/preprocess/line_current_B.json";
    phaseB = loadJSON(sURL).contents;
    sURL = "http://"
    + self.location.hostname
    + "/smartgrid-demo/preprocess/line_current_C.json";
    phaseC = loadJSON(sURL).contents;

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
            // Check for current limits
            entity = feature.properties.ExtendedEntity;
            var endpoints, IA, IB, IC;
            var defaultColor = strokeColor;
            for (var j = 0; j < phaseA.length; j++) {
                if (entity.indexOf(phaseA[j]["to"]) > -1 &&
                    entity.indexOf(phaseA[j]["from"]) > -1) {
                    endpoints = phaseA[j]["from"] + ',' + phaseA[j]["to"];
                    IA = phaseA[j]["amps"];
                    IB = phaseB[j]["amps"];
                    IC = phaseC[j]["amps"];
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
            
            // Cache polylines 
            if (endpoints != undefined) {
                var valueToPush = { }; 
                valueToPush["ends"] = endpoints;
                valueToPush["polyline"] = polyLinePath;
                valueToPush["defaultColor"] = defaultColor;
                valueToPush["A"] = IA;
                valueToPush["B"] = IB;
                valueToPush["C"] = IC;
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

    /* write transformers */
    ftableURL = "https://www.googleapis.com/fusiontables/v1/query?sql=SELECT%20*%20FROM%201alh4YI5KOpfadgxU36mkwx1SvHz1bbmjUsyOpDgV&key=AIzaSyBGvnpUsrJQxZhSYddRBZH6swSDD7nrSwo";
    ftable = loadJSON(ftableURL);
    for (var i = 0; i < ftable.rows.length; i++) {
	var trans = ftable.rows[i];
	console.log(trans);
    }
}
google.maps.event.addDomListener(window, 'load', initialize);


