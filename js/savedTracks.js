var savedTracks = [];
$(function() {
	var map = initializeMap();
	getData(map);

});

function initializeMap() {
	var map = L.map('map').setView([47.507817, -121.739877], 14);

	L.tileLayer('http://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="http://www.opencyclemap.org">OpenCycleMap</a>, ' + 
				'&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
	}).addTo(map);

	return map;
}

var trail = null;
function getData(map) {
	var myDataRef = new Firebase('https://cycletracks.firebaseio.com/');
	myDataRef.on('value', function(snapshot) {
		snapshot.forEach(function(item){
			savedTracks.push(item.val());
			$('.saved-tracks').append(
				'<div class="track-name">' + item.val().name + '</div>'
			);
		});

		$('.track-name').click(function(e) {
			if(trail !== null)
				map.removeLayer(trail);
			for(var i = 0; i < savedTracks.length; i++) {
				if(this.innerHTML === savedTracks[i].name) {
					trail = L.polyline(savedTracks[i].points, {color: 'red'}).addTo(map);
					map.fitBounds(trail.getBounds());
					break;
				}
			}
			getElevationAndDistance(trail.getLatLngs());
		});
	});
}

function getElevationAndDistance(trackPoints) {
	var ELEVATION_URL = 'http://open.mapquestapi.com/elevation/v1/profile?key=%api_key%' + 
			'&shapeFormat=raw&latLngCollection=%point_data%';
	var pointData = (() => {
		var pointsString = '';
		trackPoints.forEach(function(point) {
			pointsString += point.lat + ',' + point.lng + ',';
		});
		return pointsString.slice(0, pointsString.length - 1);
	})();

	var replacement = {
		'%api_key%': '9JZljemB2v3GJTizHcjbDz3eB32omiwv',
		'%point_data%': pointData
	};
	var query = getQuery(ELEVATION_URL, replacement);

	//Clearing the fields
	$('.details>.elevation>.value')
		.html('');
	$('.details>.distance>.value')
		.html('');

	$.get(query, function(data) {
		var cluElevationAndDistance = getCluElevationAndDistance(data.elevationProfile);
		$('.details>.elevation>.value')
			.html(cluElevationAndDistance.cluElevation + ' meters');
		$('.details>.distance>.value')
			.html(Math.round(Number(cluElevationAndDistance.distance) * 100) / 100 + ' KMs');
	});
}

function getCluElevationAndDistance(elevationData) {
	var altitudes = [];
	altitudes[0] = 0;
	for(var i = 1; i < elevationData.length; i++) {
		var temp = elevationData[i].height - elevationData[i - 1].height;
		altitudes[i] = temp > 0 ? temp : 0;
	}

	var cluElevationAndDistance = {
		cluElevation: 0,
		distance : 0
	};

	cluElevationAndDistance.distance = Number(elevationData[elevationData.length - 1].distance);

	altitudes.forEach(function(data) {
		cluElevationAndDistance.cluElevation += data;
	});
	return cluElevationAndDistance;
}

function getQuery(query, replacement) {
	query = query.replace(/%\w+%/g, function(all) {
		return replacement[all] || all;
	});
	return query;
}
