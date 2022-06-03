function load(path) {
    var httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', path);
    httpRequest.send();
    console.log(httpRequest.responseText);
    return httpRequest.responseText;
}

function create_map() {
    var map = L.map('map').setView([44.420, 8.800], 10).setMaxBounds([[45, 6], [41, 11]]).setMinZoom(8);

    function geojson_layer(path, style = {}, pane = "default", zIndex = 400) {
        map.createPane(pane);
        map.getPane(pane).style.ZIndex = zIndex;
        $.getJSON(path, (json) =>
            L.geoJSON(json, {
                style: style,
                pane: pane
            }).addTo(map)
        );
    }

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


    geojson_layer("./data/LineadiCosta.geojson", {
        opacity: 1,
        color: 'rgba(27,30,33,1.0)',
        weight: 2.0,
        fill: true,
        fillOpacity: 0.3,
        fillColor: 'rgba(211,205,205,1.0)',
        interactive: false
    }, "lineadicosta_pane", 401);

    geojson_layer("./data/PiattaformaContinentale.geojson", {
        opacity: 1,
        color: 'rgba(30,190,190,1.0)',
        weight: 2.0,
        fill: false,
        interactive: false
    }, "piattaformacontinentale_pane", 401);

    geojson_layer("./data/Areasimulazione.geojson", {
        opacity: 1,
        color: 'rgba(250,30,30,1.0)',
        weight: 2.0,
        fill: false,
        interactive: false
    }, "areasimulazione_pane", 403);

}

document.addEventListener('DOMContentLoaded', (event) => { create_map() })