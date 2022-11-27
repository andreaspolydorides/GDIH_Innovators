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

// Country Search Autocomplete feauture

function autocomplete(inp, arr) {
    /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/
    var currentFocus;
    /*execute a function when someone writes in the text field:*/
    inp.addEventListener("input", function(e) {
        var a, b, i, val = this.value;
        /*close any already open lists of autocompleted values*/
        closeAllLists();
        if (!val) { return false;}
        currentFocus = -1;
        /*create a DIV element that will contain the items (values):*/
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        /*append the DIV element as a child of the autocomplete container:*/
        this.parentNode.appendChild(a);
        /*for each item in the array...*/
        for (i = 0; i < arr.length; i++) {
          /*check if the item starts with the same letters as the text field value:*/
          if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
            /*create a DIV element for each matching element:*/
            b = document.createElement("DIV");
            /*make the matching letters bold:*/
            b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
            b.innerHTML += arr[i].substr(val.length);
            /*insert a input field that will hold the current array item's value:*/
            b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
            /*execute a function when someone clicks on the item value (DIV element):*/
                b.addEventListener("click", function(e) {
                /*insert the value for the autocomplete text field:*/
                inp.value = this.getElementsByTagName("input")[0].value;
                /*close the list of autocompleted values,
                (or any other open lists of autocompleted values:*/
                closeAllLists();
            });
            a.appendChild(b);
          }
        }
    });
    /*execute a function presses a key on the keyboard:*/
    inp.addEventListener("keydown", function(e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
          /*If the arrow DOWN key is pressed,
          increase the currentFocus variable:*/
          currentFocus++;
          /*and and make the current item more visible:*/
          addActive(x);
        } else if (e.keyCode == 38) { //up
          /*If the arrow UP key is pressed,
          decrease the currentFocus variable:*/
          currentFocus--;
          /*and and make the current item more visible:*/
          addActive(x);
        } else if (e.keyCode == 13) {
          /*If the ENTER key is pressed, prevent the form from being submitted,*/
          e.preventDefault();
          if (currentFocus > -1) {
            /*and simulate a click on the "active" item:*/
            if (x) x[currentFocus].click();
          }
        }
    });
    function addActive(x) {
      /*a function to classify an item as "active":*/
      if (!x) return false;
      /*start by removing the "active" class on all items:*/
      removeActive(x);
      if (currentFocus >= x.length) currentFocus = 0;
      if (currentFocus < 0) currentFocus = (x.length - 1);
      /*add class "autocomplete-active":*/
      x[currentFocus].classList.add("autocomplete-active");
    }
    function removeActive(x) {
      /*a function to remove the "active" class from all autocomplete items:*/
      for (var i = 0; i < x.length; i++) {
        x[i].classList.remove("autocomplete-active");
      }
    }
    function closeAllLists(elmnt) {
      /*close all autocomplete lists in the document,
      except the one passed as an argument:*/
      var x = document.getElementsByClassName("autocomplete-items");
      for (var i = 0; i < x.length; i++) {
        if (elmnt != x[i] && elmnt != inp) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }
  /*execute a function when someone clicks in the document:*/
  document.addEventListener("click", function (e) {
      closeAllLists(e.target);
  });
  } 

autocomplete(document.getElementById("myInput"), countryList);


// Fills modal appropriately

function modalInnerContent(country) {
    var overviewModal = '<div class="accordion" id="countryAccordion">';
    var iterator = 0;
    westPacific.innovations.forEach(function(item) {
        if (country.toUpperCase() === item["Country (of Origin)"].toUpperCase()) {
            iterator += 1;
            overviewModal += '<div class="accordion-item"><h2 class="accordion-header" id="heading' + iterator.toString() + '">';
            overviewModal += '<button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse'
            + iterator.toString() + '" aria-expanded="false" aria-controls="collapse' + iterator.toString()
            + '">' + item.Name + '</button></h2>';
            overviewModal += '<div id="collapse' + iterator.toString() + '" class="accordion-collapse collapse" aria-labelledby="heading' + iterator.toString() + '" data-bs-parent="#countryAccordion"><div class="accordion-body">'
            + 'Link (if available): <a href="' + item.Link + '" target="_blank" rel="noopener noreferrer">' + item.Link + '</a></br>More data about the innovation should go here' + '</div></div></div>';
        }
    });
    overviewModal += '</div>';
    document.getElementById("nav-overview").innerHTML = overviewModal;
}


