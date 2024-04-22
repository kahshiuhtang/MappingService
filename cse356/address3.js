const express = require("express");
const { Client } = require("pg");

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
app.post("/api/address", async (req, res) => {
  const { lat, lon } = req.body;
  console.log(req.body);
  try {
    // Your PostGIS query
    const query = `
    SELECT p1.point <-> ST_AsText(ST_MakePoint(${lon}, ${lat}), 4326) AS dist, 
    tags->'addr:unit' AS housenumber,
    tags -> 'addr:street' AS street,
    tags -> 'addr:city' AS city,
    tags -> 'addr:state' AS state,
    tags -> 'addr:postcode' AS zip
    FROM 
    (SELECT points.tags::hstore AS tags, ST_AsText(ST_Transform(points.way, 4326)) AS point
    FROM
    planet_osm_point points
    ) AS p1
    WHERE (p1.tags->'addr:city' IS NOT NULL
    AND p1.tags->'addr:unit' IS NOT NULL
    AND p1.tags->'addr:state' IS NOT NULL
    AND p1.tags->'addr:street' IS NOT NULL)
    ORDER BY dist ASC
    LIMIT 10;
    `;

    // Execute the query
    const result = await client.query(query);
    console.log(result.rows);
    const addr = result.rows[0];
    // Send query result as JSON response
    var r = {
      number: addr["housenumber"] ? addr["housenumber"] : "",
      street: addr["street"] ? addr["street"] : "",
      city: addr["city"] ? addr["city"] : "",
      state: addr["state"] ? addr["state"] : "",
      country: "US",
    };
    console.log(r);
    res.status(200).json(r);
  } catch (error) {
    // Handle errors
    console.error("Error executing query:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Start the server

app.listen(25000, () => {});
