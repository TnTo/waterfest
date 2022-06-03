function load(path) {
    return $.ajax({
        url: path,
        async: false,
        dataType: 'json'
    }).responseJSON
}

function highlightFeature(e) {
    var highlightLayer = e.target;
    highlightLayer.openPopup();
}

function popup(feature, layer, content) {
    layer.on({
        mouseout: function (e) {
            if (typeof layer.closePopup == 'function') {
                layer.closePopup();
            } else {
                layer.eachLayer(function (feature) {
                    feature.closePopup()
                });
            }
        },
        mouseover: highlightFeature,
    });
    layer.bindPopup(content, { maxHeight: 400 });
}

function create_map() {

    // Create MAP object

    var map = L.map('map').setView([44.420, 8.800], 9).setMaxBounds([[45, 7], [42, 11]]).setMinZoom(8);
    var layerControl = L.control.layers({}, {}).addTo(map);

    // Create fixed background

    /*var wmsLayer = L.tileLayer.wms('https://www.gebco.net/data_and_products/gebco_web_services/web_map_service/mapserv?', {
        layers: 'GEBCO_LATEST_SUB_ICE_TOPO'
    }).addTo(map);*/

    /*var tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);*/

    var esri_layer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Sources: Esri, Maxar, Earthstar Geographics, and the GIS User Community'
    });

    var lineadicosta_layer = L.geoJSON(load("./data/LineadiCosta.geojson"), {
        style: {
            opacity: 1,
            color: 'rgba(27,30,33,1.0)',
            weight: 2.0,
            fill: true,
            fillOpacity: 0.3,
            fillColor: 'rgba(211,205,205,1.0)',
            interactive: false
        }
    });

    var piattaformacontinentale_layer = L.geoJSON(load("./data/PiattaformaContinentale.geojson"), {
        style: {
            opacity: 1,
            color: 'rgba(30,190,190,1.0)',
            weight: 2.0,
            fill: false,
            interactive: false
        }
    });

    var areasimulazione_layer = L.geoJSON(load("./data/Areasimulazione.geojson"), {
        style: {
            opacity: 1,
            color: 'rgba(250,30,30,1.0)',
            weight: 2.0,
            fill: false,
            interactive: false
        }
    });

    L.layerGroup(
        [esri_layer, lineadicosta_layer, piattaformacontinentale_layer, areasimulazione_layer],
        { interactive: false }
    ).addTo(map);

    // Create sceario base

    var ventoeonde_base_layer = L.geoJSON(load("./data/ventoeonde/Base.geojson"), {
        pointToLayer: (feature, latlng) => {
            return L.circleMarker(latlng, {
                radius: 8.0,
                opacity: 1,
                color: 'rgba(35,35,35,1.0)',
                weight: 1,
                fill: true,
                fillOpacity: 1,
                fillColor: 'rgba(248,93,26,1.0)',
                interactive: true,
            });
        },
        onEachFeature: (feature, layer) => popup(feature, layer,
            '<table>\
                    <tr>\
                        <th scope="row">Vento m/s</th>\
                        <td>' + (feature.properties['Vento m/s'] !== null ? feature.properties['Vento m/s'].toLocaleString() : '') + '</td>\
                    </tr>\
                    <tr>\
                        <th scope="row">Onde</th>\
                        <td>' + (feature.properties['Onde'] !== null ? feature.properties['Onde'].toLocaleString() : '') + '</td>\
                    </tr>\
                </table>'
        )
    });

    var base_scenario = L.layerGroup([ventoeonde_base_layer]).addTo(map);
    layerControl.addBaseLayer(base_scenario, "Base")


}

document.addEventListener('DOMContentLoaded', (event) => {
    create_map();
})