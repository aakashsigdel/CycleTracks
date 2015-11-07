function setUpEventHandellers(map) {
	var replacement = getBoundReplacements(map);
	var query = getQuery(QUERY_URL, replacement);

	// Temporary Click handller to check clear leayrs
	$('.home').click(function() {
		layers.clearLayers();
	});

	// Load inital data on the map and sepup clicks on the  tracks
	getDataAndSetOnClick(query, map);

	// When map is zoomed greater than 16 level
	map.on('zoomend', function() { onZoom(map) });
	
	// When map is panned
	map.on('moveend', function() { onPan(map) });

}

function onZoom(map) {
	if(map.getZoom() > 14) {
		if(currLayer !== null)
			currLayer.layer.setStyle({ color: 'red' });

		var replacement = getBoundReplacements(map);
		var query = getQuery(QUERY_URL, replacement);
		
	 getDataAndSetOnClick(query, map);
	}
}

function onPan(map) {
	if(map.getZoom() > 13) {
		if(currLayer !== null)
			currLayer.layer.setStyle({ color: 'red' });
		
		var replacement = getBoundReplacements(map);
		var query = getQuery(QUERY_URL, replacement);
	 getDataAndSetOnClick(query, map);
	}
}

var previous = [];
var previousClicked = null;
function getDataAndSetOnClick(query, map) {
	$.get(query, function(data) {
		if(layers) {
			layers.eachLayer(function(item) {
				if(item.options.color === 'red') {
					previous.push(item);
				}
			});
			layers.clearLayers();
		}
		layers =  new L.OSM.DataLayer(data).addTo(map);
		if(previous.length !== 0) {
			layers.eachLayer(function(item) {
				previous.forEach(function(entry) {
					if(item.feature.id === entry.feature.id) {
						item.setStyle({ color: 'red' });
						previousClicked = {};
						previousClicked.layer = item;
					}
				});
			});
		}
		layers.on('click', function(layer) {
			currLayer = layer;
			var duplicateFlag = false;
			for(var i = 0; i < selectedTrails.length; i++) {
				if(selectedTrails[i].layer.feature.id === layer.layer.feature.id) {
					duplicateFlag = true;
					break;
				}
			}
			if(!duplicateFlag)
				selectedTrails.push(layer);
			// lat lng array of polyline points
			currLatLngArr = L.polyline(currLayer.layer._latlngs).getLatLngs();
			if(previous.length !== 0);
				//previous.setStyle({ color: 'blue' });
			layer.layer.setStyle({ color: 'red' });
			if(previousClicked !== null)
				//previousClicked.layer.setStyle({ color: 'blue' });
			previousClicked = layer;
			getElevationAndDistance(currLatLngArr);
			console.log(selectedTrails);
		});
	});
}
