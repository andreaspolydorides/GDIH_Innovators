var map = L.map('map').setView([55, 0], 4);

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

function style() {
    return {
        fillColor: '#6A5ACD',
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
    map.fitBounds(e.target.getBounds());
    info.update(layer.feature.properties);
    console.log(layer.feature.properties.ADMIN)
    //$("#countryModal").modal('show');
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


var info = L.control();

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
};

// method that we will use to update the control based on feature properties passed
info.update = function (props) {
    this._div.innerHTML = '<h4>Country Population</h4>' +  (props ?
        '<b>' + props.ADMIN + '</b><br />' + props.POP_EST + ' people'
        : 'Click on a country');
};

info.addTo(map);


var madeDropdownHTML;
makeDropdownHTML();

function makeDropdownHTML() {
    if (!madeDropdownHTML) {
        madeDropdownHTML = true;
        let searchDropdown = '<select name="select_box" class="form-select" id="select_box"><option value="">Select Country</option>';
        countryList.forEach(item => (searchDropdown += '<option value="' + item + '">' + item + '</option>'));
        searchDropdown += '</select>';
        document.getElementById("countrySearchContainer").innerHTML = searchDropdown;
    }
}


