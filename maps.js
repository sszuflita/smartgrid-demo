

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
	+ "rossi.json";
    
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

	for (var i = 0; i < numFeatures; i++) {
	    feature = features[i];
	    var strokeColor;
	    var layer = feature.properties.Layer;
	    if (layer == "15452_MAIN")
		strokeColor = "#00FF00";
	    else
		strokeColor = "#FFFFFF";
	    
	    coords = feature.geometry.coordinates;

	    if (coords != undefined && typeof coords[0] == "number") {
/*		a = coords[0];
		b = coords[1];
		console.log(dxfToGPS(coords));
		x = x0 + r * a;
		y = y0 + s * b;

		if (!isNaN(x) && !isNaN(y)) {
		    console.log(x + ' ' + y);
		    var myLatlng = new google.maps.LatLng(y, x);
		    var marker = new google.maps.Marker({
			position: myLatlng,
			map: map,
			title:"Hello World!"
		    });
		}*/
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
		console.log(polyLine);
		var polyLinePath = new google.maps.Polyline({
		    path: polyLine,
		    geodesic: true,
		    strokeColor: strokeColor,
		    strokeOpacity: 1.0,
		    strokeWeight: 2
		});

		polyLinePath.setMap(map);
	    }

			


	}

    }
    else alert("Error executing XMLHttpRequest call!");
}
google.maps.event.addDomListener(window, 'load', initialize);

