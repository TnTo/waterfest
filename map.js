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
                    <th scope="row"><strong>Nome</strong></th><td>' + (feature.properties['Name'] !== null ? feature.properties['Name'] : '') + '</td>\
                </tr>\
                <tr>\
                    <th scope="row">Descrizione</th>\
                    <td>' + (feature.properties['Descrizion'] !== null ? feature.properties['Descrizion'] : '') + '</td>\
                </tr>\
                <tr>\
                    <th scope="row">Immagine</th>\
                    <td>' + (feature.properties['Immagine'] !== null ? '<img style="max-width:200px; max-height:175px;" src="' + String(feature.properties['Immagine']) + '">' : '') + '</td>\
                </tr>\
            </table>',
            true
        )
    })
}

function exposition_layer(path) {

    function fillcolor_exp(feature) {
        switch (feature.properties['Esposizione']) {
            case "MOLTO BASSA": return '#0000ff';
            case "BASSA": return '#3399ff';
            case "MEDIA": return '#ffffff';
            case "ALTA": return '#ff6666';
            case "MASSIMA": return '#ff0000';
        }
    }

    function popup_exp(feature) {
        return '<table>\
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
        </table>';
    }

    return L.geoJSON(load(path), {
        interactive: true,
        pane: 'scenarios',
        pointToLayer: (feature, latlng) => {
            return L.circleMarker(latlng, {
                radius: 6.5,
                opacity: 1,
                color: 'rgba(35,35,35,1.0)',
                weight: 1,
                fill: true,
                fillOpacity: 1,
                fillColor: fillcolor_exp(feature),
                interactive: true,
                pane: 'scenarios',
            })
        },
        onEachFeature: (feature, layer) => popup(feature, layer, popup_exp(feature))
    });

}

function create_map() {

    // Create map object

    var map = L.map('map').setView([44.420, 8.800], 9).setMaxBounds([[45, 7], [42, 11]]).setMinZoom(8);

    // Create background

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

    /*
    var esri_layer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Sources: Esri, Maxar, Earthstar Geographics, and the GIS User Community'
    });
    */

    // Costal line

    var lineadicosta_layer = L.geoJSON(load("./data/landmass/LineadiCosta.geojson"), {
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

    var lineadicosta_no_porto_layer = L.geoJSON(load("./data/landmass/Linea_di_Costa_no_porto.geojson"), {
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

    // Continental shelf

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

    // Area simulazione

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

    // Create scenarios

    map.createPane('scenarios');
    map.getPane('scenarios').style.zIndex = 460;

    // Wind and Waves

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

    // Habitat

    //Base

    var alghefotofile_base_layer = habitat_layer(
        "./data/habitat/base_habitats/Alghe_fotofile.geojson",
        'rgba(34,100,34,1.0)'
    );

    var alghesciafile_base_layer = habitat_layer(
        "./data/habitat/base_habitats/Alghe_sciafile.geojson",
        'rgba(50,180,80,1.0)'
    );

    var caulerpa_base_layer = habitat_layer(
        "./data/habitat/base_habitats/Caulerpa.geojson",
        'rgba(28,192,42,1.0)'
    );

    var coralligeno_base_layer = habitat_layer(
        "./data/habitat/base_habitats/Coralligeno.geojson",
        'rgba(231,133,72,1.0)'
    );

    var cymodocea_base_layer = habitat_layer(
        "./data/habitat/base_habitats/Cymodocea_nodosa.geojson",
        'rgba(125,153,216,1.0)'
    );

    var posidonia_base_layer = habitat_layer(
        "./data/habitat/base_habitats/Posidonia_oceanica.geojson",
        'rgba(114,152,239,1.0)'
    );

    var protezione_attuale_habitat = L.geoJSON(load("./data/exposure/Esposizione_attuale_2000.geojson"), {
        interactive: true,
        pane: 'scenarios',
        pointToLayer: (feature, latlng) => {
            var fillcolor = (feature) => {
                switch (feature.properties['Habitat']) {
                    case "Protezione nulla / habitat assenti": return '#ff0000'; //controllare colore
                    case "Protezione bassa": return '#ff6600'; //controllare colore
                    case "Protezione media": return '#33cc33'; //controllare colore
                    case "Protezione buona": return '#33cc33'; //controllare colore
                    case "Protezione molto buona": return '#33cc33'; //controllare colore
                }
            }
            return L.circleMarker(latlng, {
                radius: 4.0,
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
                    <th scope="row">Habitat</th>\
                    <td>' + (feature.properties['Habitat'] !== null ? feature.properties['Habitat'] : '') + '</td>\
                </tr>\
            </table>'
        )
    });

    // modified
    var posidonia_mod_layer = habitat_layer(
        "./data/habitat/modified_habitats/posidonia_oceanica.geojson",
        'rgba(114,152,239,1.0)'
    );

    var coralligeno_mod_layer = habitat_layer(
        "./data/habitat/modified_habitats/coralligeno.geojson",
        'rgba(231,133,72,1.0)'
    );

    // expositions 

    var esposizione_attuale_layer = exposition_layer("./data/exposure/Esposizione_attuale_2000.geojson");

    var esposizione_habitat_mod_layer = exposition_layer("./data/exposure/esposizione_habitat_modificati.geojson");

    var esposizione_no_diga_layer = exposition_layer("./data/exposure/Exposure_no_diga_Genova.geojson");


    // Layer groups aka scenarios

    L.layerGroup(
        [/*esri_layer, */piattaformacontinentale_layer, areasimulazione_layer],
        { interactive: false }
    ).addTo(map);

    var base_scenario = L.layerGroup([
        lineadicosta_layer, ventoeonde_base_layer, alghefotofile_base_layer, alghesciafile_base_layer, caulerpa_base_layer,
        coralligeno_base_layer, cymodocea_base_layer, posidonia_base_layer, esposizione_attuale_layer
    ]).addTo(map); // default layer group

    var habitat_scenario = L.layerGroup([
        lineadicosta_layer, ventoeonde_base_layer, alghefotofile_base_layer, alghesciafile_base_layer, caulerpa_base_layer,
        coralligeno_mod_layer, cymodocea_base_layer, posidonia_mod_layer, esposizione_habitat_mod_layer
    ]); // default layer group

    var diga_scenario = L.layerGroup([
        lineadicosta_no_porto_layer, ventoeonde_base_layer, alghefotofile_base_layer, alghesciafile_base_layer, caulerpa_base_layer,
        coralligeno_base_layer, cymodocea_base_layer, posidonia_base_layer, esposizione_no_diga_layer
    ]); // default layer group



    // Create control to select layer group
    var layerControl = L.control.layers({
        "Situazione Attuale": base_scenario,
        "Habitat Modificati": habitat_scenario,
        "Linea di Costa Modificata": diga_scenario,
    }, {
        "Area Simulazione": areasimulazione_layer,
        "Protezione Attuale degli Habitat": protezione_attuale_habitat
    }).addTo(map);


}

document.addEventListener('DOMContentLoaded', (event) => {
    create_map();
})