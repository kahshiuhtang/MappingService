const express = require("express");
const app = express();
const { Client } = require("@elastic/elasticsearch");
const client = new Client({
  node: "http://64.23.254.233:9200",
});
const pg_client = new Client({
  user: 'renderer',
  host: '146.190.141.61',
  database: 'gis',
  password: 'renderer',
  port: 5432, // Default PostgreSQL port
});

// Connect to the database
pg_client.connect()
  .then(() => {
    console.log('Connected to PostgreSQL database');
  })
  .catch(error => {
    console.error('Error connecting to PostgreSQL database:', error);
  });
app.use(express.json());

app.post("/api/search", async function (req, res) {
  const { bbox, onlyInBox, searchTerm } = req.body;
  const { minLat, minLon, maxLat, maxLon } = bbox;
  const centLat = (parseFloat(maxLat) + parseFloat(minLat)) / 2;
  const centLon = (parseFloat(maxLon) + parseFloat(minLon)) / 2;
  var query = {
    index: idx,
    query: {
     bool:{
      should: [
        {
          match: {
            name: searchTerm,
          },
        },
        {
          match: {
            place: searchTerm,
          },
        },
      ]
     }
    },
    size: 1000,
  };
  var query1 = {
    index: idx,
    query: {
     bool:{
      must: [
        {
          match: {
            other_tags: searchTerm,
          },
        }
      ]
     }
    },
    size: 1000,
  };
  
  if(onlyInBox){
    query = {
        index: idx,
        query: {
         bool:{
          should: [
            {
              match: {
                name: searchTerm,
              },
            },
            {
              match: {
                place: searchTerm,
              },
            },
          ]
         }
        },
        size: 1000,
      };
      query1 = {
        index: idx,
        query: {
         bool:{
          must: [
            {
              match: {
                other_tags: searchTerm,
              },
            },
            
          ],
          filter: {
            geo_bounding_box: {
              geometry: {
                top_left: {
                  "lat": maxLat,
                  "lon": minLon
                },
                bottom_right: {
                  "lat": minLat,
                  "lon": maxLon
                }
              }
            }
          }
         }
        },
        size: 1000,
      };
    query1 = {
        index: idx,
        query: {
         bool:{
          should: [
            {
                match: {
                  other_tags: searchTerm,
                },
              },
          ],
          filter: {
            geo_bounding_box: {
              geometry: {
                top_left: {
                  "lat": maxLat,
                  "lon": minLon
                },
                bottom_right: {
                  "lat": minLat,
                  "lon": maxLon
                }
              }
            }
          }
         }
        },
        size: 1000,
      }
  }
  var idx = "points,lines,multilinestrings,multipolygons,other_relations";
  function hstoreToJson(hstoreString) {
    hstoreString = hstoreString.slice(1, -1);
    const pairs = hstoreString.split('","').map(pair => pair.split('"=>"'));
    const obj = {};
    pairs.forEach(pair => {
        const key = pair[0];
        let value = pair[1];
        value = value.replace(/\\"/g, '"');
        obj[key] = value;
    });
    return obj;
}
  try {
    const result = await client.search(query);
    const result1 = await client.search(query1);
    const results = [];
    var rest = result.hits.hits;
    var rest1  =result1.hits.hits;
    for (var i = 0; i < rest1.length; i++) {
        const curr = rest1[i];
        var coords = curr["_source"]["geometry"]["coordinates"];
        var name = "";
        if(!curr["_source"]["other_tags"]){
            continue;
        }
	    row = hstoreToJson(curr["_source"]["other_tags"])
        console.log(row)
        name += row["addr:housenumber"]
                        ? row["addr:housenumber"] + " "
                        : "";
        name += row["addr:street"] ? row["addr:street"] + ", " : "";
        name += row["addr:city"] ? row["addr:city"] + ", " : "";
        name += row["addr:state"] ? row["addr:state"] + " " : "";
        name += row["addr:postcode"] ? row["addr:postcode"] : "";
        if(name.length == 0) continue
        if(curr["_source"]["geometry"]["type"] == "Point"){
          results.push({
              name: name,
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
          name: name,
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
    for (var i = 0; i < rest.length; i++) {
      const curr = rest[i];
      var coords = curr["_source"]["geometry"]["coordinates"];
      var  name = curr["_source"]["name"]
      if(curr["_source"]["geometry"]["type"] == "Point"){
        results.push({
            name: name,
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
        name: name,
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
