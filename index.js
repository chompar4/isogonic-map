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

function formatDec (declination) {
    return `${Math.abs(declination.toFixed(2))}°${declination < 0 ? "W": "E"}`
}

function getDate() {
    var today = new Date();
    return {
        day: today.getDate(),
        month: today.getMonth() + 1, //January is 0!,
        year: today.getFullYear()
    }
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

// get location panel elements
var panelCoords = d3.select('#location-coord');
var panelDeclination = d3.select('#location-declination');
var panelMagnitude = d3.select('#location-magnitude');

map.on('click', function(e) {
    const coordinates = [e.lngLat.lng, e.lngLat.lat]
    panelCoords.text(formatLocation(coordinates))
    

    let headers = new Headers();
    let url = new URL('https://geomag-api.herokuapp.com/')

    let today = getDate()

    params = {
        lng: coordinates[0],
        lat: coordinates[1],
        altitude_km: 0, 
        day: today.day, 
        mth: today.month,
        yr: today.year
    }

    console.log(params)

    url.search = new URLSearchParams(params).toString();
    headers.append('Content-Type', 'application/json');
    headers.append('Accept', 'application/json');

    fetch(url, {
        mode: 'cors',
        method: 'GET',
        headers: headers
    })
    .then(response => response.json())
    .then(field => {
        console.log(field)

        const mag = Math.sqrt(field.X * field.X + field.Y * field.Y).toFixed(2)

        panelDeclination.text(`Declination | ${formatDec(field.D)}`)
        panelMagnitude.text(`Magnitude | ${mag} nT`)

    })
    .catch(error => {
        console.log('Fetch failed : ' + error.message)
    });

})
