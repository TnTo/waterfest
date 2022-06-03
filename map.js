function load(path) {
    return $.ajax({
        url: path,
        async: false,
        dataType: 'json'
    }).responseJSON
}

function geojson_layer(path, style = {}) {
    return L.geoJSON(load(path), {
        style: style
    })
}

function create_map() {
    var map = L.map('map').setView([44.420, 8.800], 10).setMaxBounds([[45, 6], [41, 11]]).setMinZoom(8);

    /*var wmsLayer = L.tileLayer.wms('https://www.gebco.net/data_and_products/gebco_web_services/web_map_service/mapserv?', {
        layers: 'GEBCO_LATEST_SUB_ICE_TOPO'
    }).addTo(map);*/

    /*var tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);*/

    var esri_layer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Sources: Esri, Maxar, Earthstar Geographics, and the GIS User Community'
    }).addTo(map);

    var lineadicosta_layer = geojson_layer("./data/LineadiCosta.geojson", {
        opacity: 1,
        color: 'rgba(27,30,33,1.0)',
        weight: 2.0,
        fill: true,
        fillOpacity: 0.3,
        fillColor: 'rgba(211,205,205,1.0)',
        interactive: false
    }).addTo(map);

    var piattaformacontinentale_layer = geojson_layer("./data/PiattaformaContinentale.geojson", {
        opacity: 1,
        color: 'rgba(30,190,190,1.0)',
        weight: 2.0,
        fill: false,
        interactive: false
    }).addTo(map);

    var areasimulazione_layer = geojson_layer("./data/Areasimulazione.geojson", {
        opacity: 1,
        color: 'rgba(250,30,30,1.0)',
        weight: 2.0,
        fill: false,
        interactive: false
    }).addTo(map);

}

document.addEventListener('DOMContentLoaded', (event) => { create_map() })