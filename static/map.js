var map = L.map('map').setView([55, 0], 4);

var tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    minZoom: 2,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

map.zoomControl.remove();

L.control.zoom({
    position: 'bottomright'
}).addTo(map);

var southWest = L.latLng(-89.98155760646617, -180),
northEast = L.latLng(89.99346179538875, 180);
var bounds = L.latLngBounds(southWest, northEast);

map.setMaxBounds(bounds);
map.on('drag', function() {
    map.panInsideBounds(bounds, { animate: false });
});

L.geoJson(countriesData).addTo(map);

let searchDropdown = '<select name="select_box" class="form-select" id="select_box"><option value="">Select Country</option>';

countryList.forEach(makeSearchHTML);

function makeSearchHTML(item) {
    searchDropdown += '<option value="' + item + '">' + item + '</option>';
};

searchDropdown += '</select>';

document.getElementById("countrySearchContainer").innerHTML = searchDropdown;