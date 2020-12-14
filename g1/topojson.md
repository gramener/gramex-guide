# L.TopoJSON

```js
var layer = new L.TopoJSON(topojson_data).addTo(map)
```

adds a TopoJSON layer to a leaflet map. The usage is identical to [L.GeoJSON()](http://leafletjs.com/reference-1.2.0.html#geojson).

Typical usage is below:

```js
$.get('topojson-file.json')
  .done(function(topojson_data) {
    var map = L.map('map-id')
    var layer = new L.TopoJSON(topojson_data).addTo(map)
    map.fitBounds(layer.getBounds())
  })
```
