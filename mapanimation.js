const  markers = [];
const makersBusStop = [];
const route = [];
let counter = 0;
const colors = [
  '#cddc39',
	'#673ab7',
	'#ffc107',
  '#9c27b0',
  '#00bcd4',
	'#795548',
	'#009688',
	'#9e9e9e',
	'#ffeb3b',
	'#8bc34a',
	'#3f51b5',
	'#2196f3',
	'#ff9800',
	'#03a9f4',
	'#ff5722',
	'#f44336',
	'#4caf50',
	'#e91e63',
	'#607d8b'
  ]

// busStops of the regular route
const busStops = [
      [-71.093729, 42.359244,],
      [-71.094915, 42.360175],
      [-71.095800, 42.360698],
      [-71.099558, 42.362953],
      [-71.103476, 42.365248],
      [-71.106067, 42.366806],
      [-71.108717, 42.368355],
      [-71.110799, 42.369192],
      [-71.113095, 42.370218],
      [-71.115476, 42.372085],
      [-71.117585, 42.373016],
      [-71.118625, 42.374863]
];
    
function recordRoute(point) {
  JSON.stringify(route.push(point));
}
// Request bus data from MBTA
(async function run(){
    // get bus data    
	const locations = await getBusLocations();
  liveBusLocation(locations);
	// timer
  setTimeout(run, 7000);
  })();

  // Get data from MTBA boston API
  async function getBusLocations(){
    const url = 'https://api-v3.mbta.com/vehicles?filter[route]=1&include=trip';
    const response = await fetch(url);
    const json     = await response.json();
    return json.data;
};

// Graph each bus in the route #1
  async function liveBusLocation(locations)  {
    locations.forEach((item, index) => {
      let localized = false
      for (let i = 0; i < markers.length; i++) {
        
        if (item.id ===  markers[i].id) {
          markers[i].marker.setLngLat([
            item.attributes.longitude, item.attributes.latitude
          ]);
 
          //Save points of the route
          if (route.length < 3000 && index === 0) {
            setTimeout(recordRoute([
              item.attributes.longitude, item.attributes.latitude
            ]), 15000)};
          //-----------------------------------------------

          let prevData = map.getSource(item.id)._data;
          console.log(prevData);

          prevData.geometry.coordinates.push([
            item.attributes.longitude, item.attributes.latitude
          ]);
          // getSource()  This method is often used to update a source using the instance members for the relevant source type as defined in Sources
          map.getSource(item.id).setData(prevData);
          localized = true
        };
    };

    // If the bus is localized  draw markers
      if (!localized) {
        var bus = document.createElement('div');
        bus.className = 'marker';
        bus.style.backgroundImage = `url(icons/${counter}_bus.png)`;
        bus.style.width = '32px';
        bus.style.height = '32px';
        let marker = new mapboxgl
        /* .Marker(bus, { "color": colors[markers.length] }) */
        .Marker(bus)
        .setLngLat([item.attributes.longitude, item.attributes.latitude])
        .setPopup(new mapboxgl.Popup({ maxWidth: 54, offset: 25, closeOnClick: true, closeButton: true })
        .setHTML(`<h4 style="color:Navy; background-color:white" >Bus ${item.id} </h4>`))
        .addTo(map)
        counter += 1;
        // Draw tracklline of each bus
      map.addSource(item.id, {
        'type': 'geojson',
        'data': {
            'type': 'Feature',
            'properties': {},
            'geometry': {
                'type': 'LineString',
                'coordinates': [
                  [item.attributes.longitude, item.attributes.latitude]
                ]
            }
        }
      })
    
      map.addLayer({
          'id': item.id,
          'type': 'line',
          'source': item.id,
          'layout': {
              'line-join': 'round',
              'line-cap': 'round'
          },
          'paint': {
              'line-color': colors[markers.length],
              'line-width': 2
          }
      })      
      markers.push({id: item.id, marker});
    };
  });
};
/*
---------------------------------------------------------------------------------------- 
 */
//MAP CONFIGURATIONS
//Generate Map, controls
mapboxgl.accessToken =  'pk.eyJ1IjoiZGFudGhiIiwiYSI6ImNrcHIwOTJzMTAwcnQyd25uOWVmNmtqNDEifQ.Vf8oIpeA11oM6cXub83WAA'
var map = new mapboxgl.Map({
    container: 'map',  //element on the DOM
    style: 'mapbox://styles/mapbox/dark-v9',
    center: [-71.093729, 42.359244],
    zoom: 12
});
var canvas = map.getCanvasContainer();
/* 
Two points
*/
var directions = new MapboxDirections({
  accessToken: mapboxgl.accessToken,
  unit: "metric",
  profile: "mapbox/walking",
  alternatives: true,
  geometries: "geojson",
  controls: { instructions: true },
  flyTo: true
});

map.addControl(directions, "bottom-left");
map.scrollZoom.enable();
//Direction control
/* map.addControl(new MapboxGeocoder({
    accessToken: mapboxgl.accessToken
})); */
map.addControl(new mapboxgl.NavigationControl());
map.addControl(new mapboxgl.FullscreenControl());
map.addControl(new mapboxgl.GeolocateControl({
    positionOptions: {
        enableHighAccuracy: true
    },
    trackUserLocation: true
}));
/*
------------------------------------------------------------------------------- 
 */
// Maker done when you click in the map
let markerYo;
map.on('click', function (e) {
    document.getElementById('coordenadas').innerHTML =
  /* JSON.stringify(`CURRENT POINT: Latitud: ${ e.lngLat.lat } ; Longitude: ${ e.lngLat.lng }`); */
  `Point: Latitud: ${ e.lngLat.lat } ; Longitude: ${ e.lngLat.lng }`;

  var coordsObj = e.lngLat;
  canvas.style.cursor = '';
  var coords = Object.keys(coordsObj).map(function (key) {
    
    return coordsObj[key];
  });
  var end = {
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: coords
      }
    }
    ]
  };
  if (map.getLayer('end')) {
    
    map.getSource('end').setData(end);
  } else {
    map.addLayer({
      id: 'end',
      type: 'circle',
      source: {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [{
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'Point',
              coordinates: coords
            }
          }]
        }
      },
      paint: {
        // Draw point 
        'circle-radius': 0,
        'circle-color': '#f30'
      }
    });
    console.log(map.getSource('end'));
  }
});


/* ---------------------------------------------------------------
Draw busStops
 */
busStops.forEach((currentPosition, index) => {
  var el = document.createElement('div');
  el.className = 'marker';
  el.style.backgroundImage = 'url(icons/bus-stop.png)';
  el.style.width = '32px';
  el.style.height = '32px';

  new mapboxgl.Marker(el)
    .setLngLat([currentPosition[0], currentPosition[1]])
    .setPopup(new mapboxgl.Popup({offset: 25, closeOnClick: true, closeButton: true}).setHTML(`<h4 style="color:Navy; background-color:white" >Bus Stop ${index+1} </h4>`))
    .addTo(map);
})

/* ----------------------------------------------------------------------
 */

function relocate_home()
{
     location.href = "https://danthb.github.io/";
} 
