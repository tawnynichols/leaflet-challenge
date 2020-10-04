// Store our API endpoint inside queryUrl
// var queryUrl = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2014-01-01&endtime=" +
//   "2014-01-02&maxlongitude=-69.52148437&minlongitude=-123.83789062&maxlatitude=48.74894534&minlatitude=25.16517337";

var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
    // Once we get a response, send the data.features object to the createFeatures function
    createFeatures(data.features);
    console.log(data.features[1].properties)

});



//######################################

function createFeatures(earthquakeData) {

    // Define a function we want to run once for each feature in the features array
    // Give each feature a popup describing the place and time of the earthquake
    function onEachFeature(feature, layer) {
        layer.bindPopup("<h3>" + feature.properties.place +
            "</h3><hr><p>Mag " + feature.properties.mag + " Depth " + feature.geometry.coordinates[2] + "</p>" +
            "<p>" + new Date(feature.properties.time) + "</p>");
        console.log(feature.geometry.coordinates[2])
    }

    // Create a GeoJSON layer containing the features array on the earthquakeData object

    // Run the onEachFeature function once for each piece of data in the array
    // var earthquakes = L.geoJSON(earthquakeData, {
    //     style: gardenStyle,
    //     onEachFeature: onEachFeature
    // });

    // function chooseColor(dmin) {
    //     switch (dmin) {
    //         case >.05:
    //             return "yellow";
    //         case "Bronx":
    //             return "red";
    //         case "Manhattan":
    //             return "orange";
    //         case "Queens":
    //             return "green";
    //         case "Staten Island":
    //             return "purple";
    //         default:
    //             return "green";
    //     }
    // }


    // function getColor(depth) {
    //     if (depth > 90) {
    //         depth = "red";
    //     } else if (depth < 50) {
    //         depth = "orange";
    //     } else if (depth < 20) {
    //         depth = "green";
    //     }
    // }

    function getColor(d) {
        var mapScale = chroma.scale(['#008000', '#ffb700', '#ff0000'])
            .classes([-10, 10, 20, 50, 70, 90]);
        return mapScale(d)
    }

    // var getColor = chroma.scale(['#008000', '#ff0000']).domain([0, 1000], 3, 'log');
    // console.log(getColor)

    // function markerSize(depth) {
    //     return .2;
    // }

    var earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng, {
                radius: feature.properties.mag * 5,
                fillColor: getColor(feature.geometry.coordinates[2]),
                color: "grey",
                weight: 1,
                opacity: 1,
                fillOpacity: feature.geometry.coordinates[2] / 5
            });
        }
    })

    // Sending our earthquakes layer to the createMap function
    createMap(earthquakes);
}

//######################################

function createMap(earthquakes) {

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
        Earthquakes: earthquakes
    };

    // Create our map, giving it the streetmap and earthquakes layers to display on load
    var myMap = L.map("map", {
        center: [
            37.09, -95.71
        ],
        zoom: 5,
        layers: [streetmap, earthquakes]
    });

    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);


    // // Set up the legend
    var legend = L.control({ position: "bottomright" });
    legend.onAdd = function() {
        var div = L.DomUtil.create("div", "info legend");
        var limits = [-10, 10, 30, 50, 70, 90];
        var colors = ['#008000', '#a7cc00', '#ffed00', '#ffb700', '#ff7a00', '#ff0000']
        var labels = [];

        // Add min & max
        var legendInfo = "<h1>Depth</h1>" +
            "<div class=\"labels\">" + limits +
            "<div class=\"min\">" + limits[0] + "</div>" +
            "<div class=\"max\">" + limits[limits.length - 1] + "</div>" +
            "</div>";

        div.innerHTML = legendInfo;

        limits.forEach(function(limit, index) {
            labels.push("<li style=\"background-color: " + colors[index] + "\"></li>");
        });

        div.innerHTML += "<ul>" + labels.join("") + "</ul>";
        return div;
    };



    // Adding legend to the map
    legend.addTo(myMap);
}