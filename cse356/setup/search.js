const express = require("express");
const app = express();
const { Client } = require("@elastic/elasticsearch");
const client = new Client({
  node: "http://64.23.254.233:9200",
});

app.use(express.json());

app.post("/api/search", async function (req, res) {
  const { bbox, onlyInBox, searchTerm } = req.body;
  const { minLat, minLon, maxLat, maxLon } = bbox;
  const centLat = (parseFloat(maxLat) + parseFloat(minLat)) / 2;
  const centLon = (parseFloat(maxLon) + parseFloat(minLon)) / 2;
  var query = null;
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
  var idx = "lines,points,multilinestrings,multipolygons,other_relations";
  try {
    const result = await client.search({
      index: idx,
      query: {
        match: {
          name: searchTerm,
        },
      },
      size: 100,
    });
    const results = [];
    var rest = result.hits.hits;
    for (var i = 0; i < rest.length; i++) {
      const curr = rest[i];
      var coords = curr["_source"]["geometry"]["coordinates"];
      if(curr["_source"]["geometry"]["type"] == "Point"){
        results.push({
            name: curr["_source"]["name"],
            coordinates: {
              lat: coords[1],
              lon: coords[0],
            },
            bbox: {
              minLat: coords[1],
              minLon: coords[0],
              maxLat: coords[1],
              maxLon: coords[0],
            },
          });
        continue
      }
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
