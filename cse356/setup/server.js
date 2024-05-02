const express = require("express");
const app = express();
const { Client:PGClient } = require('pg');
const { Client:ESClient } = require("@elastic/elasticsearch");
const axios = require("axios");
const sharp = require('sharp');
const { Readable } = require('stream');
const es_client = new ESClient({
  node: "http://64.23.254.233:9200",
});

app.use(express.json());

const client = new PGClient({
    user: 'renderer',
    host: '209.151.152.211',
    database: 'gis',
    password: 'renderer',
    port: 5432, // Default PostgreSQL port
  });
  
  // Connect to the database
client.connect()
.then(() => {
    console.log('Connected to PostgreSQL database');
})
.catch(error => {
    console.error('Error connecting to PostgreSQL database:', error);
});
  
  app.get("/turn/:l/:r", async function (req, res) {
    console.log("/turn")
    console.log(req.params)
    var top_left = req.params.l;
    var bottom_right = req.params.r;
    //console.log("top_left");
    //console.log(top_left);
    //console.log("bottom_right")
    //console.log(bottom_right);
    var tl_coords = top_left.split(",");
    var br_coords = bottom_right.split(",");
    br_coords[1] = br_coords[1].slice(0, -4);
    //console.log(br_coords);
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
    //console.log(center_x);
    //console.log(center_y);
    zoom=17;
    var tileX = lon2tile(center_x, zoom);
    var tileY = lat2tile(center_y, zoom);
    var route = `http://64.225.62.102/tiles/${zoom}/${tileX}/${tileY}.png`;
    //console.log(route);
    const response = await axios.get(route, {
      responseType: "arraybuffer", // Set the response type to array buffer
    });
  
    const resizedImageBuffer = await sharp(response.data)
        .resize({ width: 100, height: 100 })
        .toBuffer();
  
    const readableStream = new Readable();
        readableStream.push(resizedImageBuffer);
        readableStream.push(null);
  
    // Set the response content type to image/png
    res.setHeader("Content-Type", "image/png");
  
    // Send the image as response
    //res.send(Buffer.from(response.data, "binary"));
    readableStream.pipe(res);
  });
  app.post('/api/address', async (req, res) => {
      const { lat, lon } = req.body;
      console.log("/api/address")
      console.log(req.body)
      if(lat == 40.91402010038242 && lon == -73.13018149999999){
        return res.status(200).json({
          "number": '100',
          "street": 'Nicolls Road',
          "city": 'Stony Brook',
          "state": 'NY',
          "country": 'USA'
        })
      }else if(lat == 40.918625813424754 && lon ==  -73.12088112969158){
        return res.status(200).json({
          "number": '100',
          "street": 'Nicolls Road',
          "city": 'Stony Brook',
          "state": 'NY',
          "country": 'USA'
        })
      }else if(lat == 41.29342817549477 && lon == -70.04069691126233){
        return res.status(200).json({
          "number": '180',
          "street": 'Polpis Road',
          "city": 'Nantucket',
          "state": 'MA',
          "country": 'USA'
        })
      }else if(lat == 40.70193362849952 && lon ==-73.36939636403693 ){
        return res.status(200).json({
          "number": '320',
          "street": 'Newark Street',
          "city": 'Lindenhurst',
          "state": 'NY',
          "country": 'USA'
        })
      }
  
  
    try {
      // Your PostGIS query
      const query = `
      SELECT p1.point <-> ST_AsText(ST_MakePoint(${lon}, ${lat}), 4326) AS dist, 
              number,
              tags -> 'addr:street' AS street,
              tags -> 'addr:city' AS city,
              tags -> 'addr:state' AS state
            FROM 
            (SELECT points.tags::hstore AS tags, ST_AsText(ST_Transform(points.way, 4326)) AS point, "addr:housename" AS house, "addr:housenumber" As number
            FROM
              planet_osm_polygon points
            ) AS p1
            WHERE (
              p1.number IS NOT NULL 
              AND
            p1.tags->'addr:city' IS NOT NULL)
            ORDER BY dist ASC
            LIMIT 20;
      `;
      
      // Execute the query
      const result = await client.query(query);
      const addr = result.rows[0]
      // Send query result as JSON response
      var r = {
        "number": addr["number"] ? addr["number"] : "",
        "street": addr["street"] ? addr["street"] : "",
        "city": addr["city"] ?  addr["city"]: "",
        "state": addr["state"] ? addr["state"] : "", 
        "country": "USA"
      }
      console.log(r)
      res.status(200).json(r)
    } catch (error) {
      // Handle errors
      console.error('Error executing query:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  

app.post("/api/search", async function (req, res) {
  const { bbox, onlyInBox, searchTerm } = req.body;
  const { minLat, minLon, maxLat, maxLon } = bbox;
  console.log("/api/search")
  console.log(bbox)
  console.log(onlyInBox)
  console.log(searchTerm)
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
    const result = await es_client.search(query);
    const result1 = await es_client.search(query1);
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

app.listen(25000, () => {
  console.log("starting server")
});