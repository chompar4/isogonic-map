crs = {
    origin: [144.58, -37.49], 
    zoom: 10
}

function formatLng (x) {
    return `${Math.abs(x).toFixed(2)}°${x < 0 ? "W" : "E"}`
}

function formatLat (y) {
    return `${Math.abs(y).toFixed(2)}°${y < 0 ? "S" : "N"}`
}

function formatLocation (coords) {

    lat = formatLat(coords[1])
    lng = formatLng(coords[0])

    return `Location | ${lat}, ${lng}`
}

// Set-up map
mapboxgl.accessToken = 'pk.eyJ1Ijoiam9yZGl0b3N0IiwiYSI6ImQtcVkyclEifQ.vwKrOGZoZSj3N-9MB6FF_A';
var map = new mapboxgl.Map({
    container: 'map-holder',
    style: 'mapbox://styles/mapbox/light-v10',
    zoom: crs.zoom,
    center: crs.origin,
});

// Get Mapbox map canvas container
var canvas = map.getCanvasContainer();

// get location panel options
var panelCoords = d3.select('#location-coord');

map.on('click', function(e) {
    const coordinates = [e.lngLat.lng, e.lngLat.lat]
    panelCoords.text(formatLocation(coordinates))
})
