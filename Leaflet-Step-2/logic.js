// Store our API endpoint inside queryUrl
// var queryUrl = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2014-01-01&endtime=" +
//   "2014-01-02&maxlongitude=-69.52148437&minlongitude=-123.83789062&maxlatitude=48.74894534&minlatitude=25.16517337";

var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {

    //Create color function using chroma
    function getColor(d) {
        var mapScale = chroma.scale(['#008000', '#a7cc00', '#ffed00', '#ffb700', '#ff7a00', '#ff0000'])
            .classes([-10, 10, 20, 50, 70, 90]);
        return mapScale(d)
    }

    // Create a GeoJSON layer containing the features array on the earthquakeData object
    var earthquakes = L.geoJSON(data, {
        onEachFeature: function(feature, layer) {
            layer.bindPopup("<h3>" + feature.properties.place +
                "</h3><hr><p><b>Mag: </b>" + feature.properties.mag + "<b> Depth: </b>" + feature.geometry.coordinates[2] + "</p>" +
                "<p>" + new Date(feature.properties.time) + "</p>");
        },
        // Create circles for pointers
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng, {
                radius: feature.properties.mag * 3,
                fillColor: getColor(feature.geometry.coordinates[2]),
                color: "grey",
                weight: 1,
                opacity: 1,
                fillOpacity: feature.geometry.coordinates[2] / 5
            });
        }
    })

    // Perform a GET request to the query URL
    var geojson = "GEOboundaries.json"

    // Once we get a response, send the features object to the geoJSON function
    d3.json(geojson, function(PlateData) {
        console.log(PlateData)
        plates = L.geoJSON(PlateData, {
            style: function(feature) {
                return {
                    color: "purple",
                    fillColor: "white",
                    weight: 2,
                    fillOpacity: 0
                }
            },
            onEachFeature: function(feature, layer) {
                console.log(feature.coordinates)
                layer.bindPopup("<h2>" + "Plate Name: " + feature.properties.Name + "</h2>")
            }
        })

        // Sending plates and earthquakes layer to the createMap function
        createMap(plates, earthquakes);
    });

});

function createMap(plates, earthquakes) {

    // Define streetmap and darkmap layers
    var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/streets-v11",
        accessToken: API_KEY
    });

    var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "dark-v10",
        accessToken: API_KEY
    });

    // Define a baseMaps object to hold our base layers
    var baseMaps = {
        "Street Map": streetmap,
        "Dark Map": darkmap
    };

    // Create overlay object to hold our overlay layer
    var overlayMaps = {
        Earthquakes: earthquakes,
        Plates: plates
    };

    // Create our map, giving it the streetmap and earthquakes layers to display on load
    var myMap = L.map("map", {
        center: [
            37.09, -95.71
        ],
        zoom: 4,
        layers: [streetmap, earthquakes, plates]
    });

    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    //Create color function using chroma
    function getColor(d) {
        var mapScale = chroma.scale(['#008000', '#a7cc00', '#ffed00', '#ffb700', '#ff7a00', '#ff0000'])
            .classes([-10, 10, 20, 50, 70, 90]);
        return mapScale(d)
    }
    // Set up the legend
    var legend = L.control({ position: 'bottomright' });

    // create legend function
    legend.onAdd = function() {

        var div = L.DomUtil.create('div', 'info legend'),
            depth = [-10, 10, 30, 50, 70, 90],
            labels = [],
            from, to;

        //Adding lable title and color
        for (var i = 0; i < depth.length; i++) {
            from = depth[i];
            to = depth[i + 1];

            labels.push(
                '<li style="background:' + getColor(from + 1) + '"></li> ' +
                from + (to ? '&ndash;' + to : '+'));
        }

        div.innerHTML += "<h1>Depth</h1>" + labels.join('<br>');
        return div;

    };

    // Adding legend to the map
    legend.addTo(myMap);

}