const express = require("express");
const { Readable } = require("stream");
var axios = require("axios");
const app = express();
const index = "points,lines,multilinestrings,multipolygons,other_relations"; // Replace with your index name
app.use(express.json());
app.post("/api/address", async function (req, res) {
  const { lat, lon } = req.body;
  console.log(req.body);

  axios(config)
    .then(function (response) {
      console.log(response.data["features"][0]["properties"]);
      var point = response.data["features"][0]["properties"];
      var city_names = point["city"].split(" ");
      var n = point["city"];
      if (city_names.length != 0) {
        n = city_names[city_names.length - 1];
      }
      res.status(200).json({
        number: point["housenumber"] ? point["housenumber"] : "",
        street: point["street"] ? point["street"] : "",
        city: point["city"] ? "Stony Brook" : "",
        state: point["state"] ? point["state"] : "",
        country: "US",
      });
    })
    .catch(function (error) {
      console.log(error);
    });
});

app.listen(25000, "0.0.0.0", async () => {
  console.log("search server started");
});

/*
{ lat: 40.91402010038242, lon: -73.13018149999999 }
{ natural: 'tree' }
NOT FOUND
{ lat: 40.918625813424754, lon: -73.12088112969158 }


*/
