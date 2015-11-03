// Overpass query to fetch cycle tracks
var QUERY_URL = 'http://overpass-api.de/api/interpreter?data=' + 
			'(way["highway"="path"](%minLat%,%minLng%,%maxLat%,%maxLng%);' +
			'way["highway"="track"](%minLat%,%minLng%,%maxLat%,%maxLng%););' +
			'(._;>;);out body;'


// Cycle layers
var layers;
// Previously clicked cycle track on Map
var prevLayer = null;
// Currently clicked layer
var currLayer = null;
// lat lang array of currently selected polyline(Cycle track)
var currLatLngArr = [];

$(function() {
	var map = initializeMap();
	setUpEventHandellers(map);
});

// initailze the map
function initializeMap() {
	var map = L.map('map').setView([47.507817, -121.739877], 14);

	L.tileLayer('http://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="http://www.opencyclemap.org">OpenCycleMap</a>, ' + 
				'&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
	}).addTo(map);

	return map;
}

// make query with bounding box
function getQuery(query, replacement) {
	query = query.replace(/%\w+%/g, function(all) {
		return replacement[all] || all;
	});
	return query;
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

function getBoundReplacements(map) {
	return {
		"%minLat%": map.getBounds()._southWest.lat,
		"%minLng%":  map.getBounds()._southWest.lng,
		"%maxLat%": map.getBounds()._northEast.lat,
		"%maxLng%": map.getBounds()._northEast.lng
	};
}
