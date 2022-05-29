var map = L.map('map').setView([44.420, 8.800], 10);

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
