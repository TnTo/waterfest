function load(path) {
    return $.ajax({
        url: path,
        async: false,
        dataType: 'json'
    }).responseJSON
}

function popup(feature, layer, content, onposition = false) {
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
        mouseover: function (e) {
            if (onposition) {
                e.target.openPopup(e.latlng)
            } else {
                e.target.openPopup();
            }
        },
    });
    layer.bindPopup(content, { maxHeight: 400 });
}

function habitat_layer(path, fillcolor) {
    return L.geoJSON(load(path), {
        interactive: true,
        pane: 'scenarios',
        style: {
            opacity: 1,
            color: 'rgba(35,35,35,1.0)',
            weight: 1.0,
            fill: true,
            fillOpacity: 1,
            fillColor: fillcolor,
            interactive: true,
        },
        onEachFeature: (feature, layer) => popup(feature, layer,
            '<table>\
                <tr>\
                    <td colspan="2"><strong>Nome</strong><br />' + (feature.properties['Name'] !== null ? feature.properties['Name'] : '') + '</td>\
                </tr>\
                <tr>\
                    <th scope="row">Descrizione</th>\
                    <td>' + (feature.properties['Descrizion'] !== null ? feature.properties['Descrizion'] : '') + '</td>\
                </tr>\
                <tr>\
                    <th scope="row">Immagine</th>\
                    <td>' + (feature.properties['Immagine'] !== null ? '<img src="images/' + String(feature.properties['Immagine']).replace(/[\\\/:]/g, '_').trim() + '">' : '') + '</td>\
                </tr>\
            </table>',
            true
        )
    })
}

function create_map() {

    // Create map object

    var map = L.map('map').setView([44.420, 8.800], 9).setMaxBounds([[45, 7], [42, 11]]).setMinZoom(8);

    // Create fixed background

    map.createPane('lineadicosta');
    map.getPane('lineadicosta').style.zIndex = 450;

    map.createPane('base_overlay');
    map.getPane('base_overlay').style.zIndex = 455;

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
        },
        pane: 'lineadicosta'
    });

    var piattaformacontinentale_layer = L.geoJSON(load("./data/PiattaformaContinentale.geojson"), {
        style: {
            opacity: 1,
            color: 'rgba(30,190,190,1.0)',
            weight: 2.0,
            fill: false,
            interactive: false
        },
        pane: 'base_overlay'
    });

    var areasimulazione_layer = L.geoJSON(load("./data/Areasimulazione.geojson"), {
        style: {
            opacity: 1,
            color: 'rgba(250,30,30,1.0)',
            weight: 2.0,
            fill: false,
            interactive: false
        },
        pane: 'base_overlay'
    });

    L.layerGroup(
        [esri_layer, piattaformacontinentale_layer, areasimulazione_layer],
        { interactive: false }
    ).addTo(map);

    // Create sceario base

    map.createPane('scenarios');
    map.getPane('scenarios').style.zIndex = 460;

    var ventoeonde_base_layer = L.geoJSON(load("./data/ventoeonde/Base.geojson"), {
        interactive: true,
        pane: 'scenarios',
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
                pane: 'scenarios',
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

    var alghefotofile_base_layer = habitat_layer(
        "./data/habitat/Alghe_fotofile.geojson",
        'rgba(34,100,34,1.0)'
    );

    var alghesciafile_base_layer = habitat_layer(
        "./data/habitat/Alghe_sciafile.geojson",
        'rgba(50,180,80,1.0)'
    );

    var caulerpa_base_layer = habitat_layer(
        "./data/habitat/Caulerpa.geojson",
        'rgba(28,192,42,1.0)'
    );

    var coralligeno_base_layer = habitat_layer(
        "./data/habitat/Coralligeno.geojson",
        'rgba(231,133,72,1.0)'
    );

    var cymodocea_base_layer = habitat_layer(
        "./data/habitat/Cymodocea_nodosa.geojson",
        'rgba(125,153,216,1.0)'
    );

    var posidonia_base_layer = habitat_layer(
        "./data/habitat/Posidonia_oceanica.geojson",
        'rgba(114,152,239,1.0)'
    );

    var esposizione_attuale_layer = L.geoJSON(load("./data/Esposizione_attuale_2000.geojson"), {
        interactive: true,
        pane: 'scenarios',
        pointToLayer: (feature, latlng) => {
            var fillcolor = (feature) => {
                switch (feature.properties['Esposizione']) {
                    case "MOLTO BASSA": return 'rgba(250,0,0,1.0)';
                    case "BASSA": return 'rgba(0,250,0,1.0)';
                    case "MEDIA": return 'rgba(0,0,250,1.0)';
                    case "ALTA": return 'rgba(250,250,0,1.0)';
                    case "MOLTO ALTA": return 'rgba(0,250,250,1.0)';
                }
            }
            return L.circleMarker(latlng, {
                radius: 6.5,
                opacity: 1,
                color: 'rgba(35,35,35,1.0)',
                weight: 1,
                fill: true,
                fillOpacity: 1,
                fillColor: fillcolor(feature),
                interactive: true,
                pane: 'scenarios',
            })
        },
        onEachFeature: (feature, layer) => popup(feature, layer,
            '<table>\
                <tr>\
                    <td colspan="2">' + (feature.properties['fid'] !== null ? feature.properties['fid'] : '') + '</td>\
                </tr>\
                <tr>\
                    <th scope="row">Vento</th>\
                    <td>' + (feature.properties['Vento'] !== null ? feature.properties['Vento']
                : '') + '</td>\
                </tr>\
                <tr>\
                    <th scope="row">Onde</th>\
                    <td>' + (feature.properties['Onde'] !== null ? feature.properties['Onde'] : '') + '</td>\
                </tr>\
                <tr>\
                    <th scope="row">Mareggiata</th>\
                    <td>' + (feature.properties['Mareggiata'] !== null ? feature.properties['Mareggiata'] : '') + '</td>\
                </tr>\
                <tr>\
                    <th scope="row">Elevazione</th>\
                    <td>' + (feature.properties['Elevazione'] !== null ? feature.properties['Elevazione'] : '') + '</td>\
                </tr>\
                <tr>\
                    <th scope="row">Habitat</th>\
                    <td>' + (feature.properties['Habitat'] !== null ? feature.properties['Habitat'] : '') + '</td>\
                </tr>\
                <tr>\
                    <th scope="row">Esposizione</th>\
                    <td>' + (feature.properties['Esposizione'] !== null ? feature.properties['Esposizione'] : '') + '</td>\
                </tr>\
            </table>'
        )
    });

    var base_scenario = L.layerGroup([
        lineadicosta_layer, ventoeonde_base_layer, alghefotofile_base_layer, alghesciafile_base_layer, caulerpa_base_layer,
        coralligeno_base_layer, cymodocea_base_layer, posidonia_base_layer, esposizione_attuale_layer
    ]).addTo(map) // default layer group



    // Create control to select layer group
    var layerControl = L.control.layers({
        "Base": base_scenario,
    }, {
        "Area Simulazione": areasimulazione_layer
    }).addTo(map);


}

document.addEventListener('DOMContentLoaded', (event) => {
    create_map();
})