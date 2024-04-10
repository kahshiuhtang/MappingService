const express = require("express");
const axios = require("axios");
const elasticsearchUrl = "http://localhost:9200";
const app = express();
const { Client } = require("@elastic/elasticsearch");
const client = new Client({
  node: "http://localhost:9200",
});
const index = "lines,multilinestrings,multipolygons,other_relations"; // Replace with your index name
app.use(express.json());

app.get("/turn/:l/:r", async function (req, res) {
  var top_left = req.params.l;
  var bottom_right = req.params.r;
  var tl_coords = top_left.split(",");
  var br_coords = bottom_right.split(",");
  br_coords[1] = br_coords[1].slice(0, -4);
  console.log(br_coords);
  tl_coords[0] = parseFloat(tl_coords[0]);
  tl_coords[1] = parseFloat(tl_coords[1]);
  br_coords[0] = parseFloat(br_coords[0]);
  br_coords[1] = parseFloat(br_coords[1]);
  var center_x = (tl_coords[1] + br_coords[1]) / 2;
  var center_y = (tl_coords[0] + br_coords[0]) / 2;
  var zoom = 1;
  function lon2tile(lon, zoom) {
    return Math.floor(((lon + 180) / 360) * Math.pow(2, zoom));
  }
  function lat2tile(lat, zoom) {
    return Math.floor(
      ((1 -
        Math.log(
          Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)
        ) /
          Math.PI) /
        2) *
        Math.pow(2, zoom)
    );
  }
  while (zoom < 20) {
    var tile_x1 = lon2tile(tl_coords[1], zoom);
    var tile_x2 = lon2tile(br_coords[1], zoom);
    var tile_y1 = lat2tile(tl_coords[0], zoom);
    var tile_y2 = lat2tile(br_coords[0], zoom);
    if (tile_x1 != tile_x2 || tile_y1 != tile_y2) {
      break;
    } else {
      zoom++;
    }
  }
  console.log(center_x);
  console.log(center_y);
  var tileX = lon2tile(center_x, zoom);
  var tileY = lat2tile(center_y, zoom);
  var route = `http://209.151.153.52/tiles/${zoom}/${tileX}/${tileY}.png`;
  console.log(route);
  const response = await axios.get(route, {
    responseType: "arraybuffer", // Set the response type to array buffer
  });

  // Set the response content type to image/png
  res.setHeader("Content-Type", "image/png");

  // Send the image as response
  res.send(Buffer.from(response.data, "binary"));
});
app.post("/api/search", async function (req, res) {
  const { bbox, onlyInBox, searchTerm } = req.body;
  const { minLat, minLon, maxLat, maxLon } = bbox;
  const centLat = (parseFloat(maxLat) + parseFloat(minLat)) / 2;
  const centLon = (parseFloat(maxLon) + parseFloat(minLon)) / 2;
  var query = null;
  if (onlyInBox) {
    query = {
      query: {
        bool: {
          should: [
            { match: { name: searchTerm } },
            { match: { place: searchTerm } },
          ],
          filter: {
            geo_shape: {
              geometry: {
                shape: {
                  type: "envelope",
                  coordinates: [
                    [parseFloat(minLon), parseFloat(maxLat)],
                    [parseFloat(maxLon), parseFloat(minLat)],
                  ],
                },
                relation: "intersects",
              },
            },
          },
        },
      },
      _source: {
        includes: ["name", "geometry"],
      },
      sort: [
        {
          geo_distance: {
            coords: {
              lat: centLat,
              lon: centLon,
            },
            order: "asc",
            unit: "km",
            distance_type: "arc",
          },
        },
      ],
    };
  } else {
    query = {
      query: {
        bool: {
          should: [
            { match: { name: searchTerm } },
            { match: { place: searchTerm } },
          ],
        },
      },
      _source: {
        includes: ["name", "geometry"],
      },
      sort: [
        {
          geo_distance: {
            coords: {
              lat: centLat,
              lon: centLon,
            },
            order: "asc",
            unit: "km",
            distance_type: "arc",
          },
        },
      ],
    };
  }
  query = {
    query: {
      bool: {
        should: [
          { match: { name: searchTerm } },
          { match: { place: searchTerm } },
        ],
      },
    },
    _source: {
      includes: ["name", "geometry"],
    },
    sort: [
      {
        _geo_distance: {
          "geometry.coordinates": [centLon, centLat], // [lon, lat]
          order: "asc",
          unit: "km",
          distance_type: "arc",
        },
      },
    ],
  };
  try {
    console.log(query);
    // const results = await client.search({
    //  index: "lines,multilinestrings,multipolygons,other_relations",
    //  body: query
    // })
    const result = await client.search({
      index: "lines,multilinestrings,multipolygons,other_relations",
      query: {
        match: {
          name: searchTerm,
        },
      },
      size: 1000,
    });
    const results = [];
    var rest = result.hits.hits;
    for (var i = 0; i < rest.length; i++) {
      const curr = rest[i];
      var coords = curr["_source"]["geometry"]["coordinates"];
      var _minLat = 1000000000;
      var _minLon = 1000000000;
      var _maxLat = -10000000;
      var _maxLon = -10000000;
      var _centerLon = 0;
      var _centerLat = 0;
      for (var j = 0; j < coords.length; j++) {
        var currPoint = coords[j];
        _minLat = Math.min(parseFloat(currPoint[1]), _minLat);
        _minLon = Math.min(parseFloat(currPoint[0]), _minLon);
        _centerLon += parseFloat(currPoint[0]);
        _centerLat += parseFloat(currPoint[1]);
        _maxLat = Math.max(parseFloat(currPoint[1]), _maxLat);
        _maxLon = Math.max(parseFloat(currPoint[0]), _maxLon);
      }
      _centerLat = _centerLat / coords.length;
      _centerLon = _centerLon / coords.length;
      results.push({
        name: curr["_source"]["name"],
        coordinates: {
          lat: _centerLat,
          lon: _centerLon,
        },
        bbox: {
          minLat: _minLat,
          minLon: _minLon,
          maxLat: _maxLat,
          maxLon: _maxLon,
        },
      });
    }
    res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching data from Elasticsearch:", error);
  }
});

// Call the function to execute the search

app.listen(25000, "0.0.0.0", async () => {
  console.log("search server started");
});
