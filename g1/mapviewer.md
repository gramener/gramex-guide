# g1.mapviewer

Mapviewer is an abstraction over [Leaflet](http://leafletjs.com/) that can
create common GIS applications using configurations.

Mapviewer requires `npm install leaflet d3 d3-scale-chromatic g1`.

```html
<link rel="stylesheet" href="node_modules/leaflet/dist/leaflet.css" />
<script src="node_modules/leaflet/dist/leaflet.js"></script>
<script src="node_modules/d3/build/d3.js"></script>
<script src="node_modules/d3-scale-chromatic/dist/d3-scale-chromatic.min.js"></script>
<script src="node_modules/g1/dist/mapviewer.min.js"></script>
```

This creates a simple base map:

```html
<div id="base-map" style="height:300px"></div>
<script>
  var map = g1.mapviewer({
    id: "base-map",
    layers: {
      worldMap: {
        type: "tile",
        url: "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      },
    },
  });
</script>
```

This loads a [GeoJSON file](test/india-states.geojson), links data from
[state_score.json](test/state_score.json), and sets the fill color from a merged
attribute.

```html
<div id="geojson-map" style="height:300px">
  <script>
    var map = g1.mapviewer({
      id: "geojson-map",
      layers: {
        worldMap: {
          type: "tile",
          url: "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        },
        indiaGeojson: {
          type: "geojson",
          url: "india-states.geojson",
          link: {
            url: "state_score.json", // Load data from this file
            dataKey: "name", // Join this column from the URL (data)
            mapKey: "ST_NM", // with this property in the GeoJSON
          },
          options: {
            style: {
              fillColor: "#a00",
              fillOpacity: 1,
            },
          },
          tooltip: function (prop) {
            // On hover, show this HTML tooltip
            return prop.ST_NM + ": " + prop.TOT_P;
          },
          attrs: {
            fillColor: {
              // Fill the regions
              metric: "score", // with the "score" column from state_score.json
              scheme: "RdYlGn", // using a RdYlGn gradient
            },
          },
        },
      },
    });
  </script>
</div>
```

**Note**: You can use `type: 'topojson'` when loading TopoJSON maps.

## g1.mapviewer options

- `id`: ID of the map DOM element (example: `mapid`), or the DOM element
- `map`:
  - `options`: supports same options as [Map options](http://leafletjs.com/reference-1.6.0.html#map)
- `layers`: builds layers one on top of another in the specified order.
  - `{layername: {...} }` dict with layer name as keys
  - Each layer MUST have a type. Currently supported types are
    - tile
    - geojson
    - topojson
    - marker (`link`: option is not yet supported )
    - circleMarker
  - `tile` layer MUST have a url: that has the URL template for the leaflet tile layer.
    - `url`: A string of the form - `http://{s}.somedomain.com/blabla/{z}/{x}/{y}{r}.png`
    - `options`: supports same options as [Tile options](http://leafletjs.com/reference-1.6.0.html#tilelayer-minzoom)
  - `geojson` layer MUST have a data as an array of objects or else MUST have a url (string).
    - `url`: String
    - `data`: An array of objects. data: takes preference over url.
    - `options`: supports same options as [GeoJSON options](http://leafletjs.com/reference-1.6.0.html#geojson-style)
    - `link`: adds attributes from input dataset to geojson/topojson
      - `url`: url (String) to fetch data
      - `mapKey`: attribute name in geojson/topojson to match
      - `dataKey`: column name in input dataset that matches with geojson/topojson `mapKey`
      - `mismatch`: `true` (default) / `false` / function. Displays the number of mismatches between `dataKey` and `mapKey`. By default, appears as a label at the bottom left corner of the map. To customise the message, use function
        - function accepts an list of objects. Each object has `status` and all geojson/topojson feature properties:
          - `status`: A boolean value representing whether the geojson/topojson feature found a match from input dataset or not.
    - `popup`: string / function that returns formatted value
    - `popupOptions`: An object with properties and values from [leaflet popup options](https://leafletjs.com/reference-1.3.4.html#popup-l-popup)
    - `tooltip`: string / function that returns formatted value.
      - function(properties) must return a string. feature properties are passed as argument.
    - `tooltipOptions`: An object with properties and values from [leaflet tooltip options](https://leafletjs.com/reference-1.6.0.html#tooltip-option)
      - `direction` property can be a string or function. function is passed the following arguments.
        - `centerPoint` is center coordinates of map view
        - `tooltipPoint` is center coordinates of tooltip
        - `properties` are feature properties
      - NOTE: `tooltip` and `tooltipOptions` are previously (till v0.9.1) are inside `attrs`. This spec breaking change is mage to maintain consistency with `popup` and `popupOptions`
    - `attrs` Data driven styles. same as `options`. (`attrs` take priority over `options`)
      - For `color`, `weight`, `opacity`, `fillColor`, `fillOpacity` properties, the options are:.
        - `metric` string / function
          - If `metric`: is a string, can be any numeric property of geojson
          - To have a metric that is formala based on multiple properties, use function. Example: `function(row) { return row['congress_votes'] - row['bjp_votes']}`
        - `domain` An array of two numbers. Defaults to calculated values of given `metric`.
        - `range`
          - For `fillColor` and `color`, must be a [interpolate color scheme](https://github.com/d3/d3-scale-chromatic#diverging)
  - `topojson` - same as `geojson`
  - `marker` layer MUST have a data as an array of objects or else MUST have a url (string).
    - `url`: String
    - `data`: An array of objects. data: takes preference over url.
    - `latitude`: String (mandatory). Must be column name that contains latitude of marker
    - `longitude`: String (mandatory). Must be column name that contains longitude of marker
    - `options`: supports same options as [marker options](http://leafletjs.com/reference-1.6.0.html#marker-icon)
  - `circleMarker` layer MUST have a data as an array of objects or else MUST have a url (string).
    - `url`: String
    - `data`: An array of objects. data: takes preference over url.
    - `latitude`: String (mandatory). Must be column name that contains latitude of marker
    - `longitude`: String (mandatory). Must be column name that contains longitude of marker
    - `options`: supports same options as [circleMarker options](http://leafletjs.com/reference-1.6.0.html#circlemarker-radius)
    - `attrs` same as `attrs` for `geojson` type layer
- `drilldown`:
  - `rootLayer`: `geojson/topojson` layer that acts as root layer to drilldown further.
  - `levels`: Array of objects that provides layer info
    - `layerName`: Can be a string or function. Function takes argument as `properties` of parentLayer feature
    - `layerOptions`: Same as layer options in `layers` option. If `url` is function, `url` takes argument as `properties` of parentLayer feature
- `legend`: configuration of legend to be added to layer. It requires [d3-legend](https://cdnjs.com/libraries/d3-legend). This creates a `<div class="map-legend">`.
  - `position`: can be `topright`, `topleft`, `bottomleft` or `bottomright`(Defaults to `bottomright`)
  - `format`: accepts d3 formats and applies to legend labels. (Defaults to `d`)
  - `shape`: can be a d3 symbol or an svg path. Default `d3.symbolSquare`
  - `size`: size of legend cell
  - `cells`: number of cells in legend. Default `5`
  - `width`: width of legend
  - `height`: height of legend
  - `scale`: accepts d3 scale format (mandatory). For examples, refer [d3-legend](https://d3-legend.susielu.com/#color-examples)
  - `orient`: orientation of legend. Can be `vertical` (Default) or `horizontal`
  - `shapeWidth`: width of legend cell. Default `20`
  - `shapePadding`: padding of legend cell. Default `20`
  - `labelOffset`: value to determine distance of label from each legend cell. Default `20`

## g1.mapviewer methods

`fitToLayer(layerName, options)`
Zooms map view to fit the layer. Supports same options as [fitBounds options](http://leafletjs.com/reference-1.6.0.html#fitbounds-options)

`zoomHandler(layerName, minZoomLevel, maxZoomLevel(optional) )`
Shows the layer with `layerName` only between `minZoomLevel` and `maxZoomLevel`.

`addNote(options)`
Adds a html label on the map. `options` is an object with following properties

- `html`: html object node
- `style`: Defaults to `bottom-left`. Specify styles for the `html`
- `position`: (Optional) Specifies the position of `html` on the map

`removeLayer(layerName)`
Removes the layer from the map and returns the layer if the layer exists on the map, else throws an error.
Note: This function will remove the layer from the map only. The layer object still exists in memory. Use `addLayer(layerName)` to add the layer back to the map.

`addLayer(layerName, layerConfig)`

- `addLayer(layerName)` if `layerName` layer does not exist on map, adds the layer to the map.
- `addLayer(layerName, layerConfig)` will creates a new layer with `layerConfig` options and adds it to the map.

## g1.mapviewer events

- `layersloaded` is fired when all layers are saved in mapviewer.gLayers (used interally).
  - tooltip is rendered on each layer only after `layersload` is fired
- `layerName + 'loaded'` is fired for each layer with name as `layerName`

<!------------------------------------------------------------------------------------------->

## g1.mapviewer features examples

This creates a set of markers for each row in [cities.json](../mapviewer/cities.json).

```html
<div id="marker-map" style="height:300px">
  <script>
    var map = g1.mapviewer({
      id: "marker-map",
      layers: {
        worldMap: {
          type: "tile",
          url: "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        },
        cityMarkers: {
          type: "marker",
          url: "cities.json",
          latitude: "lat",
          longitude: "long",
        },
      },
    });
  </script>
</div>
```

This creates a set of circle markers for each row in [cities.json](../mapviewer/cities.json).
You can apply styles based on any attribute or function.

```html
<div id="circle-marker-map" style="height:300px">
  <script>
    var map = g1.mapviewer({
      id: "circle-marker-map",
      layers: {
        worldMap: {
          type: "tile",
          url: "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        },
        cityMarkers: {
          type: "circleMarker",
          url: "cities.json",
          latitude: "lat",
          longitude: "long",
          attrs: {
            fillColor: {
              metric: "pollution",
              scheme: "RdYlGn",
            },
          },
        },
      },
    });
  </script>
</div>
```

This adds legend to the map

```html
<div id="choropleth" class="map"></div>
<script>
  var choro_map = g1.mapviewer({
    id: "choropleth",
    legend: {
      position: "topright",
      format: "d",
      shape: d3.symbolCircle,
      size: 100,
      scale: d3
        .scaleLinear()
        .domain([10, 20, 30])
        .range(["red", "yellow", "green"]),
      orient: "horizontal",
      width: 300,
      height: 100,
    },
    layers: {
      worldMap2: {
        type: "tile",
        url: "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      },
      indiaGeojson: {
        type: "geojson",
        url: "india-states.geojson",
        link: {
          url: "state_score.json",
          dataKey: "name",
          mapKey: "ST_NM",
        },
        options: {
          style: {
            fillColor: "#ccc",
            fillOpacity: 1,
          },
        },
        attrs: {
          fillColor: {
            metric: "score",
            scale: "linear",
            domain: [10, 20, 30],
            range: ["red", "yellow", "green"],
          },
        },
      },
    },
  });
</script>
```

Drilldown feature example:

```html
<div id="geojson-map" style="height:300px">
  <script>
    var map = g1.mapviewer({
      id: "geojson-map",
      layers: {
        worldMap: {
          type: "tile",
          url: "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        },
        indiaGeojson: {
          type: "geojson",
          url: "india-states.geojson",
          link: {
            url: "state_score.json", // Load data from this file
            dataKey: "name", // Join this column from the URL (data)
            mapKey: "ST_NM", // with this property in the GeoJSON
          },
          tooltip: function (prop) {
            // On hover, show this HTML tooltip
            return prop.ST_NM + ": " + prop.TOT_P;
          },
          attrs: {
            fillColor: {
              // Fill the regions
              metric: "score", // with the "score" column state_score.json
              range: "RdYlGn", // using a RdYlGn gradient
            },
          },
        },
      },
      drilldown: {
        rootLayer: "indiaGeojson",
        levels: [
          {
            layerName: function (properties) {
              return properties["STATE"] + "-layer";
            },
            layerOptions: {
              url: function (properties) {
                return properties["STATE"] + "-census.json";
              },
              type: "geojson",
              attrs: {
                fillColor: {
                  metric: "DT_CEN_CD",
                  range: "RdYlGn",
                },
              },
              tooltip: function (properties) {
                return "DISTRICT: " + properties["DISTRICT"];
              },
            },
          },
        ],
      },
    });
  </script>
</div>
```

Examples showing usage of mismatch label:

```html
<div class="error-pange"></div>
<div id="mismatch_map" class="map"></div>
<script>
  var custom_mismatch_map = g1.mapviewer({
    id: "custom-mismatch-map",
    layers: {
      indiaGeojson: {
        type: "geojson",
        url: "india-states.geojson",
        link: {
          url: state_scores,
          dataKey: "name",
          mapKey: "ST_NM",
          mismatch: function (mismatch_array) {
            // Render custom message
            var custom_message = `<h2>List of Data Merge Mismatches</h2>`;
            custom_message += `<table>`;
            mismatch_array.forEach(function (obj) {
              custom_message += `<tr><td>${obj.feature.properties.ST_NM}</td></tr>`;
            });
            custom_message += `</table>`;
            $(".error-pane").html(custom_message);
          },
        },
      },
    },
  });
</script>
```
