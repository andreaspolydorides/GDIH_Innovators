var map = L.map('map', {
    preferCanvas: true
}).setView([55, 0], 4);

var tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 10,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

map.setMinZoom(map.getZoom()-1)
map.fitBounds([[-85.0511, -180], [85.0511, 180]], true);
map.setMinZoom(map.getZoom());

function map_onResize(e){    
    map.setMinZoom(map.getZoom()-1)
    map.fitBounds([[-85.0511, -180], [85.0511, 180]], true);
    map.setMinZoom(map.getZoom());
    map.setMaxZoom(10);
}

map.zoomControl.remove();

L.control.zoom({
    position: 'bottomright'
}).addTo(map);

var southWest = L.latLng(-85.0511, -180),
northEast = L.latLng(85.0511, 180);
var bounds = L.latLngBounds(southWest, northEast);

map.setMaxBounds(bounds);
map.on('drag', function() {
    map.panInsideBounds(bounds, { animate: false });
});

var geojson;

function getColor(d) {
    return d > 10 ? '#3f007d' :
           d > 5  ? '#54278f' :
           d > 1  ? '#6a51a3' :
           d > 0.5  ? '#807dba' :
           d > 0.1  ? '#9e9ac8' :
           d > 0.05  ? '#bcbddc' :
           d > 0.01  ? '#dadaeb' :
           d > 0.001  ? '#efedf5' :
                      '#fcfbfd';
}

// create object with innovations per country for each country
var inno_per_country = new Object();
westPacific.innovations.forEach(function(item) {
    if (!(item["Country (of Origin)"] in inno_per_country)) {
        inno_per_country[item["Country (of Origin)"]] = 1;
    }
    else {
        inno_per_country[item["Country (of Origin)"]] += 1;
    }
});

function style(feature) {
    let num_innovations = inno_per_country[feature.properties.ADMIN];
    return {
        fillColor: getColor(num_innovations/(feature.properties.POP_EST/10000000)),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    };
}

// listeners
function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });

    layer.bringToFront();
}

function resetHighlight(e) {
    geojson.resetStyle(e.target);
}

function zoomToFeature(e) {
    var layer = e.target;
    map.fitBounds(e.target.getBounds());
    // and also set that country's quick info box and prepare modal
    info.update(layer.feature.properties);
    // update the modal that could pop up
    // make the title be the country name
    document.getElementById("countryModalHeader").innerHTML = '<h1 class="modal-title fs-5" id="countryModalLabel">' + 
    layer.feature.properties.ADMIN + 
    '</h1><button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>';
    // get the innovations related to the country
    modalInnerContent(layer.feature.properties.ADMIN);

}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}

geojson = L.geoJson(countriesData, {
    style: style,
    onEachFeature: onEachFeature
}).addTo(map);


var info = L.control({
    position: 'bottomleft'
});

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
};

// method that we will use to update the control based on feature properties passed
info.update = function (props) {
    this._div.innerHTML = '<h4>Innovation Data</h4>' +  (props ?
        '<b>' + props.ADMIN + '</b><br />' + (!(props.ADMIN in inno_per_country) ? 'No innovations listed' + '<br />' + 
        '<button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#countryModal" disabled>Detailed view</button>'
        : inno_per_country[props.ADMIN].toString() + ' innovations listed' + '<br />' + 
        '<button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#countryModal">Detailed view</button>')
        : 'Click on a country');
};

info.addTo(map);


var madeDropdownHTML;
makeDropdownHTML();

function makeDropdownHTML() {
    if (!madeDropdownHTML) {
        madeDropdownHTML = true;
        let searchDropdown = '<select name="select_box" class="form-select" id="select_box"><option value="">Country</option>';
        countryList.forEach(item => (searchDropdown += '<option value="' + item + '">' + item + '</option>'));
        searchDropdown += '</select>';
        document.getElementById("countrySearchContainer").innerHTML = searchDropdown;
    }
}


function modalInnerContent(country) {
    var innerModal = '<div class="accordion" id="countryAccordion">';
    var iterator = 0;
    westPacific.innovations.forEach(function(item) {
        if (country.toUpperCase() === item["Country (of Origin)"].toUpperCase()) {
            iterator += 1;
            innerModal += '<div class="accordion-item"><h2 class="accordion-header" id="heading' + iterator.toString() + '">';
            innerModal += '<button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse'
            + iterator.toString() + '" aria-expanded="false" aria-controls="collapse' + iterator.toString()
            + '">' + item.Name + '</button></h2>';
            innerModal += '<div id="collapse' + iterator.toString() + '" class="accordion-collapse collapse" aria-labelledby="heading' + iterator.toString() + '" data-bs-parent="#countryAccordion"><div class="accordion-body">'
            + 'Link (if available): <a href="' + item.Link + '" target="_blank" rel="noopener noreferrer">' + item.Link + '</a></br>More data about the innovation should go here' + '</div></div></div>';
        }
    });
    innerModal += '</div>';
    document.getElementById("countryInfo").innerHTML = innerModal;
}


