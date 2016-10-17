// JavaScript source code 241ace44b314f7de38e84d4a52062c3b10b9804e

// variables globales
var ville_contrat = "toulouse";
var latitude_origine = 45.8586197;
var longitude_origine = 1.1618575;
var map;
var marker;
var marker_img_icon = '/parkingLot/images/bicycle-marker-icon.png'
var marker_origine;
var iddivmap = "#container-map-initial";
var myLatlng;
var myOptions;
var regex = /[^0-9\-]/g;
class station {
    constructor(short_name,contract_name, number, name, address, available_bikes, available_bike_stands, latitude, longitude) {
        this.short_name = short_name; // contient le nom de la station
        this.contract_name = contract_name;
        this.number = number;
        this.name = name; // concaténation "ID - STATION" format par défaut de l'API 
        this.address = address;
        this.available_bikes = available_bikes;
        this.available_bike_stands = available_bike_stands;
        this.latitude = latitude;
        this.longitude = longitude;
    }
};
var stations = [];

var height = $(window).height();
//$(function () { });

$(iddivmap).css({
    //"width": width,
    "height": height,
    "margin-left": "auto",
    "margin-right": "auto",
});



//localiser la ville contrat , exemple: toulouse
function localiser() {
    geocoder = new google.maps.Geocoder();

    geocoder.geocode({
        'address': ville_contrat
    }, function (results, status) {

        if (status == google.maps.GeocoderStatus.OK) {

            latitude_origine = results[0].geometry.location.lat();

            longitude_origine = results[0].geometry.location.lng();
            console.log(latitude_origine + "-" + longitude_origine);
        }
    });
};


//Créer une map
function createMap() {
    myLatlng = new google.maps.LatLng(latitude_origine, longitude_origine);
    myOptions = {
        zoom: 15,
        center: myLatlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    //map = new google.maps.Map($(iddivmap), myOptions);
    map = new google.maps.Map(document.getElementById('container-map-initial'), myOptions);
};



$(document).ready(function () {
    localiser();
    createMap();



    $.get('https://api.jcdecaux.com/vls/v1/stations?contract=toulouse&apiKey=241ace44b314f7de38e84d4a52062c3b10b9804e', function (response) {
       

        for (var i = 0; i < response.length ; i++) {
            
            var item = new station(
                formatNameStation(response[i].name),
                response[i].contract_name,
                response[i].number,
                response[i].name,
                response[i].address,
                response[i].available_bikes,
                response[i].available_bike_stands,
                response[i].position.lat,
                response[i].position.lng
                );

            stations.unshift(item);
        }
        sortStations();
        addElementToDom();
    });


});

//transformer "0000 - TOTO" en "TOTO"
function formatNameStation(value) {

    var result = value.match(regex);
    var name = result.join("");
    return name.trim();
};


//trier alphabétiquement les stations
function sortStations() {

    stations.sort(compare);
    
};

function compare(a, b) {
    if (a.short_name < b.short_name)
        return -1;
    if (a.short_name > b.short_name)
        return 1;
    return 0;
};


//Ajouter des sections et des listes au DOM
function addElementToDom() {

    for (var i = 0; i < stations.length; i++) {

        $("#parkings").after(

                   "<section id = 'place-" + stations[i].number + "' data-role='page' data-theme='b' >" +
                   "<header data-role='header'>" +
                   "<a href='#parkings' data-theme='b' data-icon='arrow-l' data-iconpos='notext' data-shadow='false' data-iconshadow='false' class='ui-icon-nodisc'></a>" +
                   "<h1>" + stations[i].contract_name + "</h1>" +
                   "<h3>" + stations[i].name + "</h3>" +
                   "</header>" +
                   "<div id='info-station' class='content' data-role='content'>" +
                   "<p id='disponibilite-velo-" + stations[i].number + "' >Velos Disponibles: " + stations[i].available_bikes + "</p>" +
                   "<p id='disponibilite-emplacement-" + stations[i].number + "' >Emplacements Libres: " + stations[i].available_bike_stands + "</p>" +
                   "<p>" + stations[i].address + "</p>" +
                   "<div id='map-" + stations[i].number + "' role='main' ></div>" +
                   "</div>" +
                   "<footer data-role='footer' data-position='fixed' data-theme='b'>" +
                   "<h1>copyright 2016 - CESI</h1>" +
                   "</footer>" +
                   "</section>"

                   );
        $("#liste-velo").append("<li><a href='#place-" + stations[i].number + "' onclick='deplacerMap(" + stations[i].latitude + "," + stations[i].longitude + "," +stations[i].number + ")' >" + stations[i].short_name + "</a></li>");
    }
};

//met à jour les données dans chaque section
function refresh() {

    $.get('https://api.jcdecaux.com/vls/v1/stations?contract=toulouse&apiKey=241ace44b314f7de38e84d4a52062c3b10b9804e', function (response) {
        for (var i = 0; i < response.length ; i++) {
            var dispo_velo = "#disponibilite-velo-" + response[i].number;
            var dispo_emplacement = "#disponibilite-emplacement-" + response[i].number;
            //effacer le contenu de l'élément
            $(dispo_velo).html();
            $(dispo_emplacement).html();
            //insérer la nouvelle donnée dans l'élément
            $(dispo_velo).html("Velos Disponibles: " +response[i].available_bikes);
            $(dispo_emplacement).html("Emplacements Disponibles: "+response[i].available_bike_stands);
            //$(dispo_velo).val(response[i].available_bikes);
            //$(dispo_emplacement).val(response[i].available_bike_stands);
        }
        console.log("station Esquirol : velos = " + $("#disponibilite-velo-10").text() + " stands = " + $("#disponibilite-emplacement-10").text());
    });

    


};

//déplace la map dans un div (id_section) actualisée avec la nouvelle position  
function deplacerMap(latitude, longitude, id_section) {
    var id = "#map-" + id_section;
    var codemap = map.getDiv();
    var position = new google.maps.LatLng(latitude, longitude);
    //positionner un marqueur et centrer la carte sur celui-ci
    marker = new google.maps.Marker({
        position: position,
        icon: marker_img_icon
    });
    //supprimer l'ancien marqueur
    if (marker_origine) {
        marker_origine.setMap(null);
    }
    marker.setMap(map);
    marker_origine = marker;


    //insérer le div googlemap
    $(id).html(codemap);
    if (iddivmap) {
        //efface la map du div précédent
        $(iddivmap).html();
    }
    //stocke l'id actuel
    iddivmap = id;
};

//Pour evite d'afficher un plan grisé
$(document).on("pageshow", function (event, data) {
    if (map) {
        google.maps.event.trigger(map, "resize");
        if (marker) {
            map.setCenter(marker.getPosition());
        }

    }

});

setInterval(refresh, 20000);




