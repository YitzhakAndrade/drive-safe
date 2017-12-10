// Redimensionar o mapa para ficar na tela toda
$(document).ready(function () {
    var bodyheight = $(window).height();
    $("#googleMap").height(bodyheight - 110);
});

// for the window resize
$(window).resize(function () {
    var bodyheight = $(window).height();
    $("#googleMap").height(bodyheight - 110);
});


var map
var directionsRenderer
var directionsService
var all_markers = []


function initialize() {
    var mapProp = {
        center: new google.maps.LatLng(-19.858139, -43.919193),
        zoom: 15,
        panControl: true,
        zoomControl: true,
        mapTypeControl: true,
        scaleControl: false,
        streetViewControl: false,
        overviewMapControl: false,
        rotateControl: true,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    map = new google.maps.Map(document.getElementById("googleMap"), mapProp)    
    directionsRenderer = new google.maps.DirectionsRenderer()
    directionsService = new google.maps.DirectionsService()

}
google.maps.event.addDomListener(window, 'load', initialize);


function TracarRota(origem, destino) {

    directionsRenderer.setMap(map)

    var request = {
        origin: origem,
        destination: destino,
        travelMode: google.maps.DirectionsTravelMode.DRIVING
    }

    directionsService.route(request, function (response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            directionsRenderer.setDirections(response)
        }
    })
}


$(document).ready(function () {

    $('#txtOrigem').val('av artur guimaraes, 976')
    $('#txtDestino').val('rua walter ianni, 355')

    $("#btnBuscarRota").click(function(e) {
        e.preventDefault()

        var origem = $('#txtOrigem').val()
        var destino = $('#txtDestino').val()

        TracarRota(origem, destino)
        BuscarAcidentes(origem, destino)
    })
})

function BuscarAcidentes(origem, destino) {

    for (var i = 0; i < all_markers.length; i++) {
      all_markers[i].setMap(null);
    }
    all_markers = []

    var url = 'https://drive-safe-hackacity.herokuapp.com/BuscarAcidentes?origem=' + origem + '&destino=' + destino

    $.get(url).done(function (data) {
        $.each(JSON.parse(data.acidentes), function (index, value) {
            PlotarMarcador(value.lat, value.log)
        })
    })
}


function PlotarMarcador(lat, lng) {

    var posicao = { lat: parseFloat(lat), lng: parseFloat(lng) }

    var marker = new google.maps.Marker({
        map: map,
        clickable: false,
        shadow: null,
        zIndex: 999,
        position: posicao,
        icon: new google.maps.MarkerImage('http://lh3.ggpht.com/hx6IeSRualApBd7KZB9s2N7bcHZIjtgr9VEuOxHzpd05_CZ6RxZwehpXCRN-1ps3HuL0g8Wi=w9-h9'),
    })

    all_markers.push(marker)
}