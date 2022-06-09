function load(path) {
    return $.ajax({
        url: path,
        async: false,
        dataType: 'json',
    }).responseJSON;
}

function popup(_feature, layer, content) {
    layer.on({
        mouseout: () => layer.closePopup(),
        mouseover: (e) => e.target.openPopup(e.latlng),
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
        onEachFeature: (feature, layer) =>
            popup(
                feature,
                layer,
                `<table>
                    <tr>
                        <th scope="row">
                            Nome
                        </th>
                        <td>
                            ${feature.properties['Name'] ?? ''}
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">
                            Descrizione
                        </th>
                        <td>
                            ${feature.properties['Descrizion'] ?? ''}
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">
                            Immagine
                        </th>
                        <td>
                        ${
                            feature.properties['Immagine']
                                ? `<img style="max-width:200px; max-height:175px;" src="${String(
                                      feature.properties['Immagine']
                                  )}">`
                                : ''
                        }</td>
                    </tr>
                </table>`
            ),
    });
}

function exposition_layer(path) {
    const fillColors = {
        'MOLTO BASSA': '#0000ff',
        BASSA: '#3399ff',
        MEDIA: '#ffffff',
        ALTA: '#ff6666',
        MASSIMA: '#ff0000',
    };

    const popup_exp = (feature) => {
        let setupTable = '<table>';

        for (const [key, value] of Object.entries(feature.properties)) {
            if (key === 'fid') {
                setupTable += `<tr>
                        <td colspan="2"}>
                            ${value}
                        </td>
                        </tr>`;
            } else {
                setupTable += `<tr>
                        <th scope="row">
                            ${key}
                        </th>
                        <td>
                            ${value}
                        </td>
                        </tr>`;
            }
        }
        setupTable += '</table>';

        return setupTable;
    };

    return L.geoJSON(load(path), {
        interactive: true,
        pane: 'scenarios',
        pointToLayer: (feature, latlng) => {
            return L.circleMarker(latlng, {
                radius: radius_multiplier * 6.5,
                opacity: 1,
                color: 'rgba(35,35,35,1.0)',
                weight: 1,
                fill: true,
                fillOpacity: 1,
                fillColor: fillColors[feature.properties['Esposizione']],
                interactive: true,
                pane: 'scenarios',
            });
        },
        onEachFeature: (feature, layer) =>
            popup(feature, layer, popup_exp(feature)),
    });
}

var radius_multiplier = window.matchMedia('only screen and (max-width: 760px)')
    .matches
    ? 1.5
    : 1.0;

function create_map() {
    // Create map object

    let map = L.map('map')
        .setView([44.42, 8.8], 9)
        .setMaxBounds([
            [45, 7],
            [42, 11],
        ])
        .setMinZoom(8);

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

    const esri_layer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
            attribution:
                'Sources: Esri, Maxar, Earthstar Geographics, and the GIS User Community',
        }
    );

    // Costal line

    const lineadicosta_layer = L.geoJSON(
        load('./data/landmass/LineadiCosta.geojson'),
        {
            style: {
                opacity: 1,
                color: 'rgba(27,30,33,1.0)',
                weight: 2.0,
                fill: true,
                fillOpacity: 0.3,
                fillColor: 'rgba(211,205,205,1.0)',
                interactive: false,
            },
            pane: 'lineadicosta',
        }
    );

    const lineadicosta_no_porto_layer = L.geoJSON(
        load('./data/landmass/Linea_di_Costa_no_porto.geojson'),
        {
            style: {
                opacity: 1,
                color: 'rgba(27,30,33,1.0)',
                weight: 2.0,
                fill: true,
                fillOpacity: 0.3,
                fillColor: 'rgba(211,205,205,1.0)',
                interactive: false,
            },
            pane: 'lineadicosta',
        }
    );

    // Continental shelf

    const piattaformacontinentale_layer = L.geoJSON(
        load('./data/PiattaformaContinentale.geojson'),
        {
            style: {
                opacity: 1,
                color: 'rgba(30,190,190,1.0)',
                weight: 2.0,
                fill: false,
                interactive: false,
            },
            pane: 'base_overlay',
        }
    );

    // Area simulazione

    const areasimulazione_layer = L.geoJSON(
        load('./data/Areasimulazione.geojson'),
        {
            style: {
                opacity: 1,
                color: 'rgba(250,30,30,1.0)',
                weight: 2.0,
                fill: false,
                interactive: false,
            },
            pane: 'base_overlay',
        }
    );

    // Create scenarios

    map.createPane('scenarios');
    map.getPane('scenarios').style.zIndex = 460;

    // Wind and Waves

    const ventoeonde_base_layer = L.geoJSON(
        load('./data/ventoeonde/Base.geojson'),
        {
            interactive: true,
            pane: 'scenarios',
            pointToLayer: (_feature, latlng) => {
                return L.circleMarker(latlng, {
                    radius: radius_multiplier * 8.0,
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
            onEachFeature: (feature, layer) =>
                popup(
                    feature,
                    layer,
                    `<table>
                        <tr>
                            <th scope="row">
                                Vento m/s
                            </th>\
                            <td>${feature.properties['Vento m/s'] ?? ''}</td>
                        </tr>
                        <tr>
                            <th scope="row">
                                Onde
                            </th>
                            <td>${feature.properties['Onde'] ?? ''}</td>
                        </tr>\
                    </table>`
                ),
        }
    );

    // Habitat

    //Base

    const alghefotofile_base_layer = habitat_layer(
        './data/habitat/base_habitats/Alghe_fotofile.geojson',
        'rgba(34,100,34,1.0)'
    );

    const alghesciafile_base_layer = habitat_layer(
        './data/habitat/base_habitats/Alghe_sciafile.geojson',
        'rgba(50,180,80,1.0)'
    );

    const caulerpa_base_layer = habitat_layer(
        './data/habitat/base_habitats/Caulerpa.geojson',
        'rgba(28,192,42,1.0)'
    );

    const coralligeno_base_layer = habitat_layer(
        './data/habitat/base_habitats/Coralligeno.geojson',
        'rgba(231,133,72,1.0)'
    );

    const cymodocea_base_layer = habitat_layer(
        './data/habitat/base_habitats/Cymodocea_nodosa.geojson',
        'rgba(125,153,216,1.0)'
    );

    const posidonia_base_layer = habitat_layer(
        './data/habitat/base_habitats/Posidonia_oceanica.geojson',
        'rgba(114,152,239,1.0)'
    );

    const protectionColors = {
        'Protezione nulla / habitat assenti': '#ff0000', 
        'Protezione bassa': '#ff6600', 
        'Protezione media': '#33cc33', 
        'Protezione buona': '#33cc33', 
        'Protezione molto buona': '#33cc33', 
    };

    const protezione_attuale_habitat = L.geoJSON(
        load('./data/exposure/Esposizione_attuale_2000.geojson'),
        {
            interactive: true,
            pane: 'scenarios',
            pointToLayer: (feature, latlng) => {
                return L.circleMarker(latlng, {
                    radius: radius_multiplier * 6.5,
                    opacity: 1,
                    color: 'rgba(35,35,35,1.0)',
                    weight: 1,
                    fill: true,
                    fillOpacity: 1,
                    fillColor: protectionColors[feature.properties['Habitat']],
                    interactive: true,
                    pane: 'scenarios',
                });
            },
            onEachFeature: (feature, layer) =>
                popup(
                    feature,
                    layer,
                    '<table>\
                <tr>\
                    <th scope="row">Habitat</th>\
                    <td>' +
                        (feature.properties['Habitat'] ?? '') +
                        '</td>\
                </tr>\
            </table>'
                ),
        }
    );

    // modified
    const posidonia_mod_layer = habitat_layer(
        './data/habitat/modified_habitats/posidonia_oceanica.geojson',
        'rgba(114,152,239,1.0)'
    );

    const coralligeno_mod_layer = habitat_layer(
        './data/habitat/modified_habitats/coralligeno.geojson',
        'rgba(231,133,72,1.0)'
    );

    // expositions

    const esposizione_attuale_layer = exposition_layer(
        './data/exposure/Esposizione_attuale_2000.geojson'
    );

    const esposizione_habitat_mod_layer = exposition_layer(
        './data/exposure/esposizione_habitat_modificati.geojson'
    );

    const esposizione_no_diga_layer = exposition_layer(
        './data/exposure/Exposure_no_diga_Genova.geojson'
    );

    // Layer groups aka scenarios

    L.layerGroup(
        [esri_layer, piattaformacontinentale_layer, areasimulazione_layer],
        { interactive: false }
    ).addTo(map);

    const base_scenario = L.layerGroup([
        lineadicosta_layer,
        ventoeonde_base_layer,
        alghefotofile_base_layer,
        alghesciafile_base_layer,
        caulerpa_base_layer,
        coralligeno_base_layer,
        cymodocea_base_layer,
        posidonia_base_layer,
        esposizione_attuale_layer,
    ]).addTo(map); // default layer group

    const habitat_scenario = L.layerGroup([
        lineadicosta_layer,
        ventoeonde_base_layer,
        alghefotofile_base_layer,
        alghesciafile_base_layer,
        caulerpa_base_layer,
        coralligeno_mod_layer,
        cymodocea_base_layer,
        posidonia_mod_layer,
        esposizione_habitat_mod_layer,
    ]); // default layer group

    const diga_scenario = L.layerGroup([
        lineadicosta_no_porto_layer,
        ventoeonde_base_layer,
        alghefotofile_base_layer,
        alghesciafile_base_layer,
        caulerpa_base_layer,
        coralligeno_base_layer,
        cymodocea_base_layer,
        posidonia_base_layer,
        esposizione_no_diga_layer,
    ]); // default layer group

    // Create control to select layer group
    L.control
        .layers(
            {
                'Situazione Attuale': base_scenario,
                'Habitat Modificati': habitat_scenario,
                'Linea di Costa Modificata': diga_scenario,
            },
            {
                'Area Simulazione': areasimulazione_layer,
                'Protezione Attuale degli Habitat': protezione_attuale_habitat,
            }
        )
        .addTo(map);    
}

document.addEventListener('DOMContentLoaded', () => {
    create_map();
});
