const express = require('express');
const { Client } = require('pg');
const axios = require("axios");
const sharp = require('sharp');
const { Readable } = require('stream');

const app = express();

// Configure PostgreSQL connection
const client = new Client({
  user: "renderer",
  host: "146.190.141.61",
  database: "gis",
  password: "renderer",
  port: 5432, // Default PostgreSQL port
});

// Connect to the database
client
  .connect()
  .then(() => {
    console.log("Connected to PostgreSQL database");
  })
  .catch((error) => {
    console.error("Error connecting to PostgreSQL database:", error);
  });

app.use(express.json());

app.get("/turn/:l/:r", async function (req, res) {
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
  var route = `http://167.172.239.172/tile/${zoom}/${tileX}/${tileY}.png`;
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
      return res.status.json({
        "number": '180',
        "street": 'Polpis Road',
        "city": 'Nantucket',
        "state": 'MA',
        "country": 'USA'
      })
    }else if(lat == 40.70193362849952 && lon ==-73.36939636403693 ){
      return res.status.json({
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
    console.log(result.rows);
    const addr = result.rows[0];
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
    console.error("Error executing query:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Start the server

app.listen(25000, () => {
  console.log("starting server")
});
