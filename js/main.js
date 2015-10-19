// Overpass query to fetch cycle tracks
var QUERY_URL = 'http://overpass-api.de/api/interpreter?data=' + 
			'(way["highway"="path"]["bicycle"!~"no"](%minLat%,%minLng%,%maxLat%,%maxLng%);' +
			'way["highway"="track"]["bicycle"!~"no"](%minLat%,%minLng%,%maxLat%,%maxLng%););' +
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
	var map = initializeTracks();
	setUpEventHandellers(map);
});

// initailze the map with tracks
function initializeTracks() {
	var map = L.map('map').setView([47.507817, -121.739877], 14);

	L.tileLayer('http://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="http://www.opencyclemap.org">OpenCycleMap</a>, ' + 
				'&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
	}).addTo(map);

	return map;
}

// setup all event handellers like zoom panned loaded
function setUpEventHandellers(map) {
	var replacement = {
		"%minLat%": map.getBounds()._southWest.lat,
		"%minLng%":  map.getBounds()._southWest.lng,
		"%maxLat%": map.getBounds()._northEast.lat,
		"%maxLng%": map.getBounds()._northEast.lng
	};

	var query = getQuery(QUERY_URL, replacement);

	// Temporary Click handller to check clear leayrs
	$('.home').click(function() {
		layers.clearLayers();
	});

	// Load inital data on the map and sepup clicks on the  tracks
	$.get(query, function(data) {
		layers =  new L.OSM.DataLayer(data).addTo(map);
		layers.on('click', function(layer) {
			currLayer = layer;
			
			// lat lng array of polyline points
			currLatLngArr = L.polyline(currLayer.layer._latlngs).getLatLngs();

			map.fitBounds(layer.layer.getBounds());
			if(prevLayer === null)
				layer.layer.setStyle({ color: 'red' });
			else {
				prevLayer.layer.setStyle({ color: 'blue' });
				layer.layer.setStyle({ color: 'red' });
			}
			prevLayer = layer;
			getElevationAndDistance(currLatLngArr[currLatLngArr.length - 1], currLatLngArr[0]);
		});
	});

	// When map is zoomed greater than 16 level
	map.on('zoomend', function() {
		if(map.getZoom() > 16) {
			if(currLayer !== null)
				currLayer.layer.setStyle({ color: 'red' });
			
			$.get(query, function(data) {
				layers =  new L.OSM.DataLayer(data);
				layers.on('click', function(layer) {
					currLayer = layer;
					
					// lat lng array of polyline points
					currLatLngArr = L.polyline(currLayer.layer._latlngs).getLatLngs();

					map.fitBounds(layer.layer.getBounds());
					layer.layer.setStyle({ color: 'red' });
					if(prevLayer === null)
						layer.layer.setStyle({ color: 'red' });
					else {
						prevLayer.layer.setStyle({ color: 'blue' });
						layer.layer.setStyle({ color: 'red' });
					}
					prevLayer = layer;
				});
			});
		}
	});

}

// make query with bounding box
function getQuery(query, replacement) {
	query = query.replace(/%\w+%/g, function(all) {
		return replacement[all] || all;
	});
	return query;
}

function getElevationAndDistance(start, end) {
	var ELEVATION_URL = 'http://open.mapquestapi.com/elevation/v1/profile?key=%api_key%' + 
			'&shapeFormat=raw&latLngCollection=%startLat%,%startLng%,%endLat%,%endLng%';

	var replacement = {
		'%api_key%': '9JZljemB2v3GJTizHcjbDz3eB32omiwv',
		"%startLat%": start.lat,
		"%startLng%":  start.lng,
		"%endLat%": end.lat,
		"%endLng%": end.lng
	};
	var query = getQuery(ELEVATION_URL, replacement);
	console.log(query);
	$.get(query, function(data) {
		$('.details>.elevation>.from>.value').html(data.elevationProfile[0].height + 
																							 ' meters above sea level');
		$('.details>.elevation>.to>.value').html(data.elevationProfile[1].height + 
																						 ' meters above sea level');
		$('.details>.distance>.value')
			.html(Math.round(Number(data.elevationProfile[1].distance) * 100000) / 100  + 'meters');
		console.log('hello');
		console.log(data.elevationProfile);

	});
}
