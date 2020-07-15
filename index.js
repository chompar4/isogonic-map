crs = {
    origin: [134.21, -25.62], 
    zoom: 3
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

    return `${lat}, ${lng}`
}

function formatDec (declination) {
    // format declination to east / west of true north 
    return `${Math.abs(declination.toFixed(2))}°${declination < 0 ? "W": "E"}`
}

function formatInc (inclination) {
    // format inclination (dip) to up / down of horizon line
    return `${inclination.toFixed(2)}°`
}

function getDate() {
    var today = new Date();
    return {
        day: today.getDate(),
        month: today.getMonth() + 1, //January is 0!,
        year: today.getFullYear()
    }
}

function formatDate(date) {
    return `${date.day}-${date.month}-${date.year}`
}

// Project any point (lon, lat) to map's current state
function projectPoint(lon, lat) {
    var point = map.project(new mapboxgl.LngLat(lon, lat));
    this.stream.point(point.x, point.y);
}

// d3 geo path defs
var transform = d3.geoTransform({point:projectPoint});
var path = d3.geoPath().projection(transform);

// dummy ping the server to wake it up
let url = new URL('https://geomag-api.herokuapp.com/')
fetch(url, {
    mode: 'cors',
    method: 'GET',
})

// show contour data for the date
let today = getDate()


// Set-up map
mapboxgl.accessToken = 'pk.eyJ1Ijoiam9yZGl0b3N0IiwiYSI6ImQtcVkyclEifQ.vwKrOGZoZSj3N-9MB6FF_A';
var map = new mapboxgl.Map({
    container: 'map-holder',
    style: 'mapbox://styles/mapbox/outdoors-v11',
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
    .attr('class', 'map-group')

// get location panel elements
var panelCoords = d3.select('#location-coord');
var panelDate = d3.select('#location-date');
var panelDeclination = d3.select('#location-declination');
var panelInclination = d3.select('#location-inclination');
var panelMagnitudeNorth = d3.select('#magnitude-north');
var panelMagnitudeEast = d3.select('#magnitude-east');
var panelMagnitudeDown = d3.select('#magnitude-down');
var panelLoading = d3.select('#location-loading')

var panel = d3.select("#panel").style("display", "none")


// mapbox interpolates values between 'stops', this means we have to 
// enumerate all the thick and thin levels
const thick = 4
const thin = 1

const start = [...Array(10).keys()]
const vals = [...start.map(x => -10*x), ...start.map(x=>10*x)]
const contourStops = vals
    .flatMap(x => [[x-1, thin],[x, thick],[x+1, thin]])
    .sort((a,b) => a[0]-b[0])

map.on('load', function() {
    map.addSource('contours', {
        type: 'geojson',
        data: `https://raw.githubusercontent.com/chompar4/geomag_api/master/contour-plots/wmm-declination-contour-1-6-${today.year}.json`
    });

    map.addLayer({
        'id': 'contour-labels',
        'type': 'symbol',
        'source': 'contours',
        'layout': {
            "symbol-placement": "line",
            'text-field': ['get', 'level-value'],
            'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
            'text-radial-offset': 0.5,
            'text-justify': 'auto'
        },
    })
        
    map.addLayer({
        'id': 'contour-lines',
        'type': 'line',
        'source': 'contours',
        'paint': {
            'line-color': {
                'property': 'level-value',
                'stops': [
                    [-180, 'blue'], 
                    [-1, 'blue'],
                    [0, 'red'], 
                    [180, 'red']
                ]
            },
            'line-width': {
                'property': 'level-value', 
                'stops': contourStops
            }
            }
        });
})

map.on('click', function(e) {

    const coordinates = [e.lngLat.lng, e.lngLat.lat]
    panel.style("display", "block")
    panelCoords.text(formatLocation(coordinates))
    panelDate.text(formatDate(today))

    // reset all vals
    d3.selectAll("circle").remove()
    panelDeclination.text('')
    panelInclination.text('')
    panelMagnitudeNorth.text('')
    panelMagnitudeEast.text('')
    panelMagnitudeDown.text('')
    panelLoading.text('Calculating...')

    mapGroup.selectAll("locations")
        .append("locations")
        .data([coordinates])
        .enter()
        .append("circle")
        .attr("r", 10)
        .attr("class", "location")
        .attr("cx", function(d) { return project(d).x })
        .attr("cy", function(d) { return project(d).y });

    let headers = new Headers();
    let url = new URL('https://geomag-api.herokuapp.com/')

    params = {
        lng: coordinates[0],
        lat: coordinates[1],
        altitude_km: 0, 
        day: today.day, 
        mth: today.month,
        yr: today.year
    }

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

        panelDeclination.text(`${formatDec(field.D)}`)
        panelInclination.text(`${formatInc(field.I)}`)
        panelMagnitudeNorth.text(`${field.X.toFixed(2)} nT`)
        panelMagnitudeEast.text(`${field.Y.toFixed(2)} nT`)
        panelMagnitudeDown.text(`${field.Z.toFixed(2)} nT`)
        panelLoading.text('')

        // signal the values have loaded
        d3.selectAll("circle")
            .classed("loaded", true)
    })
    .catch(error => {
        console.log('Fetch failed : ' + error.message)
    });

})

const hiddenDetails = [
    d3.select("#mag-north"),
    d3.select("#mag-east"),
    d3.select("#mag-down"),
]

function show(things) {
    things.map(x => x.style("display", "block"))
}

function hide(things) {
    things.map(x => x.style("display", "none"))
}

// hide hidden details initially 
hide(hiddenDetails)

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

// expand detail panel
d3.select("#detail-button")
    .on("click", function(){
        if (hiddenDetails[0].style("display") == "none"){
            show(hiddenDetails)
        } else {
            hide(hiddenDetails)
        }
    })

// handle close panel putton 
d3.select("#location-close")
    .on("click", function(){
        d3.selectAll("circle").remove()
        panelDeclination.text('')
        panelInclination.text('')
        panelMagnitudeNorth.text('')
        panelMagnitudeEast.text('')
        panelMagnitudeDown.text('')
        panelLoading.text('Calculating...')

        d3.select("#panel").style("display", "none")
    })