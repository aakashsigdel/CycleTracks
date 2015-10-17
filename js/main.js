var QUERY_URL = 'http://overpass-api.de/api/interpreter?data=' + 
			'(way(%minLat%,%minLng%,%maxLat%,%maxLng%)' + 
				';);(._;>;);out body;'

var layer;
$(function() {
	var map = L.map('map').setView([47.507817, -121.739877], 14);
	var replacement = {
		"%minLat%": map.getBounds()._southWest.lat,
		"%minLng%":  map.getBounds()._southWest.lng,
		"%maxLat%": map.getBounds()._northEast.lat,
		"%maxLng%": map.getBounds()._northEast.lng
	};

	L.tileLayer('http://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="http://www.opencyclemap.org">OpenCycleMap</a>, &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
	}).addTo(map);

	initializeTracks(map, replacement);
	$('.home').click(function() {
		layer.clearLayers();
	});

	map.on('zoomend', function() {
		if(map.getZoom() > 16) {
			var query = getQuery(replacement);
			console.log(query);
			$.get(query, function(data) {
				console.log('hello');
				layer.clearLayers();
				layer =  new L.OSM.DataLayer(data);
				layer.bindPopup('hello').addTo(map);
				layer.on('click', function(temp) {
					map.fitBounds(temp.layer.getBounds());
					temp.layer.setStyle({ color: 'red' });
				});
			});
		}
	});
});

function initializeTracks(map, replacement) {
	var query = getQuery(replacement);
	console.log(query);
	//if(map.getZoom() > 15) {
		$.get(query, function(data) {
			layer =  new L.OSM.DataLayer(data).addTo(map);
			layer.on('click', function(temp) {
				map.fitBounds(temp.layer.getBounds());
				temp.layer.setStyle({ color: 'red' });
			});
			console.log(layer);
		});
	//}
}

function getQuery(replacement) {
	query = QUERY_URL.replace(/%\w+%/g, function(all) {
		return replacement[all] || all;
	});
	return query;
}
