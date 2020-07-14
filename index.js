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

// Project GeoJSON coordinate to the map's current state
function project(d) {
    return map.project(new mapboxgl.LngLat(+d[0], +d[1]));
}

// Get Mapbox map canvas container
var canvas = map.getCanvasContainer();

// Overlay d3 on the map
var svg = d3.select(canvas)
    .append("svg")
    .attr("width", $("svg").parent().width())
    .attr("height", $("svg").parent().height())

const mapGroup = svg.append("g")
    .attr('class', 'map-group');

// get location panel elements
var panelCoords = d3.select('#location-coord');
var panelDeclination = d3.select('#location-declination');
var panelMagnitude = d3.select('#location-magnitude');
var panelLoading = d3.select('#location-loading')

map.on('click', function(e) {

    const coordinates = [e.lngLat.lng, e.lngLat.lat]
    panelCoords.text(formatLocation(coordinates))

    // reset all vals
    d3.selectAll("circle").remove()
    panelDeclination.text('')
    panelMagnitude.text('')
    panelLoading.text('Loading...')

    var circle = mapGroup.selectAll("stations")
        .append("stations")
        .data([coordinates])
        .enter()
        .append("circle")
        .attr("r", 10)
        .attr("class", "station")
        .attr("cx", function(d) { return project(d).x })
        .attr("cy", function(d) { return project(d).y });

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
        panelLoading.text('')

        // signal the values have loaded
        d3.selectAll("circle")
            .classed("loaded", true)

    })
    .catch(error => {
        console.log('Fetch failed : ' + error.message)
    });

})

// Update on map interaction
map.on("viewreset", update);
map.on("move",      update);
map.on("moveend",   update);

// Update d3 shapes' positions to the map's current state
function update() {
    d3.selectAll("circle")
        .attr("cx", function(d) { return project(d).x })
        .attr("cy", function(d) { return project(d).y });
};